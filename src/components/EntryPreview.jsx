import { Image, Play } from "lucide-react";
import FormattedText from "./FormattedText.jsx";
import Waveform from "./Waveform.jsx";
import { entryTypes } from "../data/entryTypes.js";
import { dateKey } from "../utils/calendar.js";
import { dateFormat } from "../utils/formatDate.js";
import "./EntryPreview.css";

// A populated calendar day opens its entry; it never starts audio playback.
export default function EntryPreview({ date, post, onSelect }) {
  const key = dateKey(date);

  return (
    <button
      className={`day day-entry day-${post.type}`}
      aria-label={`${dateFormat.format(date)}: ${entryTypes[post.type]}`}
      onClick={() => onSelect(key)}
    >
      <time dateTime={key}>{date.getDate()}</time>
      {post.type === "photo" && (
        <>
          <img src={post.thumbnailURL || post.photoURL} alt="" loading="lazy" />
          <span className="photo-marker"><Image size={14} /></span>
        </>
      )}
      {post.type === "text" && (
        <>
          <span className="text-snippet"><FormattedText {...post} /></span>
        </>
      )}
      {post.type === "audio" && (
        <>
          <span className="audio-symbol"><Play size={16} fill="currentColor" /></span>
          <Waveform values={post.waveform} compact />
          <span className="memo-label">{entryTypes.audio}</span>
        </>
      )}
    </button>
  );
}
