import { TEXT_STYLES } from "../../functions/shared/textRuns.js";

// Convert the editor's small paragraph/text schema into a portable list of runs.
export function runsFromDocument(document) {
  const runs = [];
  function append(text, marks = []) {
    if (!text) return;
    const run = { text };
    for (const style of TEXT_STYLES) {
      if (marks.some((mark) => mark.type === style)) run[style] = true;
    }
    const previous = runs.at(-1);
    if (previous && TEXT_STYLES.every((style) => previous[style] === run[style])) previous.text += text;
    else runs.push(run);
  }
  (document.content || []).forEach((paragraph, index) => {
    if (index) append("\n");
    for (const node of paragraph.content || []) append(node.type === "hardBreak" ? "\n" : node.text, node.marks);
  });
  return runs;
}

// Used when switching formats and returning to the existing, unpublished draft.
export function documentFromRuns(runs) {
  const content = [];
  for (const run of runs) {
    const marks = TEXT_STYLES.filter((style) => run[style]).map((type) => ({ type }));
    run.text.split("\n").forEach((part, index) => {
      if (index) content.push({ type: "hardBreak", marks });
      if (part) content.push({ type: "text", text: part, marks });
    });
  }
  return { type: "doc", content: [{ type: "paragraph", content }] };
}
