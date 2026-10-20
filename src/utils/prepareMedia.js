import { MAX_AUDIO_BYTES, MAX_PHOTO_BYTES, MAX_SOURCE_PHOTO_BYTES, MAX_THUMBNAIL_BYTES, scaledDimensions, validateAudioInfo } from "./mediaLimits.js";

function imageFromFile(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("This photo could not be opened. Try exporting it as JPEG or PNG.")); };
    image.src = url;
  });
}

async function compressedJPEG(image, maxEdge, targetBytes, maxBytes) {
  const canvas = document.createElement("canvas");
  const dimensions = scaledDimensions(image.naturalWidth, image.naturalHeight, maxEdge);
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser could not prepare the photo.");
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);
  // Drawing pixels into a fresh canvas removes the original EXIF/location metadata.
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  let blob;
  for (const quality of [0.8, 0.7, 0.6, 0.5, 0.4]) {
    blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) throw new Error("This browser could not compress the photo.");
    if (blob.size <= targetBytes) break;
  }
  if (blob.size > maxBytes) throw new Error("This photo is still too large. Please choose a smaller image.");
  return blob;
}

export async function preparePhoto(file) {
  if (file.size > MAX_SOURCE_PHOTO_BYTES) throw new Error("Choose a photo smaller than 20 MB.");
  const image = await imageFromFile(file);
  const photo = await compressedJPEG(image, 1600, 600 * 1024, MAX_PHOTO_BYTES);
  const thumbnail = await compressedJPEG(image, 360, 70 * 1024, MAX_THUMBNAIL_BYTES);
  return { photo, thumbnail, previewURL: URL.createObjectURL(photo) };
}

export async function prepareAudio(file) {
  if (file.size > MAX_AUDIO_BYTES) throw new Error("Audio must be 5 MB or smaller. Try exporting it as M4A or MP3.");
  const context = new AudioContext();
  try {
    // Decode the recording rather than trusting a filename or caller-supplied duration.
    const decoded = await context.decodeAudioData(await file.arrayBuffer());
    validateAudioInfo({ duration: decoded.duration, size: file.size });
    const samples = decoded.getChannelData(0);
    const energies = Array.from({ length: 44 }, (_, index) => {
      const start = Math.floor(samples.length * index / 44);
      const end = Math.floor(samples.length * (index + 1) / 44);
      let energy = 0;
      for (let sample = start; sample < end; sample++) energy += samples[sample] ** 2;
      return Math.sqrt(energy / Math.max(1, end - start));
    });
    const peak = Math.max(...energies, 0.001);
    const waveform = energies.map((value) => Math.round(12 + value / peak * 88));
    const extension = file.name.split(".").at(-1).toLowerCase();
    const mimeTypes = { m4a: "audio/mp4", mp3: "audio/mpeg", wav: "audio/wav", aac: "audio/aac", ogg: "audio/ogg", webm: "audio/webm" };
    const contentType = mimeTypes[extension] || file.type;
    if (!contentType.startsWith("audio/")) throw new Error("Choose an audio file such as M4A, MP3, or WAV.");
    return { audio: file, contentType, duration: decoded.duration, waveform, previewURL: URL.createObjectURL(file) };
  } catch (error) {
    if (error.name === "EncodingError" || error.name === "NotSupportedError") {
      throw new Error("This recording could not be opened. Try exporting it as M4A or MP3.");
    }
    throw error;
  } finally {
    await context.close();
  }
}
