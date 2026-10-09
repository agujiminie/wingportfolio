"""Keep the teal toy aligned while the face's residual motion is interpolated."""
import cv2
import numpy as np


def fish_landmarks(image):
    b, g, r = cv2.split(image.astype(np.int16))
    yy, xx = np.indices(r.shape)
    mask = ((b - r > 15) & (g - r > 15) & (yy > 180) & (yy < 510)).astype(np.uint8) * 255
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        raise ValueError('No teal toy found')
    contour = max(contours, key=cv2.contourArea)
    mask[:] = 0
    cv2.drawContours(mask, [contour], -1, 255, -1)
    x, _, width, _ = cv2.boundingRect(contour)
    ys, xs = np.where((mask > 0) & (xx < x + .35 * width))
    top = ys.min()
    tip = [np.median(xs[ys < top + 5]), np.median(ys[ys < top + 5])]
    eye_mask = ((image.max(axis=2) < 85) & (mask > 0) & (xx > x + .65 * width)).astype(np.uint8)
    _, _, stats, centers = cv2.connectedComponentsWithStats(eye_mask)
    if len(stats) < 2:
        raise ValueError('No toy eye found')
    eye = centers[1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])]
    return np.array([tip, eye]), mask


def register_pair(a, b, t):
    pa, _ = fish_landmarks(a)
    pb, _ = fish_landmarks(b)
    target = pa * (1 - t) + pb * t

    def align(image, points):
        angle = np.arctan2(*(target[1] - target[0])[::-1]) - np.arctan2(*(points[1] - points[0])[::-1])
        c, s = np.cos(angle), np.sin(angle)
        matrix = np.array([[c, -s, 0], [s, c, 0]])
        matrix[:, 2] = target.mean(axis=0) - matrix[:, :2] @ points.mean(axis=0)
        return cv2.warpAffine(image, matrix, (image.shape[1], image.shape[0]),
                              flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_CONSTANT,
                              borderValue=(255, 255, 255))

    # No scaling or local facial warp: reduce the gross motion before RIFE.
    return align(a, pa), align(b, pb)


def protect_fish(inferred, a, b, t):
    pa, _ = fish_landmarks(a)
    pb, _ = fish_landmarks(b)
    target = pa * (1 - t) + pb * t

    def align_toy(image, points):
        # The toy's apparent length changes slightly between source views.
        # Match both landmarks exactly for this masked layer only, so its eye
        # cannot split in two. The inferred head is never scaled here.
        scale = np.linalg.norm(target[1] - target[0]) / np.linalg.norm(points[1] - points[0])
        angle = np.arctan2(*(target[1] - target[0])[::-1]) - np.arctan2(*(points[1] - points[0])[::-1])
        c, s = np.cos(angle) * scale, np.sin(angle) * scale
        matrix = np.array([[c, -s, 0], [s, c, 0]])
        matrix[:, 2] = target.mean(axis=0) - matrix[:, :2] @ points.mean(axis=0)
        return cv2.warpAffine(image, matrix, (image.shape[1], image.shape[0]),
                              flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_CONSTANT,
                              borderValue=(255, 255, 255))

    a, b = align_toy(a, pa), align_toy(b, pb)
    _, ma = fish_landmarks(a)
    _, mb = fish_landmarks(b)
    blue, green, red = cv2.split(inferred.astype(np.int16))
    # Include disconnected translucent tail ghosts, not just the largest blob.
    ghost = ((blue - red > 6) & (green - red > 8)).astype(np.uint8) * 255
    ghost[:180] = 0
    ghost[510:] = 0
    mask = cv2.max(cv2.max(ma, mb), ghost)
    mask = cv2.dilate(mask, np.ones((5, 5), np.uint8))
    weight = (cv2.GaussianBlur(mask, (5, 5), 1).astype(float) / 255)[:, :, None]
    registered = cv2.addWeighted(a, 1 - t, b, t, 0)
    return np.rint(inferred * (1 - weight) + registered * weight).clip(0, 255).astype(np.uint8)
