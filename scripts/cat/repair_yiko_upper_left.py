"""Repair the upper-left Yiko transition using a real intermediate source pose.

The 9-anchor atlas asks RIFE to bridge too large a change in head roll and fish
position. Add the existing r0-c1 source as a calibrated midpoint, then rebuild
only rows 0..13 / columns 1..13. Preserve the previous neck/body below y=520.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import json
from pathlib import Path
import shutil
import subprocess

import cv2
import numpy as np
from PIL import Image, ImageDraw

from refine_gaze_atlas import framing
from torso_join import TorsoJoin
from fish_motion import register_pair, protect_fish


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--engine', type=Path, required=True)
    parser.add_argument('--base', type=Path, required=True)
    parser.add_argument('--base-png', type=Path, required=True)
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--work-root', type=Path, required=True)
    args = parser.parse_args()
    work = args.work_root.resolve()
    folders = {name: work / name for name in ('rows', 'frames', 'export', 'registered')}
    for folder in folders.values():
        folder.mkdir(parents=True, exist_ok=True)
    old_manifest = json.loads((args.base / 'manifest.json').read_text())
    config = {'baseManifestHash': digest(args.base / 'manifest.json'),
              'sourceHash': digest(args.source), 'method': 'additional-source-anchor-fish-guard-v3',
              'bodyPreservedFrom': 520, 'midpointVerticalOffset': 16,
              'referenceHashes': {name: digest(args.base_png / name)
                                  for name in ['r00-c00.png', 'r00-c14.png'] +
                                  [f'r14-c{c:02}.png' for c in range(1, 14)]},
              'modelHash': digest(args.engine / 'rife-v4.6/flownet.bin')}
    config_path = work / 'repair-config.json'
    if config_path.exists() and json.loads(config_path.read_text()) != config:
        raise ValueError('Use a fresh work folder after changing sources/settings')
    config_path.write_text(json.dumps(config, indent=2) + '\n')

    source = np.array(Image.open(args.source).convert('RGB').resize((768, 768), Image.Resampling.LANCZOS))
    # Manually inspected pupil centers at 768px: match roll/position, never a
    # local eye/face mesh. The small downward offset leaves the ears clear.
    source_eyes = np.array([[290, 216], [416, 247]], dtype=float)
    target_eyes = (np.array([[270, 208], [379, 248]]) + np.array([[310, 194], [443, 195]])) / 2
    angle = np.arctan2(*(target_eyes[1] - target_eyes[0])[::-1]) - np.arctan2(*(source_eyes[1] - source_eyes[0])[::-1])
    c, s = np.cos(angle), np.sin(angle)
    matrix = np.array([[c, -s, 0], [s, c, 0]])
    matrix[:, 2] = target_eyes.mean(axis=0) - matrix[:, :2] @ source_eyes.mean(axis=0)
    rotated = cv2.warpAffine(source, matrix, (768, 768), flags=cv2.INTER_LANCZOS4,
                             borderMode=cv2.BORDER_CONSTANT, borderValue=(255, 255, 255))
    old_mid = np.array(Image.open(args.base / 'r00-c07.webp').convert('RGB'))
    width, cx = framing(rotated, (200, 330), True)
    target_width, target_cx = framing(old_mid, (200, 330), True)
    scale = target_width / width
    calibration = np.array([[scale, 0, target_cx - scale * cx],
                            [0, scale, target_eyes[:, 1].mean() * (1 - scale) + 16]])
    complete = calibration @ np.vstack([matrix, [0, 0, 1]])
    midpoint = cv2.warpAffine(source, complete, (768, 768), flags=cv2.INTER_LANCZOS4,
                              borderMode=cv2.BORDER_CONSTANT, borderValue=(255, 255, 255))
    midpoint = TorsoJoin(old_mid, 480, 520)(midpoint)
    Image.fromarray(midpoint).save(folders['rows'] / 'r00-c07.png')
    (work / 'midpoint-calibration.json').write_text(json.dumps({
        'source': str(args.source), 'matrix': complete.tolist(), 'scale': scale,
        'sourceWidth': width, 'targetWidth': target_width,
    }, indent=2) + '\n')
    for col in [0, 14]:
        shutil.copy2(args.base_png / f'r00-c{col:02}.png', folders['rows'] / f'r00-c{col:02}.png')

    def infer(job):
        a, b, t, output = job
        if output.exists():
            return
        guarded = int(output.stem.split('-c')[1]) > 7
        if guarded:
            aa, bb = register_pair(cv2.imread(str(a)), cv2.imread(str(b)), t)
            a = folders['registered'] / (output.stem + '-a.png')
            b = folders['registered'] / (output.stem + '-b.png')
            cv2.imwrite(str(a), aa)
            cv2.imwrite(str(b), bb)
        subprocess.run([str(args.engine / 'rife-ncnn-vulkan'), '-0', str(a), '-1', str(b),
                        '-o', str(output), '-m', str(args.engine / 'rife-v4.6'),
                        '-s', str(t), '-j', '1:1:1'], check=True, capture_output=True)
        if guarded:
            cv2.imwrite(str(output), protect_fish(cv2.imread(str(output)), aa, bb, t))

    def run(jobs):
        with ThreadPoolExecutor(max_workers=2) as pool:
            futures = [pool.submit(infer, job) for job in jobs]
            for i, future in enumerate(as_completed(futures), 1):
                future.result()
                if i % 30 == 0 or i == len(jobs):
                    print(f'Interpolated {i}/{len(jobs)}', flush=True)

    run([(folders['rows'] / f'r00-c{(0 if c < 7 else 7):02}.png',
          folders['rows'] / f'r00-c{(7 if c < 7 else 14):02}.png', (c % 7) / 7,
          folders['rows'] / f'r00-c{c:02}.png') for c in range(1, 14) if c != 7])
    for col in range(1, 14):
        shutil.copy2(folders['rows'] / f'r00-c{col:02}.png', folders['frames'] / f'r00-c{col:02}.png')
    run([(folders['rows'] / f'r00-c{c:02}.png', args.base_png / f'r14-c{c:02}.png', r / 14,
          folders['frames'] / f'r{r:02}-c{c:02}.png') for r in range(1, 14) for c in range(1, 14)])

    # Unaffected frames remain byte-identical; no full-atlas re-encoding.
    for path in args.base.iterdir():
        if path.is_file():
            shutil.copy2(path, folders['export'] / path.name)
    corrected = []
    head_calibrations = []
    for path in sorted(folders['frames'].glob('r*-c*.png')):
        image = np.array(Image.open(path).convert('RGB'))
        name = path.stem + '.webp'
        previous = np.array(Image.open(args.base / name).convert('RGB'))
        # Keep the approved per-direction head width/center. This is a uniform
        # offline framing correction for the head and toy together, not a face
        # mesh or a direction-dependent browser transform.
        width, cx = framing(image, (200, 330), True)
        target_width, target_cx = framing(previous, (200, 330), True)
        scale = target_width / width
        transform = np.array([[scale, 0, target_cx - scale * cx],
                              [0, scale, 320 * (1 - scale)]])
        image = cv2.warpAffine(image, transform, (768, 768), flags=cv2.INTER_LANCZOS4,
                               borderMode=cv2.BORDER_CONSTANT, borderValue=(255, 255, 255))
        head_calibrations.append({'file': name, 'scale': scale, 'matrix': transform.tolist()})
        image = TorsoJoin(previous, 480, 520)(image)
        assert np.array_equal(image[520:], previous[520:])
        Image.fromarray(image).save(folders['export'] / name, quality=82, method=6)
        corrected.append(name)
    assert len(corrected) == 182
    for record in old_manifest['frames']:
        path = folders['export'] / record['file']
        record.update(bytes=path.stat().st_size, sha256=digest(path))
    old_manifest['totalBytes'] = sum(record['bytes'] for record in old_manifest['frames'])
    old_manifest['method'] += '; upper-left transition subdivided with calibrated original r0-c1; registered toy guard toward center'
    old_manifest['upperLeftRepair'] = {**config, 'frames': corrected,
                                      'anchor': 'r00-c07', 'source': args.source.name,
                                      'headCalibration': head_calibrations}
    old_manifest['preservedHead']['exceptFrames'] = corrected
    (folders['export'] / 'manifest.json').write_text(json.dumps(old_manifest, indent=2) + '\n')
    sheet = Image.new('RGB', (1500, 1680), '#eeeeee')
    draw = ImageDraw.Draw(sheet)
    for i, (r, c) in enumerate((r, c) for r in [0, 3, 7, 11] for c in [1, 4, 7, 10, 13]):
        image = Image.open(folders['export'] / f'r{r:02}-c{c:02}.webp').crop((160, 0, 620, 480)).resize((300, 390))
        x, y = i % 5 * 300, i // 5 * 420
        sheet.paste(image, (x, y))
        draw.text((x + 5, y + 395), f'r{r:02}-c{c:02}', fill='black')
    sheet.save(work / 'transition-review.jpg', quality=94)
    print(f'Exported {len(corrected)} corrected frames; 659 unchanged.', flush=True)


if __name__ == '__main__':
    main()
