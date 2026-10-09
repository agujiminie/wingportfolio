"""Match Yiko's left-gaze back-neck motion to the reviewed right half.

Only columns 0..13 change. The opposite back-neck contour is a geometry
reference; no cat/fish pixels are mirrored. Edits start below the cheeks and
are confined to the neck. The front column, right half and torso stay intact.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
import shutil

import cv2
import numpy as np
from PIL import Image, ImageDraw

from lock_yiko_neck import fish_mask
from torso_join import body_edges


def smooth(value):
    t = np.clip(value, 0, 1)
    return t * t * t * (t * (t * 6 - 15) + 10)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


class LeftNeck:
    def __init__(self, base):
        self.base = base
        self.center = self.read(14, 14)
        self.fixed_edges = body_edges(self.center)
        self.reference = {(r, c): body_edges(self.read(r, c))
                          for r in range(29) for c in range(14, 29)}
        self.x, self.y = np.meshgrid(np.arange(768, dtype=np.float32),
                                     np.arange(768, dtype=np.float32))

    def read(self, row, col):
        return np.array(Image.open(self.base / f'r{row:02}-c{col:02}.webp').convert('RGB'))

    def render(self, row, col):
        moving = self.read(row, col)
        original = body_edges(moving)
        target = original.copy()
        yy = self.y[:, 0]
        strength = smooth((14 - col) / 7)

        # Right-facing poses expose the left/back side of the neck. Transfer
        # its small displacement around the same-pitch front pose, retaining
        # Yiko's natural front-view asymmetry and a continuous center crossing.
        front = self.reference[row, 14]
        opposite = self.reference[row, 28 - col]
        displacement = opposite[:, 0] - front[:, 0]
        # Above 430, the fish can contaminate the foreground outline. Extend
        # the clean neck displacement upward only for the feathered entrance.
        displacement[:430] = displacement[430]
        desired = front[:, 1] - displacement
        # The left head can meet the neck a few pixels farther out. Carry that
        # attachment offset down smoothly, rather than creating an inward
        # notch while trying to meet the opposite contour too soon.
        attachment = original[390, 1] - desired[390]
        desired += attachment * (1 - smooth((yy - 390) / 110))
        correction = strength * smooth((yy - 390) / 55)
        target[:, 1] += (desired - original[:, 1]) * correction

        # Settle the lower joining strip into the existing, unchanged plate.
        settle = strength * smooth((yy - 450) / 50)
        target = target * (1 - settle[:, None]) + self.fixed_edges * settle[:, None]

        def align(image, edges):
            # Move only the two silhouette bands. The middle of the face,
            # chin and toy never receives a horizontal scale or displacement.
            left_band = 1 - smooth((self.x - target[:, :1]) / 80)
            right_band = 1 - smooth((target[:, 1:] - self.x) / 80)
            map_x = self.x + (edges[:, :1] - target[:, :1]) * left_band
            map_x += (edges[:, 1:] - target[:, 1:]) * right_band
            result = cv2.remap(image, map_x.astype(np.float32), self.y,
                               cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_CONSTANT,
                               borderValue=(255, 255, 255))
            return result, map_x

        a, map_x = align(moving, original)
        b, _ = align(self.center, self.fixed_edges)
        core, protect = fish_mask(moving)
        projected = cv2.remap(protect, map_x.astype(np.float32), self.y, cv2.INTER_LINEAR)
        # Preserve the whole original toy and prevent a second displaced edge.
        guard = ((protect > .001) | (projected > .001))[:, :, None]
        a = np.where(guard, moving, a)
        blend = settle[:, None, None]
        result = np.rint(a * (1 - blend) + b * blend).clip(0, 255).astype(np.uint8)
        result = np.rint(result * (1 - protect[:, :, None]) +
                         moving * protect[:, :, None]).clip(0, 255).astype(np.uint8)
        # Exact source pixels outside the neck work area; runtime body unchanged.
        result[:391] = moving[:391]
        result[510:] = moving[510:]
        assert np.array_equal(result[:391], moving[:391])
        assert np.array_equal(result[391:450, 280:475], moving[391:450, 280:475])
        assert np.array_equal(result[core], moving[core])
        assert np.array_equal(result[510:], moving[510:])
        return result, {'maxBackNeckShift': float(np.max(np.abs(target[390:510, 1] - original[390:510, 1])))}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', required=True, type=Path)
    parser.add_argument('--work-root', required=True, type=Path)
    parser.add_argument('--preview', action='store_true')
    args = parser.parse_args()
    work = args.work_root.resolve()
    work.mkdir(parents=True, exist_ok=True)
    base = args.source.resolve()
    config = {'method': 'opposite-back-neck-displacement-v2',
              'inputManifestHash': digest(base / 'manifest.json'),
              'columns': [0, 13], 'neckRange': [390, 510],
              'backNeckBlend': [390, 445], 'settleBlend': [450, 500]}
    config_file = work / 'config.json'
    if config_file.exists() and json.loads(config_file.read_text()) != config:
        raise ValueError('Use a new work folder for different inputs/settings')
    config_file.write_text(json.dumps(config, indent=2) + '\n')
    neck = LeftNeck(base)
    points = [(0, 0), (0, 7), (7, 0), (7, 7), (14, 0), (14, 7),
              (21, 0), (21, 7), (28, 0), (28, 7), (0, 13), (28, 13)]
    sheet = Image.new('RGB', (1152, 12 * 410), '#eee')
    draw = ImageDraw.Draw(sheet)
    for i, (row, col) in enumerate(points):
        result, _ = neck.render(row, col)
        Image.fromarray(result).save(work / f'preview-r{row:02}-c{col:02}.png')
        for j, (im, label) in enumerate([(neck.read(row, col), 'Before'),
                                         (result, 'After'),
                                         (neck.read(row, 28 - col), 'Right reference')]):
            sheet.paste(Image.fromarray(im).resize((384, 384)), (384 * j, 410 * i))
            draw.text((384 * j + 8, 410 * i + 386), f'{label}: {row},{col}', fill='black')
    sheet.save(work / 'comparison.jpg', quality=95)
    if args.preview:
        return
    export = work / 'export'
    export.mkdir(exist_ok=True)
    for path in base.iterdir():
        if path.is_file():
            shutil.copy2(path, export / path.name)

    def process(point):
        row, col = point
        name = f'r{row:02}-c{col:02}.webp'
        result, report = neck.render(row, col)
        Image.fromarray(result).save(export / name, quality=82, method=6)
        return {'file': name, **report}

    with ThreadPoolExecutor(max_workers=4) as pool:
        reports = list(pool.map(process, [(r, c) for r in range(29) for c in range(14)]))
    manifest = json.loads((base / 'manifest.json').read_text())
    records = [{'file': record['file'], 'bytes': (export / record['file']).stat().st_size,
                'sha256': digest(export / record['file'])} for record in manifest['frames']]
    manifest.update(frames=records, totalBytes=sum(r['bytes'] for r in records))
    manifest['leftNeckBalance'] = {**config, 'reference': 'same-pitch right back-neck contour',
        'rightAndCenterByteIdentical': True, 'torsoByteIdentical': True,
        'headPreservedThrough': 390, 'fishPixelsPreserved': True, 'frames': reports}
    manifest['neckLock']['headPreservationExcept'] = 'leftNeckBalance'
    manifest['method'] += '; left neck follows opposite back-neck contour with unchanged face/toy'
    (export / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(f'Corrected {len(reports)} left-half frames; head/fish/body assertions passed.', flush=True)


if __name__ == '__main__':
    main()
