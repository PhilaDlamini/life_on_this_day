import FormattedText from "./FormattedText.jsx";
import { useState } from "react";
import { ArrowRight, Headphones, Quote } from "lucide-react";
import { entryTypes } from "../data/entryTypes.js";
import { dateFromKey } from "../utils/calendar.js";
import { dateFormat, shortMonthFormat } from "../utils/formatDate.js";
import { pickEntryDates } from "../utils/randomEntries.js";
import "./ArchiveHighlights.css";

// Mount after the archive loads; keep this visit's selection stable while browsing.
export default function ArchiveHighlights({ posts, onSelect }) {
  const [dates] = useState(() => pickEntryDates(Object.keys(posts)));
  const available = dates.filter((date) => posts[date]);
  if (available.length === 0) return null;

  return (
    <section className="archive-highlights" aria-labelledby="highlights-title">
      <h2 id="highlights-title">From the archive</h2>
      {available.map((key) => {
        const post = posts[key];
        const date = dateFromKey(key);
        return (
          <button className={`highlight-row highlight-${post.type}`} key={key}
            aria-label={`${dateFormat.format(date)}: ${entryTypes[post.type]}`} onClick={() => onSelect(key)}>
            <time className="highlight-date" dateTime={key}>
              {date.getDate()}<small>{shortMonthFormat.format(date)} {date.getFullYear()}</small>
            </time>
            <span className="highlight-preview">
              {post.type === "photo" && <img src={post.thumbnailURL || post.photoURL} alt="" loading="lazy" />}
              {post.type === "text" && <Quote size={22} strokeWidth={1.4} />}
              {post.type === "audio" && <Headphones size={22} strokeWidth={1.4} />}
            </span>
            <span className="highlight-copy">
              <span>{entryTypes[post.type]}</span>
              {post.type === "text" && <small><FormattedText {...post} /></small>}
            </span>
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        );
      })}
    </section>
  );
}
