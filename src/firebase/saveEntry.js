import { journalDay } from "../../functions/shared/journalDay.js";
import { commitPost } from "./publish.js";
import { uploadMedia } from "./storage.js";

// Files finish uploading before the date is sealed. Existing moments are never replaced.
export async function saveEntry({ date, type, text, alt, media, onProgress }) {
  if (date !== journalDay()) throw new Error("A new Pacific day has begun. Review your draft and publish it for today.");
  let post;
  if (type === "text") {
    post = { type, text: text.trim() };
  } else {
    if (!media) throw new Error("Choose a file before publishing.");
    const folder = `published/${date}/${crypto.randomUUID()}`;
    const upload = (name, blob, mime) => uploadMedia(`${folder}/${name}`, blob, mime,
      (percent) => onProgress(`Uploading ${type === "photo" ? "photo" : "audio"}… ${percent}%`));
    if (type === "photo") {
      const photoURL = await upload("photo.jpg", media.photo, "image/jpeg");
      const thumbnailURL = await upload("thumbnail.jpg", media.thumbnail, "image/jpeg");
      post = { type, photoURL, thumbnailURL, alt: alt.trim() };
    } else {
      const audioURL = await upload("recording", media.audio, media.contentType);
      post = { type, audioURL, duration: media.duration, waveform: media.waveform };
    }
  }
  onProgress("Saving entry…");
  // Rules also protect media from deletion. Failed uploads may need admin cleanup;
  // the client never removes files that a committed moment might depend on.
  return commitPost(date, post);
}
