# Margo stabilized atlas — v2

The user reported head-size pumping, body deformation, delayed following and
occasional holds, especially while looking down. This revision keeps the same cat
and 29×29 output grid, but changes the source trajectory and playback response.

## Image treatment

- Nine original poses from the approved 25: rows/columns 0, 2, 4. The other 16
  originals remain intact but are no longer mandatory stops during this morph.
  This avoids forcing the animation through their inconsistent shape/position.
- At each yaw, match the head's framing to the neutral-pitch reference using
  **uniform scale and translation only**. No independent x/y stretch or face mesh.
  The manifest records the source hashes, measured widths and exact transforms.
- Spatially join the moving head to a common torso over y=520–624 of the 768px
  image. The lower body is shared. This is an offline spatial composite, not a
  crossfade between animation frames.
- RIFE v4.6 fills horizontal and vertical directions from this 3×3 source grid,
  with 13 intermediate poses per interval. Original source indices 0/2/4 map to
  dense indices 0/14/28. Intermediate directions are inferred, not calibrated angles.
- 841 WebPs, 768², q82, **32,359,184 bytes**. `torso.webp` adds 83,302 bytes and is
  drawn over the bottom 144px of every displayed pose to remove codec shimmer.
  The original 25 photos and prior `atlas/` remain unchanged for comparison.

Rebuild with `python scripts/cat/refine_gaze_atlas.py --engine /path/to/rife` in an
environment containing Pillow, NumPy and OpenCV. Outputs are in the ignored
`output/cat-refinement/` folder. Source/settings changes invalidate resume; use a
fresh work folder in that case. Review before copying exports here.

## Measurements and remaining limits

Both versions were measured frame by frame (841 each), with enlarged visual
comparison of flagged frames and vertical sweeps. On the center downward sweep,
measured head-width range decreased from **7px to 2px**; the full up/down sweep
decreased from 11px to 2px. These are silhouette-band measurements at 768px,
not anatomical landmarks or a claim that all deformation is eliminated.

Lower-torso canvas pixels are identical across poses after the shared patch loads.
The neck join, fur, whiskers and internal facial features can still soften or
change because the original generated poses are not fully consistent. No new
3D reconstruction or identity generation was performed.

## Playback

`CatGazeAtlas` defaults to this atlas. User tracking uses a 30ms damping constant
and 0.018 units/ms speed cap; idle keeps the slower 65ms / 0.006 profile. Pointer
sensitivity defaults to 1.25, while an explicit pixel `reach` remains authoritative.
The cache is still bounded to 36 decoded frames plus four concurrent loads. The
fixed torso adds ~0.42 MiB decoded pixels. Images remain on-demand, so very slow
first downloads can still hold a pose.

Upcoming poses are prefetched first; useful nearby requests survive small
retargets. While the exact pose decodes, a ready immediate neighbor may stand in.
Late completions are compared to the current target and cannot pull the head
back toward an obsolete one. Drawing happens directly inside the pointer rAF,
without waiting for a React commit. No opacity animation or dissolve is used.

References: [RIFE authors](https://github.com/hzwer/ECCV2022-RIFE),
[OpenCV transforms](https://docs.opencv.org/4.x/d9/d0c/group__calib3d.html),
[requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame).

## Runtime neck lock — 2026-09-23

The default refined renderer now also fixes the **outer neck silhouette**, not
just the bottom torso. In the previous composite the y=480–540 neck band could
still change width by 37–38px between poses, most apparent when looking down-left.

`neckLock.js` creates one shared, spatially masked canvas from the existing center
atlas frame before enabling playback. The sides join over y=416–480, are fully
fixed outside x=204–572 from y=480 onward, and blend inward over 44px. The moving
central muzzle remains exposed. The chest joins over y=584–624; below 624 the
entire torso is fixed. Coordinates describe the 768px atlas and scale with the
render resolution. This does not stretch faces, regenerate photos, or add a
crossfade between poses. The source WebPs and their manifest hashes are unchanged.

The shared layer is prepared once per mount (~2.25 MiB RGBA), drawn only in neck
regions, and released on unmount. The atlas center request shares the HTTP cache;
if that source fails, the approved original center photo supplies the neck. If
both references fail, the center poster stays visible rather than following with
an uncorrected neck. A late torso load only draws its opaque bottom patch, so it
cannot apply the partially transparent neck join twice.

All 841 composited poses were measured in the browser at eight scanlines from
480 to 624. Width range is **0px at every sampled height**; the locked side bands
and lower torso have **zero RGB difference** between poses. The face still turns
and occludes the upper neck naturally; this is not a claim that every visible
fur strand, whisker, or jaw shape is invariant. The existing source interpolation
can still soften fur in the moving/transition areas. Full records are in
`output/cat-neck/frame-audit.json` (ignored local verification output).

## Down-left head/neck alignment — supersedes the silhouette-only fix

The user rejected the prior silhouette-only correction: its sampled width numbers
did not capture the perceived small head and pinched upper neck. The current
renderer therefore **enlarges the head and upper neck together**, rather than
keeping every upper-neck pixel fixed.

- `headNeckAlignment.js` uses a uniform scale of 1–1.075, strongest down-left.
  Horizontal and vertical correction weights are smooth functions of direction;
  no isolated frame receives a sudden size change. Center/right and upward poses
  retain scale 1. The reference pivot is (384,512) in the 768px image.
- The existing neck reference layer receives exactly the same transform as the
  face image. No facial mesh or independent-axis stretching is used.
- A second shared reference layer joins y=560–624 to the stationary chest; the
  bottom torso is still unchanged. Both layers are prepared once and released on
  unmount, adding ~4.5 MiB total RGBA storage instead of the prior ~2.25 MiB.
- The earlier 0px upper-neck width result describes the previous version only.
  It is not an acceptance criterion for this new, intentionally enlarged pose.
- Original photos, atlas frames and hashes remain unchanged. Local comparison,
  interaction checks and build output are in `output/cat-alignment/`.
