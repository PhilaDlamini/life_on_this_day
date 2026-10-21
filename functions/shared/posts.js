import { validTextRuns } from "./textRuns.js";

// Shared by the reader and privileged publisher: exactly one supported format.
export function isValidPost(post) {
  if (!post || typeof post !== "object" || Array.isArray(post)) return false;
  const allowed = ["type", "text", "textRuns", "photoURL", "thumbnailURL", "alt", "audioURL", "duration", "waveform"];
  if (Object.keys(post).some((key) => !allowed.includes(key))) return false;
  const fields = { photo: "photoURL", text: "text", audio: "audioURL" };
  const contentField = fields[post.type];
  if (!contentField || typeof post[contentField] !== "string" || !post[contentField].trim()) return false;
  if (Object.values(fields).some((field) => field !== contentField && field in post)) return false;
  if ("alt" in post && (post.type !== "photo" || typeof post.alt !== "string")) return false;
  if ("thumbnailURL" in post && (post.type !== "photo" || !validMediaURL(post.thumbnailURL))) return false;
  if (post.type === "audio" && (!Number.isFinite(post.duration) || post.duration <= 0 || post.duration > 60)) return false;
  if ("duration" in post && post.type !== "audio") return false;
  if ("waveform" in post && (post.type !== "audio" || !Array.isArray(post.waveform)
    || post.waveform.length === 0 || post.waveform.length > 64 || post.waveform.some((value) => !Number.isFinite(value) || value < 0 || value > 100))) return false;
  if (post.type === "text" && post.text.length > 20000) return false;
  if ("textRuns" in post && (post.type !== "text" || !validTextRuns(post.text, post.textRuns))) return false;
  if (post.type === "photo" && (post.alt?.length || 0) > 2000) return false;
  if (post.type !== "text" && !validMediaURL(post[contentField])) return false;
  return true;
}

function validMediaURL(value) {
  try { return typeof value === "string" && new URL(value).protocol === "https:"; }
  catch { return false; }
}
