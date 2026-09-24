# Margo — full 2D gaze atlas

The user approved the RIFE horizontal experiment and requested the same treatment
for the full gaze range. These 841 WebPs extend the existing 25 generated Margo v3
poses to a **29 × 29** grid. They are interpolated stills, not new photographs or
a reconstructed 3D model. The original 25 files and the approved 15-frame
horizontal experiment remain unchanged in their respective folders.

## Mapping and generation

- `r00-c00.webp` … `r28-c28.webp`, 768 × 768, WebP quality 80.
- Rows increase downward; columns increase toward the viewer's right.
- `r14-c14.webp` is the center. Original 5 × 5 anchors map to indices
  0, 7, 14, 21, 28 on each axis, resized to 768px before interpolation.
- Six intermediate poses between each pair of original neighbors. First RIFE
  fills the horizontal rows, then the vertical gaps between those rows.
- Official [rife-ncnn-vulkan](https://github.com/nihui/rife-ncnn-vulkan), release
  20221029, model `rife-v4.6`. No model or inference runtime ships to the browser.
- Total **27,869,018 bytes (27.87 MB)** for all 841 WebPs. The JSON manifest records
  hashes and dimensions. Original 1400px images are unchanged; these resized
  atlas anchors are not byte-identical to them.

`python3 scripts/cat/build_gaze_atlas.py --engine /path/to/rife-ncnn-vulkan-distribution`
reproduces the grid with Pillow and the official engine. It resumes matching
intermediates under `output/cat-atlas/<build-key>/` and exports to `export/` there.
The build key includes source photos, model weights, size and subdivision count.
Review the output before copying the WebPs and manifest into this folder.

## Runtime

`CatGazeAtlas` draws the requested pose directly onto one canvas, with no dissolve.
The center photograph remains visible until the first decoded frame is ready.
Only nearby poses are fetched, including a short lookahead along the latest
movement; the entire atlas is **not** downloaded before use. The cache retains at
most 36 decoded frames (~81 MiB of RGBA pixels), plus at most four loads in flight,
the canvas and center poster. Evicted ImageBitmaps are explicitly closed.

New input replaces the target immediately. Irrelevant fetches are aborted; stale
decodes cannot repaint an old target. While a requested image is loading or fails,
the last complete image stays visible. Downloads pause while the document is
hidden, and switching versions/unmounting closes the cache. Browser HTTP caching
helps revisiting previous directions. First visits on a slow connection may still
briefly hold a pose until its image arrives.

Interpolation reduces the size of each pose change. It does not correct all
differences in the source photos: fur, whiskers and chest contours can soften or
stretch slightly between anchors, especially in diagonal interiors. At larger
display sizes the 768px export is softer than the original 1400px stack.
