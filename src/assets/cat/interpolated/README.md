# Horizontal interpolation sample

This is a **15-frame left / center / right experiment**, not a completed 2D gaze
atlas. It uses the same pointer-to-angle scale as the original grid, clamped to
the middle horizontal range (c1 through c3); vertical input is ignored.

| Output | Source |
| --- | --- |
| `h00.webp` | Exact byte copy of `../r2-c1.webp` |
| `h01.webp`–`h06.webp` | RIFE between r2-c1 and r2-c2 at t = 1/7 … 6/7 |
| `h07.webp` | Exact byte copy of `../r2-c2.webp` |
| `h08.webp`–`h13.webp` | RIFE between r2-c2 and r2-c3 at t = 1/7 … 6/7 |
| `h14.webp` | Exact byte copy of `../r2-c3.webp` |

Generation: [rife-ncnn-vulkan](https://github.com/nihui/rife-ncnn-vulkan), official
macOS release `20221029`, model `rife-v4.6`, Apple M1 Max GPU. Each intermediate
was inferred directly from its two original anchors, not recursively from other
generated intermediates. Input/output canvas: 1400×1400. WebP q80, method 6.
See `manifest.json` for source pairs, interpolation positions and file hashes.

All inference is performed offline. The website does not download a neural model,
call an AI service, run a GPU model, or crossfade images. It only selects decoded
static frames. The 15 exports total 1,458,060 bytes; the 3 originals are duplicates
of existing assets, leaving about 1.11 MB of new image data.

Visual limitations: individual middle frames retain recognizable eyes and ears,
but the original photographs are independently generated. Fur/chest differences
can become local stretching or texture softening rather than disappearing. This
sample is for comparing that tradeoff before making a complete directional atlas.

Working generation script and larger diagnostic PNGs/contact sheet remain at
`output/cat-interpolation/` (git-ignored). Original 25 frames are unchanged.
