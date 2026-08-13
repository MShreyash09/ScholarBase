/**
 * Where the picture actually sits inside a `<video object-contain>` element.
 *
 * The screen-share tile letterboxes: a 16:9 capture in a taller box leaves bars
 * above and below, and the picture occupies only part of the element. Pointer
 * coordinates therefore have to be measured against the *picture*, not the
 * element — mapping to the element box puts every dot offset by the bar height,
 * and the error changes with each viewer's window shape.
 *
 * Returns offsets and size in CSS pixels relative to the element's top-left.
 */
export interface VideoContentRect {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

export function videoContentRect(video: HTMLVideoElement): VideoContentRect {
  const box = video.getBoundingClientRect();
  const intrinsicW = video.videoWidth;
  const intrinsicH = video.videoHeight;

  // Before metadata loads there is no aspect ratio to honour, so treat the
  // whole element as the picture rather than dividing by zero.
  if (!intrinsicW || !intrinsicH) {
    return { offsetX: 0, offsetY: 0, width: box.width, height: box.height };
  }

  // object-contain scales to fit, preserving aspect ratio.
  const scale = Math.min(box.width / intrinsicW, box.height / intrinsicH);
  const width = intrinsicW * scale;
  const height = intrinsicH * scale;

  return {
    offsetX: (box.width - width) / 2,
    offsetY: (box.height - height) / 2,
    width,
    height,
  };
}

/**
 * Pointer position -> normalized picture coordinates, or null when the pointer
 * is over a letterbox bar rather than the picture itself.
 */
export function pointerToNormalized(
  video: HTMLVideoElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } | null {
  const box = video.getBoundingClientRect();
  const content = videoContentRect(video);
  if (content.width <= 0 || content.height <= 0) return null;

  const x = (clientX - box.left - content.offsetX) / content.width;
  const y = (clientY - box.top - content.offsetY) / content.height;

  if (x < 0 || x > 1 || y < 0 || y > 1) return null;
  return { x, y };
}

/** Normalized picture coordinates -> CSS pixels within the element, for
 * positioning an overlay dot. */
export function normalizedToOffset(
  video: HTMLVideoElement,
  x: number,
  y: number,
): { left: number; top: number } {
  const content = videoContentRect(video);
  return {
    left: content.offsetX + x * content.width,
    top: content.offsetY + y * content.height,
  };
}
