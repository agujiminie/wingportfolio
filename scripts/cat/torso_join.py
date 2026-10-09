"""Join a moving neck to the fixed torso without two overlapping silhouettes.

Both lower-body contours meet at the same intermediate outline before colors
are blended. All pixels above START are untouched; the face is never warped.
"""
import cv2
import numpy as np


def body_edges(image):
    mask = (image.min(axis=2) < 232).astype('uint8') * 255
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    _, labels, stats, _ = cv2.connectedComponentsWithStats(mask)
    mask = labels == 1 + np.argmax(stats[1:, 4])
    edges = np.full((image.shape[0], 2), np.nan, dtype=np.float32)
    for y, row in enumerate(mask):
        xs = np.flatnonzero(row)
        if xs.size:
            edges[y] = xs[0], xs[-1]
    ys = np.arange(len(edges))
    for axis in range(2):
        valid = np.isfinite(edges[:, axis])
        edges[:, axis] = np.interp(ys, ys[valid], edges[valid, axis])
    # Ignore individual projecting hairs when registering the chest outline.
    padded = np.pad(edges, ((8, 8), (0, 0)), mode='edge')
    edges = np.median(np.lib.stride_tricks.sliding_window_view(padded, 17, axis=0), axis=-1)
    return cv2.GaussianBlur(edges.astype(np.float32), (1, 17), 0, sigmaY=4)


class TorsoJoin:
    def __init__(self, fixed, start=520, end=650):
        self.fixed = fixed.astype(np.uint8)
        self.start, self.end = start, end
        self.fixed_edges = body_edges(self.fixed)
        h, w = fixed.shape[:2]
        y = np.arange(h, dtype=np.float32)
        t = np.clip((y - start) / (end - start), 0, 1)
        self.weight = t * t * t * (t * (t * 6 - 15) + 10)
        self.x, self.y = np.meshgrid(np.arange(w, dtype=np.float32), y)

    def __call__(self, moving, protected_mask=None):
        moving = moving.astype(np.uint8)
        edges = body_edges(moving)
        weight = self.weight[:, None]
        target = edges * (1 - weight) + self.fixed_edges * weight

        def align(image, original):
            factor = (original[:, 1] - original[:, 0]) / np.maximum(1, target[:, 1] - target[:, 0])
            map_x = original[:, :1] + (self.x - target[:, :1]) * factor[:, None]
            map_x = map_x.astype(np.float32)
            return cv2.remap(image, map_x, self.y, cv2.INTER_LANCZOS4,
                             borderMode=cv2.BORDER_CONSTANT, borderValue=(255, 255, 255)), map_x

        (a, map_x), (b, _) = align(moving, edges), align(self.fixed, self.fixed_edges)
        if protected_mask is not None:
            projected = cv2.remap(protected_mask, map_x, self.y, cv2.INTER_LINEAR)
            # Do not leave a second warped toy outside its original silhouette.
            guard = ((protected_mask > .001) | (projected > .001))[:, :, None]
            a = np.where(guard, moving, a)
        weight = weight[:, :, None]
        result = np.rint(a * (1 - weight) + b * weight).clip(0, 255).astype(np.uint8)
        if protected_mask is not None:
            protect = protected_mask[:, :, None]
            result = np.rint(result * (1 - protect) + moving * protect).clip(0, 255).astype(np.uint8)
        result[:self.start + 1] = moving[:self.start + 1]
        result[self.end:] = self.fixed[self.end:]
        return result
