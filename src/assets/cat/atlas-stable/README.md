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

## Current runtime: one continuous neck surface

The former runtime neck/chest reference overlays were removed on 2026-09-24.
Scaling a second neck silhouette over the pose, then covering it with a fixed
chest, created the block-shaped protrusion reported by the user. Matching a few
outline widths did not validate the perceived anatomy or the join.

`headNeckAlignment.js` now renders directly from **one pose image**:

- Keep the approved direction-dependent face correction: up to 7.5% uniform
  enlargement down-left; up to (-10,-8) pixels of upper-left translation.
- Above source y=512, retain that full rigid transform. Through y=512–624,
  smoothly reduce scale/translation to the unchanged body geometry. The mapping
  and its first derivative match at both endpoints; it stays monotonic, so
  no source rows fold or overlap as a second silhouette.
- Render the join into integer destination scanlines, then copy the untransformed
  lower body. This is spatial coordinate interpolation, not a dissolve between
  poses or a superimposed neck photo. Each row samples the same source bitmap.
- Retain the single opaque bottom torso patch at y=624 to remove codec shimmer.
  The two extra reference canvases, their ~4.5 MiB storage, and their startup
  reference requests are gone. `fixedNeck` remains the compatibility flag for
  enabling this continuous attachment; `data-neck-join="continuous"` identifies it.

All coordinates describe the 768px atlas and scale with canvas resolution.
The exact face corrections fade smoothly across neighboring directions. Center,
right and upper poses retain their previously specified scale/offset behavior.
Pointer motion, reduced-motion behavior, cache bounds and idle=false are unchanged.

## Verification and limits

Local before/after comparisons for the user's r28-c00 crop, upper-left, and nearby
poses are in `output/cat-continuous/`. Automated geometry checks cover all 841
indices, endpoint continuity, monotonic sampling, no scanline gaps, and unchanged
lower-body geometry. Browser checks cover actual rendering, pointer response,
stationary input, cache bounds, mode switching and missing center-frame fallback.

This does not promise invariant neck width or flawless anatomy in every generated
source image. Source interpolation can still soften fur and whiskers; the neck
join now uses mild spatial deformation, while the face above it keeps a uniform
transform. The original photos and former atlases remain available for comparison.

Playback keeps at most 36 decoded frames and four concurrent requests. It paints
in the pointer rAF, keeps the last complete image on missing downloads, and
ignores stale completions. User input uses the existing 30ms / 0.018 response
profile and sensitivity 1.25. Very slow first downloads can still hold a pose.
