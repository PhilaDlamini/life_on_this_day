import { dateFromKey, dateKey } from "./calendar.js";

export function isDateKey(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    && dateKey(dateFromKey(value)) === value;
}

// Ignore malformed remote entries rather than breaking the public calendar.
export function isValidPost(post) {
  if (!post || typeof post !== "object") return false;
  const fields = { photo: "photoURL", text: "text", audio: "audioURL" };
  const contentField = fields[post.type];
  if (!contentField || typeof post[contentField] !== "string" || !post[contentField].trim()) return false;
  if (Object.values(fields).some((field) => field !== contentField && field in post)) return false;
  if ("alt" in post && (post.type !== "photo" || typeof post.alt !== "string")) return false;
  if ("thumbnailURL" in post && (post.type !== "photo" || !validMediaURL(post.thumbnailURL))) return false;
  if (post.type === "audio" && (!Number.isFinite(post.duration) || post.duration <= 0 || post.duration > 60)) return false;
  if ("duration" in post && post.type !== "audio") return false;
  if ("waveform" in post && (post.type !== "audio" || !Array.isArray(post.waveform)
    || post.waveform.length > 64 || post.waveform.some((value) => !Number.isFinite(value) || value < 0 || value > 100))) return false;
  if (post.type !== "text" && !validMediaURL(post[contentField])) return false;
  return true;
}

function validMediaURL(value) {
  try { return typeof value === "string" && new URL(value).protocol === "https:"; }
  catch { return false; }
}
