import { database } from "./config.js";
import { commitPost } from "./publish.js";
import { removeMedia, uploadMedia } from "./storage.js";

// New files finish uploading before the database changes. Failures preserve the old entry.
export async function saveEntry({ date, type, text, alt, media, existingPost, onProgress }) {
  const uploaded = [];
  let post;
  try {
    if (type === "text") {
      post = { type, text: text.trim() };
    } else if (!media) {
      if (existingPost?.type !== type) throw new Error("Choose a file before publishing.");
      post = { ...existingPost };
      if (type === "photo") post.alt = alt.trim();
    } else {
      const folder = `published/${date}/${crypto.randomUUID()}`;
      const upload = async (name, blob, mime) => {
        const path = `${folder}/${name}`;
        // Track paths before starting so a metadata/URL failure can still be cleaned up.
        uploaded.push(path);
        return uploadMedia(path, blob, mime, (percent) => onProgress(`Uploading ${type === "photo" ? "photo" : "audio"}… ${percent}%`));
      };
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
    await commitPost(database, date, post, existingPost);
  } catch (error) {
    // Best-effort cleanup. An interrupted cleanup may leave an unused owner-uploaded file.
    await Promise.allSettled(uploaded.map(removeMedia));
    throw error;
  }

  // Cleanup happens only after the new entry is safely committed.
  const oldURLs = [existingPost?.photoURL, existingPost?.thumbnailURL, existingPost?.audioURL];
  const keptURLs = [post.photoURL, post.thumbnailURL, post.audioURL];
  await Promise.allSettled(oldURLs.filter((url) => url && !keptURLs.includes(url)).map(removeMedia));
  return post;
}
