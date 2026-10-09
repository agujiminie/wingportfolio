# Yiko — Cat Style / AI Playground

Yiko is the silver tabby with a white chest and large round pupils, carrying the
approved teal plush fish. The bite stays near one third from its tail, with a
slight slope. No cap or glasses.

## Source directions

`frames/` contains 25 individual 1254 × 1254 WebP photos, quality 90.
`r2-c2.webp` is the approved front preview. Row 0 looks up, row 4 down;
column 0 looks toward the viewer's left, column 4 toward the viewer's right.
These are generated views, not 25 photographs captured by a physical camera.

The original PNGs, exact imagegen prompts, generation paths and review contact
sheet are saved locally in `output/imagegen/yiko-gaze-25-v1/`. Center PNG is a
byte-for-byte copy of the approved `yiko-fish-preview-v5` image. Every other pose
uses that same approved image as its identity reference; the upper-left ear
clearance received one local correction. Originals remain untouched.

## Web animation

`atlas/` contains a 29 × 29, 768px RIFE atlas, the same density as Magu.
It now follows Magu's refinement pipeline: nine source poses (rows/columns
0, 2, 4) are calibrated with uniform scale/translation, then interpolated to
29 × 29. Most intermediate source photos are bypassed; all 25
originals remain available. The nine calibrated anchors map to 0/14/28 on both
axes. Silver fur is measured in y=200–330, including neutral gray pixels.
Calibration keeps the center unchanged and matches up/down head widths to
the same horizontal direction. No temporal crossfade or runtime face scaling.
The earlier v2 lower-torso pass joins spatially at y=520–650 and fixes the body below
y=650. Both chest silhouettes are registered to a shared intermediate contour
before color blending, avoiding two overlapping fur edges at the shoulder.
The v2 neck pass preserves v1 head pixels through y=520 from its PNG frames,
with a short feather through y=552 into the rebuilt neck. No face scaling or
neck overlay runs in the browser; the offline correction affects the chest.
Generated views and interpolated fine fur may retain small visual differences.

The upper-left transition now uses one additional original pose, `r0-c1.webp`,
at atlas `r00-c07`: a uniform calibration matches its framing before it is used
as a midpoint. The previous direct left-up → straight-up interpolation produced
duplicate eyes and a doubled fish tail. Rows 0–13 / columns 1–13 (182 frames)
are rebuilt through the extra anchor. Toward the center, the toy's tail and eye
register the input pair with rotation/translation; a spatial toy guard prevents
RIFE from leaving detached teal ghosts. The browser still draws complete frames
without a temporal opacity transition. That v3 pass leaves the other 659 frames byte-identical.
Each repaired frame rejoins the previous neck at y=480–520 and preserves the
old body below y=520 before WebP encoding. The manifest lists these exceptions
to the v2 head-pixel preservation rule in `preservedHead.exceptFrames`.
Before that join, the head and fish together receive a uniform framing correction
to the previous frame's measured head width/center; this avoids a size jump at
the new midpoint. These offline transforms are recorded in the manifest.

The final v4 neck lock extends the shared, lossless plate up to **y=510** (from
y=650). A short y=450–510 transition registers the moving neck to that plate.
The whole head through y=450 and the original fish pixels are preserved before
encoding. A protected toy mask prevents the neck registration from stretching
the fish or leaving a duplicate edge. All 841 directions now use exactly the
same lower neck/chest in the browser; only the small join beneath the jaw moves.
No new RIFE inference or head framing is done in that pass. The manifest's
`neckLock` records the final guarantees and supersedes the earlier `preservedHead`
range. Re-encoding may slightly change color values, but not head/toy geometry.

The v5 left-neck pass addresses the remaining outward bend during left gaze.
Only the 406 frames in columns 0–13 change. Each frame uses its matching
right-facing pose's unobstructed back-neck contour as a displacement reference,
relative to the same-pitch front pose. This retains the front silhouette's
asymmetry; no texture, face or fish is mirrored. A decaying attachment offset
connects the existing cheek to that contour without introducing an inward notch.
Only neck silhouette bands below y=390 are registered. The central muzzle and
the whole fish are protected, and the lower join settles toward the existing
body over y=450–500. The correction fades toward column 14 for a continuous
center crossing. Columns 14–28 (435 frames) and the shared torso are byte-identical
to v4. This pass supersedes v4's whole-row head-preservation limit for the left
neck only; it does not scale the head, rerun interpolation or change layout.
The manifest's `leftNeckBalance` records its scope and assertions.

Rebuild using the existing official RIFE distribution, NumPy, OpenCV and Pillow:

```sh
output/cat-refinement/venv/bin/python scripts/cat/refine_gaze_atlas.py \
  --engine output/cat-interpolation/tools/rife-ncnn-vulkan-20221029-macos \
  --source src/assets/yiko/frames --work-root output/yiko-refinement-v1 \
  --frame-band 200 330 --neutral-fur --torso-blend 570 650

output/cat-refinement/venv/bin/python scripts/cat/refine_gaze_atlas.py \
  --engine output/cat-interpolation/tools/rife-ncnn-vulkan-20221029-macos \
  --source src/assets/yiko/frames --work-root output/yiko-neck-join-v2 \
  --frame-band 200 330 --neutral-fur --torso-blend 520 650 \
  --align-torso-contours --preserve-head-from output/yiko-refinement-v1/frames

output/cat-refinement/venv/bin/python scripts/cat/repair_yiko_upper_left.py \
  --engine output/cat-interpolation/tools/rife-ncnn-vulkan-20221029-macos \
  --base output/yiko-neck-join-v2/export \
  --base-png output/yiko-refinement-v1/frames \
  --source src/assets/yiko/frames/r0-c1.webp \
  --work-root output/yiko-fish-fix-v3/final

output/cat-refinement/venv/bin/python scripts/cat/lock_yiko_neck.py \
  --source output/yiko-fish-fix-v3/final/export \
  --work-root output/yiko-neck-lock-v4

output/cat-refinement/venv/bin/python scripts/cat/balance_yiko_left_neck.py \
  --source output/yiko-neck-lock-v4/export \
  --work-root output/yiko-left-neck-v5/anchored
```

Copy `output/yiko-left-neck-v5/anchored/export/` into `src/assets/yiko/atlas/`.
The builder checks source hashes/settings before resuming. Use a new work folder
if they change. Each asset's hash,
size and model provenance are recorded in the source and atlas manifests.

Only Cat Style's `playground` tab uses Yiko. Work and Analog retain their current
Magu imagery. All use the shared `CatGazeAtlas` behavior and bottom-centered
layout. The latest size setting is 78%, applying 78/88 to the approved 130% base
for both cats (about 8.2% smaller than the previous 85%), preserving their relative framing.
`idle={false}` holds the last pose when input stops.

Yiko's source includes more chest and a smaller head than Magu's. In the hero,
Yiko therefore uses 1.17× the shared canvas size and moves down by 0.179× that
base size, with the extra lower body clipped at the viewport edge. This matches
the front-facing eye line and apparent head size. The correction is uniform
across every pose and viewport; it does not reshape the head or modify assets.
`YIKO_GAZE.faceAnchor` compensates for this framing so the pointer's neutral
position stays aligned with Magu's. Keep it in sync with the hero CSS.
