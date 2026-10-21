// React escapes every text run; stored content is never interpreted as HTML.
export default function FormattedText({ text, textRuns }) {
  if (!textRuns) return text;
  return textRuns.map((run, index) => {
    let content = run.text;
    if (run.underline) content = <u>{content}</u>;
    if (run.italic) content = <em>{content}</em>;
    if (run.bold) content = <strong>{content}</strong>;
    return <span key={index}>{content}</span>;
  });
}
