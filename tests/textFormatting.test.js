import assert from "node:assert/strict";
import { test } from "node:test";
import { isValidPost } from "../functions/shared/posts.js";
import { validTextRuns } from "../functions/shared/textRuns.js";
import { documentFromText, textFromDocument } from "../src/utils/textFormatting.js";

const words = { text: "A quiet\nordinary day.", textRuns: [
  { text: "A " }, { text: "quiet", bold: true, italic: true }, { text: "\n" },
  { text: "ordinary", underline: true }, { text: " day." },
] };

test("formatted runs preserve text, overlapping styles, and line breaks across editor remounts", () => {
  assert.deepEqual(textFromDocument(documentFromText(words)), words);
  assert.equal(isValidPost({ type: "text", ...words }), true);
  const multiline = { text: "Quiet\nand light", textRuns: [{ text: "Quiet\nand light", italic: true }] };
  assert.deepEqual(textFromDocument(documentFromText(multiline)), multiline);
  const paragraphs = { content: [{ content: [{ text: "First." }] }, {}, { content: [{ text: "Third." }] }] };
  assert.equal(textFromDocument(paragraphs).text, "First.\n\nThird.");
});

test("legacy plain text and literal HTML-looking words remain valid content", () => {
  const text = '<script>alert("hello")</script>\nTwo lines.';
  const draft = textFromDocument(documentFromText({ text }));
  assert.equal(draft.text, text);
  assert.equal(isValidPost({ type: "text", text }), true);
});

test("server rejects malformed, mismatched, or unsafe formatting metadata", () => {
  for (const textRuns of [null, [], [{ text: "Other words" }], [{ text: "A note", bold: "true" }],
    [{ text: "A note", italic: false }], [{ text: "A note", html: "<img>" }], [{ text: "" }, { text: "A note" }],
  ]) assert.equal(isValidPost({ type: "text", text: "A note", textRuns }), false);
  assert.equal(validTextRuns(words.text, words.textRuns), true);
  assert.equal(isValidPost({ type: "photo", photoURL: "https://example.com/photo.jpg", textRuns: words.textRuns }), false);
});
