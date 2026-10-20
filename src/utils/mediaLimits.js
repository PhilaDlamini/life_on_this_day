export const MAX_AUDIO_SECONDS = 60;
export const MAX_AUDIO_BYTES = 5 * 1024 * 1024;
export const MAX_PHOTO_BYTES = 800 * 1024;
export const MAX_THUMBNAIL_BYTES = 100 * 1024;
export const MAX_SOURCE_PHOTO_BYTES = 20 * 1024 * 1024;

export function scaledDimensions(width, height, maxEdge) {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

export function validateAudioInfo({ duration, size }) {
  if (!Number.isFinite(duration) || duration <= 0) throw new Error("This recording could not be read. Try an M4A or MP3 file.");
  if (duration > MAX_AUDIO_SECONDS) throw new Error("Please trim your recording to one minute or less before uploading.");
  if (size > MAX_AUDIO_BYTES) throw new Error("Audio must be 5 MB or smaller. Try exporting it as M4A or MP3.");
}
