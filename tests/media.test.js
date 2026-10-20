import assert from "node:assert/strict";
import test from "node:test";
import { scaledDimensions, validateAudioInfo, MAX_AUDIO_BYTES } from "../src/utils/mediaLimits.js";

test("photo resizing preserves aspect ratio and never enlarges a small photo", () => {
  assert.deepEqual(scaledDimensions(4000, 3000, 1600), { width: 1600, height: 1200 });
  assert.deepEqual(scaledDimensions(3000, 4000, 1600), { width: 1200, height: 1600 });
  assert.deepEqual(scaledDimensions(300, 200, 1600), { width: 300, height: 200 });
});

test("audio accepts up to exactly sixty seconds and five MB", () => {
  assert.doesNotThrow(() => validateAudioInfo({ duration: 60, size: MAX_AUDIO_BYTES }));
  for (const duration of [60.001, Infinity, NaN, 0, -1]) {
    assert.throws(() => validateAudioInfo({ duration, size: 1024 }));
  }
  assert.throws(() => validateAudioInfo({ duration: 20, size: MAX_AUDIO_BYTES + 1 }), /5 MB/);
});
