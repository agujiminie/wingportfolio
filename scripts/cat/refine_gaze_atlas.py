"""Stabilize the approved RIFE atlas without generating a new cat identity.

Uses nine original poses (center + cardinal extremes + corners), similarity-only
head framing and a fixed torso. Requires numpy, OpenCV, Pillow, official RIFE.
Outputs to output/cat-refinement; never overwrites original photos or old atlas.
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
from torso_join import TorsoJoin

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / 'output/cat-refinement'
SIZE = 768
SIDE = 29
STEP = 14


def framing(image, band=(240, 370), neutral_fur=False):
    foreground = image.min(axis=2) < (232 if neutral_fur else 238)
    if not neutral_fur:
        foreground &= np.ptp(image.astype(np.int16), axis=2) > 12
    mask = foreground.astype('uint8') * 255
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    _, labels, stats, _ = cv2.connectedComponentsWithStats(mask)
    mask = labels == 1 + np.argmax(stats[1:, 4])
    spans = []
    for y in range(*band):
        xs = np.flatnonzero(mask[y])
        if len(xs):
            spans.append((xs[0], xs[-1]))
    if len(spans) < (band[1] - band[0]) * 0.9:
        raise ValueError('Framing band must intersect the head in every source pose')
    spans = np.array(spans)
    return float(np.median(spans[:, 1] - spans[:, 0])), float(np.median(spans.mean(axis=1)))


def torso_mask(start=520, end=624):
    # Fully moving above the neck, smooth spatial join, fully fixed below it.
    y = np.arange(SIZE, dtype=np.float32)
    t = np.clip((y - start) / (end - start), 0, 1)
    return (t * t * (3 - 2 * t))[:, None, None]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--engine', type=Path, required=True)
    parser.add_argument('--preview', action='store_true')
    parser.add_argument('--source', type=Path, default=ROOT / 'src/assets/cat')
    parser.add_argument('--work-root', type=Path, default=WORK)
    parser.add_argument('--frame-band', type=int, nargs=2, default=(240, 370))
    parser.add_argument('--neutral-fur', action='store_true', help='Include silver/gray fur in the silhouette')
    parser.add_argument('--torso-blend', type=int, nargs=2, default=(520, 624))
    parser.add_argument('--align-torso-contours', action='store_true', help='Register both chest outlines before blending')
    parser.add_argument('--preserve-head-from', type=Path, help='Keep existing PNG head pixels while replacing the neck join')
    args = parser.parse_args()
    for name, band in [('frame-band', args.frame_band), ('torso-blend', args.torso_blend)]:
        if not 0 <= band[0] < band[1] < SIZE:
            parser.error(f'{name} must satisfy 0 <= START < END < {SIZE}')
    work = args.work_root.resolve()
    source_dir = args.source.resolve()
    folders = {name: work / name for name in ('anchors', 'rows', 'frames', 'export', 'direct')}
    for path in folders.values():
        path.mkdir(parents=True, exist_ok=True)
    engine = args.engine.resolve()
    photos = {}
    provenance = []
    for r in [0, 2, 4]:
        for c in [0, 2, 4]:
            path = source_dir / f'r{r}-c{c}.webp'
            photos[r, c] = np.array(Image.open(path).convert('RGB').resize((SIZE, SIZE), Image.Resampling.LANCZOS))
            provenance.append({'file': path.name, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
    fixed = photos[2, 2].astype(np.float32)
    blend = torso_mask(*args.torso_blend)
    join = TorsoJoin(fixed, *args.torso_blend) if args.align_torso_contours else None
    adjustments = []
    for (r, c), source in photos.items():
        width, cx = framing(source, args.frame_band, args.neutral_fur)
        target_width, target_cx = framing(photos[2, c], args.frame_band, args.neutral_fur)
        scale = target_width / width
        # Uniform x/y scale; no face-mesh deformation or independent-axis stretch.
        transform = np.array([[scale, 0, target_cx - scale * cx], [0, scale, 520 * (1 - scale)]], dtype=np.float32)
        head = cv2.warpAffine(source, transform, (SIZE, SIZE), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_CONSTANT, borderValue=(255, 255, 255))
        combined = join(head) if join else np.rint(head * (1 - blend) + fixed * blend).clip(0, 255).astype('uint8')
        Image.fromarray(combined).save(folders['anchors'] / f'r{r*7:02d}-c{c*7:02d}.png')
        adjustments.append({'row': r*7, 'col': c*7, 'sourceWidth': width, 'targetWidth': target_width,
                            'scale': scale, 'matrix': transform.tolist()})
    sheet = Image.new('RGB', (900, 960), '#eeeeee')
    draw = ImageDraw.Draw(sheet)
    for i, (r, c) in enumerate((r, c) for r in [0, 14, 28] for c in [0, 14, 28]):
        im = Image.open(folders['anchors'] / f'r{r:02d}-c{c:02d}.png').resize((300, 300))
        sheet.paste(im, (i%3*300, i//3*320))
        draw.text((i%3*300+6, i//3*320+302), f'r{r:02d}-c{c:02d}', fill='black')
    sheet.save(work / 'stabilized-anchors.jpg', quality=94)
    (work / 'framing-adjustments.json').write_text(json.dumps(adjustments, indent=2)+'\n')
    configuration = {'inputs': provenance, 'adjustments': adjustments, 'size':SIZE, 'step':STEP,
        'torsoBlend':list(args.torso_blend), 'modelHash':hashlib.sha256((engine/'rife-v4.6/flownet.bin').read_bytes()).hexdigest()}
    if args.neutral_fur or tuple(args.frame_band) != (240, 370):
        configuration.update(frameBand=list(args.frame_band), neutralFur=args.neutral_fur)
    if join:
        configuration['torsoJoin'] = 'registered-contours-v1'
    if args.preserve_head_from:
        preserved = sorted(args.preserve_head_from.glob('r*-c*.png'))
        if len(preserved) != SIDE * SIDE:
            parser.error('--preserve-head-from must contain all 841 matching PNG frames')
        configuration['preservedHeadHashes'] = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in preserved}
    config_path = work/'generation-config.json'
    if config_path.exists() and json.loads(config_path.read_text()) != configuration:
        raise RuntimeError('Sources/settings changed. Use a fresh --work-root to avoid stale intermediates.')
    config_path.write_text(json.dumps(configuration,indent=2)+'\n')

    def infer(job):
        first, second, t, output = job
        if output.exists():
            return
        result = subprocess.run([str(engine/'rife-ncnn-vulkan'), '-0', str(first), '-1', str(second),
            '-o', str(output), '-m', str(engine/'rife-v4.6'), '-s', str(t), '-j', '1:1:1'], capture_output=True, text=True)
        if result.returncode:
            raise RuntimeError(result.stderr[-2000:])

    if args.preview:
        for n in [17, 21, 25]:
            infer((folders['anchors']/'r14-c14.png', folders['anchors']/'r28-c14.png', (n-14)/14, work/f'direct/stable-down-{n}.png'))
        return

    def run(label, jobs):
        with ThreadPoolExecutor(max_workers=2) as pool:
            tasks = [pool.submit(infer, job) for job in jobs]
            for i, task in enumerate(as_completed(tasks), 1):
                task.result()
                if i%60 == 0 or i == len(tasks): print(f'{label}: {i}/{len(tasks)}', flush=True)
    jobs = []
    for r in [0, 14, 28]:
        for c in range(SIDE):
            target = folders['rows'] / f'r{r:02d}-c{c:02d}.png'
            if c % STEP == 0:
                shutil.copy2(folders['anchors']/target.name, target)
            else:
                a = c//STEP*STEP
                jobs.append((folders['anchors']/f'r{r:02d}-c{a:02d}.png', folders['anchors']/f'r{r:02d}-c{a+STEP:02d}.png', (c%STEP)/STEP, target))
    run('Horizontal', jobs)
    jobs = []
    for r in range(SIDE):
        for c in range(SIDE):
            target = folders['frames']/f'r{r:02d}-c{c:02d}.png'
            if r%STEP == 0:
                shutil.copy2(folders['rows']/target.name, target)
            else:
                a = r//STEP*STEP
                jobs.append((folders['rows']/f'r{a:02d}-c{c:02d}.png', folders['rows']/f'r{a+STEP:02d}-c{c:02d}.png', (r%STEP)/STEP, target))
    run('Vertical', jobs)

    def export(path):
        image = np.array(Image.open(path).convert('RGB'))
        # RIFE may alter even static texture. Enforce the same lower torso again.
        image = join(image) if join else np.rint(image*(1-blend)+fixed*blend).clip(0,255).astype('uint8')
        if args.preserve_head_from:
            with Image.open(args.preserve_head_from / path.name) as original:
                head = np.array(original.convert('RGB'))
            # Preserve the already-approved face animation exactly, with a short
            # spatial feather into the rebuilt neck. No additional head motion.
            start, end = args.torso_blend[0], args.torso_blend[0] + 32
            t = np.clip((np.arange(SIZE, dtype=np.float32) - start) / (end - start), 0, 1)
            weight = (t * t * (3 - 2 * t))[:, None, None]
            image = np.rint(head * (1 - weight) + image * weight).clip(0,255).astype('uint8')
            assert np.array_equal(image[:start + 1], head[:start + 1])
        output = folders['export']/(path.stem+'.webp')
        Image.fromarray(image).save(output, quality=82, method=6)
        data = output.read_bytes()
        return {'file': output.name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
    with ThreadPoolExecutor(max_workers=2) as pool:
        records = sorted(pool.map(export, sorted(folders['frames'].glob('r*-c*.png'))), key=lambda x:x['file'])
    torso_path = folders['export']/'torso.webp'
    torso_top = args.torso_blend[1]
    Image.open(folders['export']/'r14-c14.webp').crop((0,torso_top,SIZE,SIZE)).save(torso_path, lossless=True, method=6)
    torso_bytes = torso_path.read_bytes()
    manifest = {'version': 'stabilized-v2', 'gridSize': SIDE, 'frameSize': SIZE, 'frameCount': len(records),
        'engine': 'rife-ncnn-vulkan-20221029 / rife-v4.6', 'keyframeIndices': [0,14,28],
        'method': 'nine original poses; uniform framing; fixed torso; horizontal then vertical RIFE',
        'inputs': provenance, 'adjustments': adjustments, 'torsoBlend': list(args.torso_blend), 'quality':82,
        'totalBytes':sum(x['bytes'] for x in records), 'frames':records,
        'torso':{'file':'torso.webp','top':torso_top,'bytes':len(torso_bytes),'sha256':hashlib.sha256(torso_bytes).hexdigest()}}
    if args.neutral_fur or tuple(args.frame_band) != (240, 370):
        manifest.update(frameBand=list(args.frame_band), neutralFur=args.neutral_fur)
    if join:
        manifest['torsoJoin'] = 'registered-contours-v1'
        manifest['method'] += '; chest silhouettes registered before blending'
    if args.preserve_head_from:
        manifest['preservedHead'] = {'through': args.torso_blend[0], 'featherEnd': args.torso_blend[0] + 32,
                                     'inputHashes': configuration['preservedHeadHashes']}
    (folders['export']/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print(f'DONE: {len(records)} frames, {manifest["totalBytes"]/1e6:.2f} MB', flush=True)


if __name__ == '__main__':
    main()
