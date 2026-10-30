import { useState } from "react";
import { createRoot } from "react-dom/client";
import JournalHeader from "../../src/components/JournalHeader.jsx";
import MonthCalendar from "../../src/components/MonthCalendar.jsx";
import EntryViewer from "../../src/components/EntryViewer.jsx";
import OwnerAccess from "../../src/components/OwnerAccess.jsx";
import EntryEditor from "../../src/components/editor/EntryEditor.jsx";
import { samplePosts } from "../../src/data/samplePosts.js";
import themeCSS from "../../src/styles.css?inline";
import "../../src/styles.css";

// Exercise the actual palette rules without changing the computer's appearance.
// This fixture uses fictional entries and intercepts every form submission.
function Fixture() {
  const [appearance, setAppearance] = useState("dark");
  const [selectedDate, onSelect] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const css = themeCSS.replace("(prefers-color-scheme: dark)",
    appearance === "dark" ? "(min-width: 0px)" : "(min-width: 100000px)");

  return <div onSubmitCapture={(event) => { event.preventDefault(); event.stopPropagation(); }}>
    <style>{css}</style>
    <div className="journal">
      <p className="archive-status">Local appearance preview · publishing disabled</p>
      <div role="group" aria-label="Preview appearance">
        <button onClick={() => setAppearance("light")} aria-pressed={appearance === "light"}>Light</button>{" "}
        <button onClick={() => setAppearance("dark")} aria-pressed={appearance === "dark"}>Dark</button>
      </div>
      <JournalHeader title="As It Was">
        <OwnerAccess auth={{ user: {}, isOwner: true }} onNewEntry={() => setEditorOpen(true)} />
      </JournalHeader>
      <MonthCalendar month={new Date(2026, 9, 1)} posts={samplePosts} entryDates={Object.keys(samplePosts).sort()} onSelect={onSelect} />
    </div>
    <EntryViewer posts={samplePosts} entryDates={Object.keys(samplePosts).sort()} selectedDate={selectedDate} onSelect={onSelect} />
    {editorOpen && <EntryEditor posts={{}} onClose={() => setEditorOpen(false)} onPublished={() => {}} />}
  </div>;
}

createRoot(document.getElementById("root")).render(<Fixture />);
