# Margo gaze frames

These are the user's approved **AI-generated Margo v3 images**, based on their
own reference photos. They are not 25 independently photographed poses.
The originals and generation records remain in
`output/imagegen/margo-gaze-v3/`; this folder contains the 25 unchanged WebP exports.

## Direction convention

- `r{row}-c{col}.webp`, with both indices from 0 to 4.
- Row 0 looks up; row 4 looks down.
- Column 0 looks toward the viewer's left; column 4 toward the viewer's right.
- `r2-c2.webp` looks directly at the camera.
- Every image uses the same 1400 × 1400 canvas, WebP quality 80; total ~2.72 MB.
- These exports were upscaled slightly from the 1254 × 1254 generated originals;
  they do not contain native 1400px detail.

Keep framing, image dimensions, exposure and background consistent when replacing
frames. The image's default face anchor is `{ x: 0.5, y: 0.42 }`.
The current generated angles are approximate, not calibrated in degrees. Fur,
whiskers and chest contours vary slightly between frames; the page deliberately
does not hide those differences with blending or transitions.

`catFrames.js` discovers these files automatically. Missing cells use the closest
available direction; with no photos, 25 directional SVG placeholders are used.
At runtime a failed image also falls back to an image that decoded successfully.

An optional horizontal RIFE sample now lives in `interpolated/`. It contains
12 inferred intermediates plus 3 unchanged anchors; see its README for provenance
and limitations. The original 5×5 `r*-c*` glob does not include this subfolder.

The default page now uses the full **29×29** RIFE grid in `atlas/`, after the user
approved the horizontal sample. See that folder's README for the two-axis mapping,
768px export, on-demand loading and interpolation limitations. The original and
buffered 25-frame versions remain available for comparison.

## If replacing these with real photos

Fix the camera on a tripod and lock exposure/focus. Keep the cat's body as still
as practical, against a plain white background. Guide its attention using a toy
around the lens: roughly ±15° / ±30° horizontally and ±10° / ±20° vertically.
A fixed-camera video can be easier to capture; select sharp still frames from it.
Align and crop the chosen frames consistently, using the eyes/nose and stable
body landmarks as guides. Export the same canvas size and filename convention.
