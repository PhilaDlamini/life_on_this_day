import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Headphones, X } from "lucide-react";
import FormattedText from "./FormattedText.jsx";
import Waveform from "./Waveform.jsx";
import { entryTypes } from "../data/entryTypes.js";
import { dateFromKey } from "../utils/calendar.js";
import { dateFormat } from "../utils/formatDate.js";
import "./EntryViewer.css";

// A controlled native dialog: React owns selection, the browser manages modal focus.
export default function EntryViewer({ posts, entryDates, selectedDate, onSelect }) {
  const dialog = useRef(null);
  const photoButton = useRef(null);
  const fullscreenClose = useRef(null);
  const [expandedDate, setExpandedDate] = useState(null);
  const post = posts[selectedDate];
  const index = entryDates.indexOf(selectedDate);
  const isOpen = Boolean(post);
  const isExpanded = isOpen && post.type === "photo" && expandedDate === selectedDate;

  useEffect(() => {
    if (!isExpanded) return;
    fullscreenClose.current.focus();
    return () => photoButton.current?.focus();
  }, [isExpanded]);

  useEffect(() => {
    if (!isOpen) return;

    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();

    // Also runs on unmount. Native close restores focus to the opening button.
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  function closeEntry() {
    setExpandedDate(null);
    onSelect(null);
  }

  function navigate(direction) {
    const nextDate = entryDates[index + direction];
    if (nextDate) onSelect(nextDate);
  }

  function handleKeyDown(event) {
    if (isExpanded) return;
    // Let native audio controls use arrow keys for seeking and volume.
    if (["AUDIO", "INPUT"].includes(event.target.tagName)) return;

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      navigate(event.key === "ArrowLeft" ? -1 : 1);
    }
  }

  function handleBackdropClick(event) {
    if (event.target !== dialog.current) return;
    const bounds = dialog.current.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right
      || event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (outside) closeEntry();
  }

  return (
    <dialog
      ref={dialog}
      className={`entry-dialog${isExpanded ? " photo-fullscreen" : ""}`}
      aria-labelledby={isExpanded ? undefined : "entry-date"}
      aria-label={isExpanded ? "Full screen photograph" : undefined}
      onCancel={(event) => {
        // Close through React so native Escape and the close button share one path.
        event.preventDefault();
        closeEntry();
      }}
      onClose={() => {
        // An earlier close event must not clear a newly reopened dialog.
        if (!dialog.current.open) closeEntry();
      }}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
    >
      {post && (
        <>
          {!isExpanded && <header className="viewer-header">
            <div>
              <span className={`entry-kind kind-${post.type}`}>{entryTypes[post.type]}</span>
              <h2 id="entry-date">{dateFormat.format(dateFromKey(selectedDate))}</h2>
            </div>
            <button className="icon-button viewer-close" title="Close entry" aria-label="Close entry" onClick={closeEntry}>
              <X size={21} />
            </button>
          </header>}
          {isExpanded && (
            <button ref={fullscreenClose} className="icon-button viewer-close fullscreen-close" aria-label="Close entry" title="Close entry" onClick={closeEntry}>
              <X size={21} />
            </button>
          )}
          {/* Remount media when the date changes so the previous recording stops. */}
          <div key={selectedDate} className={`viewer-content viewer-${post.type}`}>
            {post.type === "photo" && (isExpanded
              ? <img src={post.photoURL} alt={post.alt} />
              : <button ref={photoButton} className="viewer-photo-button" aria-label="View photo full screen" onClick={() => setExpandedDate(selectedDate)}>
                  <img src={post.photoURL} alt={post.alt} />
                </button>
            )}
            {post.type === "text" && <p><FormattedText {...post} /></p>}
            {post.type === "audio" && (
              <>
                <Headphones size={28} strokeWidth={1.5} />
                <Waveform values={post.waveform} />
                <audio controls preload="metadata" src={post.audioURL} aria-label="Voice memo">
                  <a href={post.audioURL}>Download the voice memo</a>
                </audio>
              </>
            )}
          </div>
          {!isExpanded && <footer className="viewer-footer">
            <div className="viewer-navigation">
              <button className="icon-button" title="Previous entry" aria-label="Previous entry" disabled={index === 0} onClick={() => navigate(-1)}>
                <ArrowLeft size={19} />
              </button>
              <span>{index + 1} / {entryDates.length}</span>
              <button className="icon-button" title="Next entry" aria-label="Next entry" disabled={index === entryDates.length - 1} onClick={() => navigate(1)}>
                <ArrowRight size={19} />
              </button>
            </div>
          </footer>}
        </>
      )}
    </dialog>
  );
}
