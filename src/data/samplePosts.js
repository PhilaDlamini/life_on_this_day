import sampleWaveform from "./sample-waveform.json";

const asset = (name) => `${import.meta.env.BASE_URL}samples/${name}`;

// Illustrative content only. These are not entries from Phila's life.
export const samplePosts = {
  "2026-07-12": {
    type: "text",
    text: "Made dinner with what was left in the fridge. Turned out better than the thing I had planned.",
  },
  "2026-09-06": {
    type: "text",
    text: "Found a new street to walk down. I like that the city can still surprise me.",
  },
  "2026-10-17": {
    type: "photo",
    photoURL: asset("san-francisco.jpg"),
    alt: "The Golden Gate Bridge stretching across the blue San Francisco Bay",
  },
  "2026-10-18": {
    type: "text",
    text: "I took the long way home. No particular reason.\n\nThere was a little patch of sun on the pavement, and for a minute I just stood in it.\n\nNothing big to report. I think I wanted to remember that, too.",
  },
  "2026-10-19": {
    type: "audio",
    audioURL: asset("voice-note.m4a"),
    waveform: sampleWaveform,
  },
};

