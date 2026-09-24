"""Build a dense 2D gaze atlas from the original 5x5 photos using offline RIFE.

Requires Pillow and an existing official rife-ncnn-vulkan distribution. The
original photos and approved horizontal experiment are never overwritten.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import json
from pathlib import Path
import shutil
import subprocess

from PIL import Image


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--engine', type=Path, required=True)
    parser.add_argument('--size', type=int, default=768)
    parser.add_argument('--subdivisions', type=int, default=7)
    parser.add_argument('--workers', type=int, default=2)
    args = parser.parse_args()
    if args.size < 64 or args.subdivisions < 1 or args.workers < 1:
        parser.error('size must be at least 64; subdivisions and workers must be positive')
    root = Path(__file__).resolve().parents[2]
    source = root / 'src/assets/cat'
    engine = args.engine.resolve()
    model = engine / 'rife-v4.6'
    digest = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
    inputs = {path.name: digest(path) for path in sorted(source.glob('r[0-4]-c[0-4].webp'))}
    if len(inputs) != 25:
        parser.error('all 25 original anchors are required')
    configuration = {
        'frameSize': args.size, 'subdivisions': args.subdivisions, 'inputs': inputs,
        'model': {name: digest(model / name) for name in ('flownet.bin', 'flownet.param')},
    }
    build_key = hashlib.sha256(json.dumps(configuration, sort_keys=True).encode()).hexdigest()[:12]
    # Resume only matching sources/settings; changed photos cannot reuse stale PNGs.
    work = root / 'output/cat-atlas' / build_key
    anchors, rows, frames, exports = [work / name for name in ('anchors', 'rows', 'frames', 'export')]
    for folder in (anchors, rows, frames, exports):
        folder.mkdir(parents=True, exist_ok=True)
    step = args.subdivisions
    side = 4 * step + 1
    (work / 'build-config.json').write_text(json.dumps(configuration, indent=2) + '\n')

    for row in range(5):
        for col in range(5):
            with Image.open(source / f'r{row}-c{col}.webp') as image:
                image.convert('RGB').resize((args.size, args.size), Image.Resampling.LANCZOS).save(
                    anchors / f'r{row}-c{col}.png')

    def infer(job):
        first, second, t, output = job
        if output.exists():
            with Image.open(output) as image:
                if image.size == (args.size, args.size):
                    return
        result = subprocess.run([
            str(engine / 'rife-ncnn-vulkan'), '-0', str(first), '-1', str(second),
            '-o', str(output), '-m', str(model), '-s', str(t), '-j', '1:1:1',
        ], capture_output=True, text=True)
        if result.returncode:
            raise RuntimeError(f'{output.name}: {result.stderr[-2000:]}')

    def run_jobs(label, jobs):
        print(f'{label}: {len(jobs)} frames', flush=True)
        with ThreadPoolExecutor(max_workers=args.workers) as pool:
            tasks = [pool.submit(infer, job) for job in jobs]
            for count, task in enumerate(as_completed(tasks), 1):
                task.result()
                if count % 30 == 0 or count == len(tasks):
                    print(f'{label}: {count}/{len(tasks)}', flush=True)

    horizontal = []
    for row in range(5):
        for col in range(side):
            output = rows / f'r{row * step:02d}-c{col:02d}.png'
            if col % step == 0:
                shutil.copy2(anchors / f'r{row}-c{col // step}.png', output)
            else:
                first = anchors / f'r{row}-c{col // step}.png'
                second = anchors / f'r{row}-c{col // step + 1}.png'
                horizontal.append((first, second, (col % step) / step, output))
    run_jobs('Horizontal', horizontal)

    vertical = []
    for row in range(side):
        for col in range(side):
            output = frames / f'r{row:02d}-c{col:02d}.png'
            if row % step == 0:
                shutil.copy2(rows / output.name, output)
            else:
                first = rows / f'r{row // step * step:02d}-c{col:02d}.png'
                second = rows / f'r{(row // step + 1) * step:02d}-c{col:02d}.png'
                vertical.append((first, second, (row % step) / step, output))
    run_jobs('Vertical / diagonal interiors', vertical)

    def export(path):
        target = exports / (path.stem + '.webp')
        with Image.open(path) as image:
            image.convert('RGB').save(target, quality=80, method=6)
        data = target.read_bytes()
        return {'file': target.name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}

    print('Exporting compact WebP atlas', flush=True)
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        records = sorted(pool.map(export, sorted(frames.glob('r*-c*.png'))), key=lambda r: r['file'])
    assert len(records) == side * side
    manifest = {
        'engine': 'rife-ncnn-vulkan', 'release': '20221029', 'model': 'rife-v4.6',
        'source': 'https://github.com/nihui/rife-ncnn-vulkan',
        'order': 'horizontal then vertical; each 5x5 anchor preserved after resizing',
        'gridSize': side, 'subdivisions': step, 'frameSize': args.size,
        'inputHashes': inputs, 'buildKey': build_key,
        'webpQuality': 80, 'frameCount': len(records),
        'totalBytes': sum(r['bytes'] for r in records), 'frames': records,
    }
    (exports / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(f'DONE: {len(records)} frames, {manifest["totalBytes"] / 1e6:.2f} MB in {exports}', flush=True)


if __name__ == '__main__':
    main()
