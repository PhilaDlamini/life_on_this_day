import { lazy, Suspense, useEffect, useState } from "react";
import JournalHeader from "./components/JournalHeader.jsx";
import MonthCalendar from "./components/MonthCalendar.jsx";
import ArchiveHighlights from "./components/ArchiveHighlights.jsx";
import EntryViewer from "./components/EntryViewer.jsx";
import OwnerAccess from "./components/OwnerAccess.jsx";
import useOwnerAuth from "./hooks/useOwnerAuth.js";
import useArchive from "./hooks/useArchive.js";
import { archiveMonths, dateKey } from "./utils/calendar.js";
import { dailyTitle } from "./utils/dailyTitle.js";

const EntryEditor = lazy(() => import("./components/editor/EntryEditor.jsx"));

// App owns the entries and selection; its children receive data and callbacks.
export default function App() {
  const { posts, loading, error, retry } = useArchive();
  const ownerAuth = useOwnerAuth();
  const [editorDate, setEditorDate] = useState(null);
  const [notice, setNotice] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const title = dailyTitle();
  const months = archiveMonths(posts);
  const entryDates = Object.keys(posts).sort();

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <>
      <a className="skip-link" href="#calendar">Skip to calendar</a>
      <div className="journal">
        <JournalHeader title={title}>
          <OwnerAccess auth={ownerAuth} canPublish={!loading && !error} onNewEntry={() => setEditorDate(dateKey(new Date()))} />
        </JournalHeader>
        <main>
          {notice && <p className="archive-status" role="status">{notice}</p>}
          {loading && <p className="archive-status" role="status">Opening the journal…</p>}
          {error && (
            <div className="archive-status" role="alert">
              <p>{error}</p>
              <button className="owner-link" onClick={retry}>Try again</button>
            </div>
          )}
          <div id="calendar" tabIndex={-1}>
            {months.map((month) => (
              <MonthCalendar
                key={dateKey(month)}
                month={month}
                posts={posts}
                entryDates={entryDates}
                onSelect={setSelectedDate}
                loading={loading || Boolean(error)}
              />
            ))}
          </div>
          {!loading && !error && <ArchiveHighlights posts={posts} onSelect={setSelectedDate} />}
        </main>
        <footer className="site-footer">
          <span>A few things I didn't want to forget.</span>
          <span>Phila Dlamini <span className="footer-star">*</span> 2026</span>
        </footer>
      </div>
      <EntryViewer
        posts={posts}
        entryDates={entryDates}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
      />
      {ownerAuth.isOwner && editorDate && (
        <Suspense fallback={<p className="archive-status" role="status">Opening editor…</p>}>
          <EntryEditor
            initialDate={editorDate}
            posts={posts}
            onClose={() => setEditorDate(null)}
            onPublished={(date) => {
              setEditorDate(null);
              setNotice(`Kept for ${date}.`);
              retry();
            }}
          />
        </Suspense>
      )}
    </>
  );
}
