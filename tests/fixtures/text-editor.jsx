// Isolated browser fixture: no Firebase connection, authentication, or publishing.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import TextEditor from "../../src/components/editor/TextEditor.jsx";
import FormattedText from "../../src/components/FormattedText.jsx";
import MonthCalendar from "../../src/components/MonthCalendar.jsx";
import EntryViewer from "../../src/components/EntryViewer.jsx";
import "../../src/styles.css";
import "../../src/components/editor/EntryEditor.css";

function Fixture() {
  const date = "2026-10-20";
  const [words, setWords] = useState({ text: "A quiet ordinary day.", textRuns: [{ text: "A quiet ordinary day." }] });
  const [writing, setWriting] = useState(true);
  const [selectedDate, onSelect] = useState(null);
  const posts = { [date]: { type: "text", ...words } };
  return <main className="journal" style={{ padding: "24px 0" }}>
    <p className="editor-hint">Local fixture · nothing is published</p>
    <div className="editor-label">Your words
      {writing && <TextEditor value={words} onChange={setWords} />}
    </div>
    <button type="button" onClick={() => setWriting(!writing)}>{writing ? "Close writing" : "Resume writing"}</button>
    <section className="editor-preview"><h3>Preview</h3><p><FormattedText {...words} /></p></section>
    <MonthCalendar month={new Date(2026, 9, 1)} posts={posts} entryDates={[date]} onSelect={onSelect} />
    <EntryViewer posts={posts} entryDates={[date]} selectedDate={selectedDate} onSelect={onSelect} />
  </main>;
}
createRoot(document.getElementById("root")).render(<Fixture />);
