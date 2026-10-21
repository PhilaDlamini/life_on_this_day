import { plainText, validTextRuns } from "./textRuns.js";

// Shared by the reader and privileged publisher: one supported format, no extra fields.
export function isValidPost(post) {
  if (!post || typeof post !== "object" || Array.isArray(post)) return false;
  const fields = {
    text: ["type", "runs", "text", "textRuns"],
    photo: ["type", "photoURL", "thumbnailURL", "alt"],
    audio: ["type", "audioURL", "duration", "waveform"],
  };
  if (!Object.hasOwn(fields, post.type) || Object.keys(post).some((key) => !fields[post.type].includes(key))) return false;

  if (post.type === "text") {
    if ("runs" in post) {
      if ("text" in post || "textRuns" in post || !validTextRuns(post.runs)) return false;
      const text = plainText(post.runs);
      return Boolean(text.trim()) && text.length <= 20000;
    }
    // Compatibility with existing plain-text and text-plus-formatting entries.
    return typeof post.text === "string" && Boolean(post.text.trim()) && post.text.length <= 20000
      && (!("textRuns" in post) || (validTextRuns(post.textRuns) && plainText(post.textRuns) === post.text));
  }
  if (post.type === "photo") {
    return validMediaURL(post.photoURL)
      && (!("alt" in post) || (typeof post.alt === "string" && post.alt.length <= 2000))
      && (!("thumbnailURL" in post) || validMediaURL(post.thumbnailURL));
  }
  return validMediaURL(post.audioURL) && Number.isFinite(post.duration) && post.duration > 0 && post.duration <= 60
    && (!("waveform" in post) || (Array.isArray(post.waveform) && post.waveform.length > 0 && post.waveform.length <= 64
      && post.waveform.every((value) => Number.isFinite(value) && value >= 0 && value <= 100)));
}

function validMediaURL(value) {
  try { return typeof value === "string" && new URL(value).protocol === "https:"; }
  catch { return false; }
}
