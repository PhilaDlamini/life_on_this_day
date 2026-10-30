import { entryTypes } from "../data/entryTypes.js";
import EntryPreview from "./EntryPreview.jsx";
import { calendarDays, dateKey } from "../utils/calendar.js";
import { monthFormat } from "../utils/formatDate.js";
import "./MonthCalendar.css";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// One month: populated days open an entry; empty days stay neutral.
export default function MonthCalendar({ month, posts, entryDates, onSelect, loading = false }) {
  const monthKey = dateKey(month).slice(0, 7);
  const monthEntries = entryDates.filter((date) => date.startsWith(monthKey));
  const headingId = `month-${monthKey}`;

  return (
    <section className="calendar-section" aria-labelledby={headingId}>
      <div className="calendar-toolbar">
        <div className="month-title">
          <h2 id={headingId}>{monthFormat.format(month)}</h2>
          <span className="month-year">{month.getFullYear()}</span>
        </div>
      </div>
      <div className="weekdays" aria-hidden="true">
        {weekdays.map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="day-grid">
        {calendarDays(month).map((date, index) => {
          if (!date) {
            return <div key={`blank-${index}`} className="day day-outside" aria-hidden="true" />;
          }

          const key = dateKey(date);
          const post = posts[key];
          if (!post) {
            return (
              <div className="day day-empty" key={key}>
                <time dateTime={key}>{date.getDate()}</time>
              </div>
            );
          }

          return <EntryPreview key={key} date={date} post={post} onSelect={onSelect} />;
        })}
      </div>
      {!loading && monthEntries.length === 0 && (
        <div className="empty-month"><p>Nothing recorded here yet.</p></div>
      )}
      <div className="calendar-caption">
        <span>{String(month.getMonth() + 1).padStart(2, "0")} / {month.getFullYear()}</span>
        <div className="format-key">
          <span>{entryTypes.photo}</span>
          <span>{entryTypes.text}</span>
          <span>{entryTypes.audio}</span>
        </div>
      </div>
    </section>
  );
}
