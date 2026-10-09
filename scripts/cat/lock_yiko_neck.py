"""Fix Yiko's lower neck/chest to one plate without changing the moving head.

This pass uses the reviewed atlas as input; it never regenerates head/fish poses.
Neck registration blends at y450..510, with the toy protected at its original
position. The shared lossless plate begins at y510 (formerly y650).
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

from torso_join import TorsoJoin

START, END = 450, 510


def fish_mask(image):
    r, g, b = cv2.split(image.astype(np.int16))
    yy = np.indices(r.shape)[0]
    mask = ((g - r > 12) & (b - r > 12) & (yy > 250) & (yy < 550)).astype(np.uint8) * 255
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        raise ValueError('Cannot protect fish: no teal contour')
    contour = max(contours, key=cv2.contourArea)
    mask[:] = 0
    cv2.drawContours(mask, [contour], -1, 255, -1)
    core = mask > 0
    mask = cv2.dilate(mask, np.ones((7, 7), np.uint8))
    distance = cv2.distanceTransform(255 - mask, cv2.DIST_L2, cv2.DIST_MASK_PRECISE)
    t = np.clip(distance / 6, 0, 1)
    alpha = 1 - t * t * (3 - 2 * t)
    if np.any(alpha[END:] > 0):
        raise ValueError('Protected toy would overlap the fixed plate')
    return core, alpha


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--work-root', type=Path, required=True)
    parser.add_argument('--preview', action='store_true')
    args = parser.parse_args()
    base = args.source.resolve()
    work = args.work_root.resolve()
    export_dir = work / 'export'
    export_dir.mkdir(parents=True, exist_ok=True)
    manifest = json.loads((base / 'manifest.json').read_text())
    config = {'inputManifestHash': sha(base / 'manifest.json'), 'start': START,
              'fixedFrom': END, 'method': 'fixed-neck-with-protected-toy-v1'}
    config_path = work / 'config.json'
    if config_path.exists() and json.loads(config_path.read_text()) != config:
        raise ValueError('Use a fresh work directory for different inputs/settings')
    config_path.write_text(json.dumps(config, indent=2) + '\n')
    center = np.array(Image.open(base / 'r14-c14.webp').convert('RGB'))
    join = TorsoJoin(center, START, END)

    def process(name, write=True):
        image = np.array(Image.open(base / name).convert('RGB'))
        core, protect = fish_mask(image)
        result = join(image, protected_mask=protect)
        assert np.array_equal(result[:START + 1], image[:START + 1])
        assert np.array_equal(result[core], image[core])
        assert np.array_equal(result[END:], center[END:])
        if write:
            output = export_dir / name
            if name == 'r14-c14.webp':
                shutil.copy2(base / name, output)
            else:
                Image.fromarray(result).save(output, quality=82, method=6)
            return {'file': name, 'bytes': output.stat().st_size, 'sha256': sha(output)}
        return result

    # Full ring, including diagonal poses and repaired upper-left midpoint.
    points = [(0, 0), (0, 7), (0, 14), (0, 21), (0, 28), (7, 28), (14, 28), (21, 28),
              (28, 28), (28, 21), (28, 14), (28, 7), (28, 0), (21, 0), (14, 0), (7, 0)]
    sheet = Image.new('RGB', (1280, 1400), '#eeeeee')
    draw = ImageDraw.Draw(sheet)
    for i, (r, c) in enumerate(points):
        name = f'r{r:02}-c{c:02}.webp'
        result = process(name, False)
        Image.fromarray(result).save(work / f'preview-{name}.png')
        image = Image.fromarray(result).resize((320, 320))
        x, y = i % 4 * 320, i // 4 * 350
        sheet.paste(image, (x, y))
        draw.text((x + 5, y + 325), name, fill='black')
    sheet.save(work / 'ring-review.jpg', quality=95)
    if args.preview:
        return

    names = [record['file'] for record in manifest['frames']]
    with ThreadPoolExecutor(max_workers=4) as pool:
        records = list(pool.map(process, names))
    # Lossless runtime plate removes codec shimmer throughout the locked neck.
    torso_path = export_dir / 'torso.webp'
    Image.fromarray(center[END:]).save(torso_path, lossless=True, method=6)
    manifest.update(frames=records, totalBytes=sum(r['bytes'] for r in records),
                    torso={'file': 'torso.webp', 'top': END, 'bytes': torso_path.stat().st_size,
                           'sha256': sha(torso_path)}, torsoBlend=[START, END])
    manifest['neckLock'] = {**config, 'headPreservedThrough': START, 'fishPixelsPreserved': True,
                            'previousTorsoTop': 650}
    manifest['preservedHead']['supersededBy'] = 'neckLock'
    # The previous pass's provenance remains historical; this is the final pass.
    manifest['method'] += '; final shared neck plate y510, protected original head and toy'
    (export_dir / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(f'Locked {len(records)} frames; head/fish/body assertions passed for every frame.', flush=True)


if __name__ == '__main__':
    main()
