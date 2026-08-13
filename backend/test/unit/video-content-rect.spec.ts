/**
 * UT-VCR — letterbox-aware coordinate mapping for the screen-share pointer.
 *
 * This is the one piece of the laser pointer that can be subtly wrong in a way
 * nobody notices until two people with different window shapes disagree about
 * where the dot is. The tile renders the capture with `object-contain`, so the
 * picture is centred inside its box with bars on two sides, and coordinates
 * have to be measured against the picture rather than the box.
 *
 * The implementation lives in the frontend; it is pure arithmetic over a couple
 * of DOM properties, so it is mirrored here against a stub rather than pulling a
 * DOM environment into the backend suite.
 */

interface StubVideo {
  videoWidth: number;
  videoHeight: number;
  getBoundingClientRect(): { left: number; top: number; width: number; height: number };
}

// Mirrors frontend/src/lib/video-content-rect.ts.
function videoContentRect(video: StubVideo) {
  const box = video.getBoundingClientRect();
  const { videoWidth: iw, videoHeight: ih } = video;
  if (!iw || !ih) return { offsetX: 0, offsetY: 0, width: box.width, height: box.height };

  const scale = Math.min(box.width / iw, box.height / ih);
  const width = iw * scale;
  const height = ih * scale;
  return { offsetX: (box.width - width) / 2, offsetY: (box.height - height) / 2, width, height };
}

function pointerToNormalized(video: StubVideo, clientX: number, clientY: number) {
  const box = video.getBoundingClientRect();
  const c = videoContentRect(video);
  if (c.width <= 0 || c.height <= 0) return null;

  const x = (clientX - box.left - c.offsetX) / c.width;
  const y = (clientY - box.top - c.offsetY) / c.height;
  if (x < 0 || x > 1 || y < 0 || y > 1) return null;
  return { x, y };
}

function normalizedToOffset(video: StubVideo, x: number, y: number) {
  const c = videoContentRect(video);
  return { left: c.offsetX + x * c.width, top: c.offsetY + y * c.height };
}

const stub = (
  boxW: number,
  boxH: number,
  vidW: number,
  vidH: number,
  left = 0,
  top = 0,
): StubVideo => ({
  videoWidth: vidW,
  videoHeight: vidH,
  getBoundingClientRect: () => ({ left, top, width: boxW, height: boxH }),
});

describe("UT-VCR content rect", () => {
  it("UT-VCR-001: a 16:9 capture in a taller box gets horizontal bars", () => {
    // 800x600 box, 16:9 video -> scale by width, 450 tall, 75px bars top/bottom.
    const rect = videoContentRect(stub(800, 600, 1920, 1080));
    expect(rect.width).toBeCloseTo(800);
    expect(rect.height).toBeCloseTo(450);
    expect(rect.offsetX).toBeCloseTo(0);
    expect(rect.offsetY).toBeCloseTo(75);
  });

  it("UT-VCR-002: a 4:3 capture in a wider box gets vertical bars", () => {
    // 800x600 box, 4:3 video fills exactly; 1000x600 leaves 100px each side.
    const rect = videoContentRect(stub(1000, 600, 1024, 768));
    expect(rect.height).toBeCloseTo(600);
    expect(rect.width).toBeCloseTo(800);
    expect(rect.offsetX).toBeCloseTo(100);
    expect(rect.offsetY).toBeCloseTo(0);
  });

  it("UT-VCR-003: falls back to the whole box before metadata loads", () => {
    const rect = videoContentRect(stub(640, 360, 0, 0));
    expect(rect).toEqual({ offsetX: 0, offsetY: 0, width: 640, height: 360 });
  });
});

describe("UT-VCR pointer mapping", () => {
  it("UT-VCR-004: the centre of the picture is (0.5, 0.5)", () => {
    const v = stub(800, 600, 1920, 1080);
    // Picture spans y=75..525, so its centre is y=300 — same as the box centre.
    expect(pointerToNormalized(v, 400, 300)).toEqual({ x: 0.5, y: 0.5 });
  });

  it("UT-VCR-005: the picture's top edge is y=0, NOT the box's top edge", () => {
    const v = stub(800, 600, 1920, 1080);
    // y=75 is the first row of actual picture.
    const atPictureTop = pointerToNormalized(v, 400, 75);
    expect(atPictureTop?.y).toBeCloseTo(0);

    // Mapping against the box instead would have called this 0.125 — the class
    // of error that puts every dot in the wrong place.
    expect(atPictureTop?.y).not.toBeCloseTo(75 / 600);
  });

  it("UT-VCR-006: SECURITY/CORRECTNESS — a pointer over a letterbox bar is rejected", () => {
    const v = stub(800, 600, 1920, 1080);
    // y=20 is inside the element but above the picture.
    expect(pointerToNormalized(v, 400, 20)).toBeNull();
    // y=580 is below it.
    expect(pointerToNormalized(v, 400, 580)).toBeNull();
  });

  it("UT-VCR-007: the element's own page offset is subtracted", () => {
    const v = stub(800, 600, 1920, 1080, 120, 40);
    // Same relative spot as UT-VCR-004, shifted by the element's position.
    expect(pointerToNormalized(v, 120 + 400, 40 + 300)).toEqual({ x: 0.5, y: 0.5 });
  });

  it("UT-VCR-008: round-trips — normalize then position lands back where it started", () => {
    const v = stub(800, 600, 1920, 1080);
    const norm = pointerToNormalized(v, 300, 200)!;
    const back = normalizedToOffset(v, norm.x, norm.y);
    expect(back.left).toBeCloseTo(300);
    expect(back.top).toBeCloseTo(200);
  });

  it("UT-VCR-009: the same normalized point maps to different pixels on different windows", () => {
    // The whole reason coordinates are normalized: two viewers, two shapes,
    // one agreed position in the picture.
    const wide = stub(1200, 500, 1920, 1080);
    const narrow = stub(500, 700, 1920, 1080);

    const onWide = normalizedToOffset(wide, 0.25, 0.75);
    const onNarrow = normalizedToOffset(narrow, 0.25, 0.75);

    expect(onWide.left).not.toBeCloseTo(onNarrow.left);

    // …but each is a quarter across its own picture.
    const wideRect = videoContentRect(wide);
    const narrowRect = videoContentRect(narrow);
    expect((onWide.left - wideRect.offsetX) / wideRect.width).toBeCloseTo(0.25);
    expect((onNarrow.left - narrowRect.offsetX) / narrowRect.width).toBeCloseTo(0.25);
  });
});
