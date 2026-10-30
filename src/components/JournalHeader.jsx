import { titleAccents } from "../data/titles.js";
import "./JournalHeader.css";

export default function JournalHeader({ title, children }) {
  const accent = titleAccents[title];

  return (
    <>
      <header className="site-header">
        <div className="masthead">
          <span>An open journal</span>
          <span className="masthead-star" aria-hidden="true">*</span>
        </div>
        {children}
      </header>
      <section className="introduction" aria-labelledby="site-title">
        <h1 id="site-title">
          {accent
            ? <>{title.slice(0, -accent.length)}<em>{accent}.</em></>
            : `${title}.`}
        </h1>
        <p>The ordinary things, kept.</p>
      </section>
    </>
  );
}
