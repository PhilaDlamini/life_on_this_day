import { Sun } from "lucide-react";
import "./JournalHeader.css";

// Keep the final word in the journal's original italic accent.
export default function JournalHeader({ title, children }) {
  const titleBreak = title.lastIndexOf(" ");

  return (
    <>
      <header className="site-header">
        <div className="masthead">
          <span className="journal-mark"><Sun size={22} strokeWidth={1.5} /></span>
          <span>An open journal</span>
        </div>
        {children}
      </header>
      <section className="introduction" aria-labelledby="site-title">
        <h1 id="site-title">
          {title.slice(0, titleBreak)} <em>{title.slice(titleBreak + 1)}.</em>
        </h1>
        <p>The ordinary things, kept.</p>
      </section>
    </>
  );
}
