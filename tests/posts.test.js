import assert from "node:assert/strict";
import test from "node:test";
import { isDateKey, isValidPost } from "../src/utils/posts.js";

test("remote date keys must be real local dates", () => {
  assert.equal(isDateKey("2024-02-29"), true);
  for (const key of ["2026-02-29", "2026-13-01", "2026-10-32", "not-a-date"]) {
    assert.equal(isDateKey(key), false);
  }
});

test("remote entries contain exactly one matching format", () => {
  for (const post of [
    { type: "text", text: "A note." },
    { type: "photo", photoURL: "https://example.com/photo.jpg", alt: "A view" },
    { type: "audio", audioURL: "https://example.com/memo.m4a", duration: 12 },
  ]) assert.equal(isValidPost(post), true);

  for (const post of [
    null, {}, { type: "text", text: "  " },
    { type: "text", text: "A note.", audioURL: "https://example.com/memo.m4a" },
    { type: "audio", audioURL: "https://example.com/memo.m4a", alt: "Photo only" },
    { type: "photo", photoURL: "javascript:alert(1)" },
    { type: "photo", photoURL: "http://example.com/photo.jpg" },
  ]) assert.equal(isValidPost(post), false);
});
