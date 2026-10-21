export const TEXT_STYLES = ["bold", "italic", "underline"];

export function plainText(runs) {
  return runs.map((run) => run.text).join("");
}

export function validTextRuns(runs) {
  return Array.isArray(runs) && runs.length > 0 && runs.length <= 20000
    && runs.every((run) => run && typeof run === "object" && !Array.isArray(run)
      && typeof run.text === "string" && run.text.length > 0
      && Object.keys(run).every((key) => key === "text" || TEXT_STYLES.includes(key))
      && TEXT_STYLES.every((style) => !(style in run) || run[style] === true));
}

// Historical entries stay readable without rewriting permanent diary records.
export function postTextRuns(post) {
  return post.runs || post.textRuns || [{ text: post.text }];
}

// The publisher also normalizes cached older clients to the current storage shape.
export function canonicalPost(post) {
  if (post.type !== "text") return post;
  const runs = [];
  for (const run of postTextRuns(post)) {
    const previous = runs.at(-1);
    if (previous && TEXT_STYLES.every((style) => previous[style] === run[style])) previous.text += run.text;
    else runs.push({ ...run });
  }
  return { type: "text", runs };
}
