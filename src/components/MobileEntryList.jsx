import { ArrowRight, Headphones, Quote } from "lucide-react";
import { entryTypes } from "../data/entryTypes.js";
import { dateFromKey } from "../utils/calendar.js";
import { monthFormat, shortMonthFormat } from "../utils/formatDate.js";
import "./MobileEntryList.css";

// Small calendar cells use icons; this list makes their excerpts readable on phones.
export default function MobileEntryList({ month, dates, posts, onSelect }) {
  return (
    <div className="mobile-moments" aria-label={`${monthFormat.format(month)} ${month.getFullYear()} entries`}>
      {dates.map((key) => {
        const post = posts[key];
        const date = dateFromKey(key);
        const excerpt = post.type === "text" ? post.text
          : post.type === "photo" ? post.alt : "A small note from today";

        return (
          <button className={`moment-row moment-${post.type}`} key={key} onClick={() => onSelect(key)}>
            <span className="moment-date">
              {date.getDate()}<small>{shortMonthFormat.format(date)}</small>
            </span>
            <span className="moment-preview">
              {post.type === "photo" && <img src={post.thumbnailURL || post.photoURL} alt="" loading="lazy" />}
              {post.type === "text" && <Quote size={24} strokeWidth={1.4} />}
              {post.type === "audio" && <Headphones size={23} strokeWidth={1.4} />}
            </span>
            <span className="moment-copy">
              <span>{entryTypes[post.type]}</span>
              <small>{excerpt}</small>
            </span>
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
