import assert from "node:assert/strict";
import { test } from "node:test";
import { isValidPost } from "../functions/shared/posts.js";
import { canonicalPost, plainText, postTextRuns, validTextRuns } from "../functions/shared/textRuns.js";
import { documentFromRuns, runsFromDocument } from "../src/utils/textFormatting.js";

const runs = [
  { text: "A " }, { text: "quiet", bold: true, italic: true }, { text: "\n" },
  { text: "ordinary", underline: true }, { text: " day." },
];

test("canonical runs preserve text, overlapping styles, and line breaks across editor remounts", () => {
  assert.deepEqual(runsFromDocument(documentFromRuns(runs)), runs);
  assert.equal(isValidPost({ type: "text", runs }), true);
  const multiline = [{ text: "Quiet\nand light", italic: true }];
  assert.deepEqual(runsFromDocument(documentFromRuns(multiline)), multiline);
  const paragraphs = { content: [{ content: [{ text: "First." }] }, {}, { content: [{ text: "Third." }] }] };
  assert.equal(plainText(runsFromDocument(paragraphs)), "First.\n\nThird.");
});

test("historical plain and formatted entries remain readable without migration", () => {
  const text = '<script>alert("hello")</script>\nTwo lines.';
  assert.equal(isValidPost({ type: "text", text }), true);
  assert.equal(plainText(postTextRuns({ text })), text);
  const historical = { type: "text", text: plainText(runs), textRuns: runs };
  assert.equal(isValidPost(historical), true);
  assert.deepEqual(postTextRuns(historical), runs);
});

test("new storage uses one canonical representation, also for cached legacy clients", () => {
  assert.deepEqual(canonicalPost({ type: "text", text: "A note" }), { type: "text", runs: [{ text: "A note" }] });
  const legacy = { type: "text", text: "A note", textRuns: [{ text: "A ", bold: true }, { text: "note", bold: true }] };
  const original = structuredClone(legacy);
  assert.deepEqual(canonicalPost(legacy), { type: "text", runs: [{ text: "A note", bold: true }] });
  assert.deepEqual(legacy, original);
  assert.equal(isValidPost({ type: "text", text: "Duplicate", runs: [{ text: "Duplicate" }] }), false);
});

test("server rejects malformed, mixed, oversized, or unsafe run data", () => {
  for (const invalid of [null, [], [{ text: "A note", bold: "true" }], [{ text: "A note", italic: false }],
    [{ text: "A note", html: "<img>" }], [{ text: "" }], [{ text: " " }], [{ text: "x".repeat(20001) }],
  ]) assert.equal(isValidPost({ type: "text", runs: invalid }), false);
  assert.equal(isValidPost({ type: "text", text: "A note", textRuns: [{ text: "Mismatch" }] }), false);
  assert.equal(validTextRuns(runs), true);
  assert.equal(isValidPost({ type: "photo", photoURL: "https://example.com/photo.jpg", runs }), false);
});
