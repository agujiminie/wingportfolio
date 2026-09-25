# Margo stabilized atlas

The 29×29 atlas contains 841 WebPs at 768², q82, totaling 32,359,184 bytes.
`torso.webp` adds 83,302 bytes. Original photos and all atlas hashes remain
unchanged by the runtime alignment revisions below.

## Source generation

- Nine approved original poses: rows/columns 0, 2, 4 from the original 25 images.
  The other 16 originals remain available in the comparison modes.
- At each yaw, uniform scale and translation match head framing to its neutral
  pitch. The manifest records source hashes, measured widths and transforms.
- The source frames already contain a spatial torso join over y=520–624. RIFE
  v4.6 interpolates horizontally, then vertically, from the 3×3 anchors to 29×29.
  Source indices 0/2/4 map to dense indices 0/14/28.
- Rebuild using `scripts/cat/refine_gaze_atlas.py --engine /path/to/rife` with
  Pillow, NumPy and OpenCV. Review outputs in `output/cat-refinement/` before
  copying exports here. Changed source/settings require a fresh work folder.

## Current runtime: identical geometry for both halves

As of 2026-09-25, every direction paints its full source bitmap into the same
canvas bounds, followed by the shared opaque torso at y=624. This is the renderer
previously used on the approved right half, now applied to the left half too.

The left-only 7.5% down-left enlargement, (-10,-8) upper-left translation, and
512–624 scanline neck deformation have been removed along with
`headNeckAlignment.js` and the `fixedNeck` prop. These corrections caused the
left head to change size and the neck/chest to twist as the pointer moved.
There are no runtime pose-dependent scaling, translations, warps, or neck layers.
`data-frame-geometry="source"` identifies the direct rendering path.

The shared torso remains fixed pixel-for-pixel. Source assets, approved right
poses, pointer response, bounded frame cache and idle=false are unchanged.
Source perspective and generated-image differences remain in the photos; using
identical canvas bounds alone is not evidence of identical perceived anatomy.

Playback keeps at most 36 decoded frames and four concurrent requests. It paints
in the pointer rAF, keeps the last complete image on missing downloads, and
ignores stale completions. User input uses the existing 30ms / 0.018 response
profile and sensitivity 1.25. Very slow first downloads can still hold a pose.

## Verification

Review the bottom sweep and matching left/right directions in
`output/cat-symmetric/`. Browser regression checks compare rendered pixels with
the source at identical coordinates (including the previous right-side renderer),
verify fixed lower-body pixels, and exercise response, hold, loading failure and
mode switching. The retained unit tests cover cache and gaze motion behavior.
