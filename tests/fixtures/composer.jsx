// Actual composer UI. Capture stops submission before any publishing handler runs.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import EntryEditor from "../../src/components/editor/EntryEditor.jsx";
import "../../src/styles.css";

function Fixture() {
  const [open, setOpen] = useState(true);
  return <main onSubmitCapture={(event) => { event.preventDefault(); event.stopPropagation(); }}>
    <p>Local composer preview · publishing is disabled.</p>
    <button onClick={() => setOpen(true)}>Open editor</button>
    {open && <EntryEditor posts={{}} onClose={() => setOpen(false)} onPublished={() => {}} />}
  </main>;
}
createRoot(document.getElementById("root")).render(<Fixture />);
