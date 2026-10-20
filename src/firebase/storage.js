import { connectStorageEmulator, deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app, useEmulators } from "./config.js";

const storage = getStorage(app);
if (useEmulators) connectStorageEmulator(storage, "127.0.0.1", 9199);

export function uploadMedia(path, blob, contentType, onProgress) {
  const task = uploadBytesResumable(ref(storage, path), blob, {
    contentType,
    cacheControl: "public,max-age=31536000,immutable",
  });
  return new Promise((resolve, reject) => {
    task.on("state_changed", (snapshot) => {
      onProgress(Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100));
    }, reject, async () => {
      try { resolve(await getDownloadURL(task.snapshot.ref)); }
      catch (error) { reject(error); }
    });
  });
}

export async function removeMedia(urlOrPath) {
  await deleteObject(ref(storage, urlOrPath));
}
