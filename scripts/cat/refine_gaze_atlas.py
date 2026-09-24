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

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / 'output/cat-refinement'
SIZE = 768
SIDE = 29
STEP = 14


def framing(image):
    mask = ((image.min(axis=2) < 238) & (np.ptp(image.astype(np.int16), axis=2) > 12)).astype('uint8') * 255
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    _, labels, stats, _ = cv2.connectedComponentsWithStats(mask)
    mask = labels == 1 + np.argmax(stats[1:, 4])
    spans = []
    for y in range(240, 370):
        xs = np.flatnonzero(mask[y])
        spans.append((xs[0], xs[-1]))
    spans = np.array(spans)
    return float(np.median(spans[:, 1] - spans[:, 0])), float(np.median(spans.mean(axis=1)))


def torso_mask():
    # Fully moving above the neck, smooth spatial join, fully fixed below it.
    y = np.arange(SIZE, dtype=np.float32)
    t = np.clip((y - 520) / 104, 0, 1)
    return (t * t * (3 - 2 * t))[:, None, None]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--engine', type=Path, required=True)
    parser.add_argument('--preview', action='store_true')
    args = parser.parse_args()
    folders = {name: WORK / name for name in ('anchors', 'rows', 'frames', 'export', 'direct')}
    for path in folders.values():
        path.mkdir(parents=True, exist_ok=True)
    engine = args.engine.resolve()
    photos = {}
    provenance = []
    for r in [0, 2, 4]:
        for c in [0, 2, 4]:
            path = ROOT / 'src/assets/cat' / f'r{r}-c{c}.webp'
            photos[r, c] = np.array(Image.open(path).convert('RGB').resize((SIZE, SIZE), Image.Resampling.LANCZOS))
            provenance.append({'file': path.name, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
    fixed = photos[2, 2].astype(np.float32)
    blend = torso_mask()
    adjustments = []
    for (r, c), source in photos.items():
        width, cx = framing(source)
        target_width, target_cx = framing(photos[2, c])
        scale = target_width / width
        # Uniform x/y scale; no face-mesh deformation or independent-axis stretch.
        transform = np.array([[scale, 0, target_cx - scale * cx], [0, scale, 520 * (1 - scale)]], dtype=np.float32)
        head = cv2.warpAffine(source, transform, (SIZE, SIZE), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_CONSTANT, borderValue=(255, 255, 255))
        combined = np.rint(head * (1 - blend) + fixed * blend).clip(0, 255).astype('uint8')
        Image.fromarray(combined).save(folders['anchors'] / f'r{r*7:02d}-c{c*7:02d}.png')
        adjustments.append({'row': r*7, 'col': c*7, 'sourceWidth': width, 'targetWidth': target_width,
                            'scale': scale, 'matrix': transform.tolist()})
    sheet = Image.new('RGB', (900, 960), '#eeeeee')
    draw = ImageDraw.Draw(sheet)
    for i, (r, c) in enumerate((r, c) for r in [0, 14, 28] for c in [0, 14, 28]):
        im = Image.open(folders['anchors'] / f'r{r:02d}-c{c:02d}.png').resize((300, 300))
        sheet.paste(im, (i%3*300, i//3*320))
        draw.text((i%3*300+6, i//3*320+302), f'r{r:02d}-c{c:02d}', fill='black')
    sheet.save(WORK / 'stabilized-anchors.jpg', quality=94)
    (WORK / 'framing-adjustments.json').write_text(json.dumps(adjustments, indent=2)+'\n')
    configuration = {'inputs': provenance, 'adjustments': adjustments, 'size':SIZE, 'step':STEP,
        'torsoBlend':[520,624], 'modelHash':hashlib.sha256((engine/'rife-v4.6/flownet.bin').read_bytes()).hexdigest()}
    config_path = WORK/'generation-config.json'
    if config_path.exists() and json.loads(config_path.read_text()) != configuration:
        raise RuntimeError('Sources/settings changed. Use a fresh output/cat-refinement work folder to avoid stale intermediates.')
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
            infer((folders['anchors']/'r14-c14.png', folders['anchors']/'r28-c14.png', (n-14)/14, WORK/f'direct/stable-down-{n}.png'))
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
        image = np.rint(image*(1-blend)+fixed*blend).clip(0,255).astype('uint8')
        output = folders['export']/(path.stem+'.webp')
        Image.fromarray(image).save(output, quality=82, method=6)
        data = output.read_bytes()
        return {'file': output.name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
    with ThreadPoolExecutor(max_workers=2) as pool:
        records = sorted(pool.map(export, sorted(folders['frames'].glob('r*-c*.png'))), key=lambda x:x['file'])
    torso_path = folders['export']/'torso.webp'
    Image.open(folders['export']/'r14-c14.webp').crop((0,624,SIZE,SIZE)).save(torso_path, lossless=True, method=6)
    torso_bytes = torso_path.read_bytes()
    manifest = {'version': 'stabilized-v2', 'gridSize': SIDE, 'frameSize': SIZE, 'frameCount': len(records),
        'engine': 'rife-ncnn-vulkan-20221029 / rife-v4.6', 'keyframeIndices': [0,14,28],
        'method': 'nine original poses; uniform framing; fixed torso; horizontal then vertical RIFE',
        'inputs': provenance, 'adjustments': adjustments, 'torsoBlend': [520,624], 'quality':82,
        'totalBytes':sum(x['bytes'] for x in records), 'frames':records,
        'torso':{'file':'torso.webp','top':624,'bytes':len(torso_bytes),'sha256':hashlib.sha256(torso_bytes).hexdigest()}}
    (folders['export']/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print(f'DONE: {len(records)} frames, {manifest["totalBytes"]/1e6:.2f} MB', flush=True)


if __name__ == '__main__':
    main()
