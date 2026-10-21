export const TEXT_STYLES = ["bold", "italic", "underline"];

// Text stays available to old readers; optional runs describe only inline emphasis.
export function validTextRuns(text, runs) {
  return Array.isArray(runs) && runs.length > 0 && runs.length <= 20000
    && runs.every((run) => run && typeof run === "object" && !Array.isArray(run)
      && typeof run.text === "string" && run.text.length > 0
      && Object.keys(run).every((key) => key === "text" || TEXT_STYLES.includes(key))
      && TEXT_STYLES.every((style) => !(style in run) || run[style] === true))
    && runs.map((run) => run.text).join("") === text;
}
