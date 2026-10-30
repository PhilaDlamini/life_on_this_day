const preferenceKey = "journal-appearance";
const options = ["system", "light", "dark"];

export function readAppearance() {
  try {
    const value = localStorage.getItem(preferenceKey);
    return options.includes(value) ? value : "system";
  } catch {
    return "system";
  }
}

export function saveAppearance(value) {
  // Browsing restrictions may block storage; the current selection still works.
  try { localStorage.setItem(preferenceKey, value); } catch { /* Keep the in-memory choice. */ }
}

export function applyAppearance(value) {
  document.documentElement.dataset.appearance = value;
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    const scheme = meta.dataset.scheme;
    meta.media = value === "system" ? `(prefers-color-scheme: ${scheme})`
      : value === scheme ? "all" : "not all";
  });
}
