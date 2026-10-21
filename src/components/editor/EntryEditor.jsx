import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { entryTypes } from "../../data/entryTypes.js";
import { journalDay } from "../../../functions/shared/journalDay.js";
import useToday from "../../hooks/useToday.js";
import { dateFromKey } from "../../utils/calendar.js";
import { dateFormat } from "../../utils/formatDate.js";
import { prepareAudio, preparePhoto } from "../../utils/prepareMedia.js";
import { saveEntry } from "../../firebase/saveEntry.js";
import TextEditor from "./TextEditor.jsx";
import FormattedText from "../FormattedText.jsx";
import Waveform from "../Waveform.jsx";
import "./EntryEditor.css";

// Local form state survives a failed save. Nothing is published until Publish is pressed.
export default function EntryEditor({ posts, onClose, onPublished }) {
  const dialog = useRef(null);
  const preparation = useRef(0);
  const date = useToday();
  const [type, setType] = useState("text");
  const [words, setWords] = useState({ text: "", textRuns: [] });
  const { text, textRuns } = words;
  const [alt, setAlt] = useState("");
  const [media, setMedia] = useState(null);
  const [preparing, setPreparing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const busy = saving || preparing;
  const occupied = Boolean(posts[date]);
  const source = media?.previewURL;

  useEffect(() => {
    const element = dialog.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      preparation.current++;
    };
  }, []);

  useEffect(() => () => {
    if (media?.previewURL) URL.revokeObjectURL(media.previewURL);
  }, [media]);

  async function chooseFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const attempt = ++preparation.current;
    setPreparing(true);
    setError("");
    setMedia(null);
    try {
      const prepared = await (type === "photo" ? preparePhoto(file) : prepareAudio(file));
      if (attempt !== preparation.current) {
        URL.revokeObjectURL(prepared.previewURL);
        return;
      }
      setMedia(prepared);
    } catch (error) {
      if (attempt === preparation.current) setError(error.message);
    } finally {
      if (attempt === preparation.current) setPreparing(false);
    }
  }

  function changeType(nextType) {
    setType(nextType);
    setMedia(null);
    setError("");
  }

  async function publish(event) {
    event.preventDefault();
    if (busy || occupied) return;
    setError("");
    if (date !== journalDay()) { setError("A new Pacific day has begun. Review your draft, then try again."); return; }
    if (type === "text" && !text.trim()) { setError("Write something before publishing."); return; }
    if (type === "text" && text.length > 20000) { setError("Keep your entry within 20,000 characters."); return; }
    if (type !== "text" && !media) { setError("Choose a file before publishing."); return; }
    if (!window.confirm(`Keep this moment for ${date}? Once published, it cannot be edited or deleted.`)) return;
    setSaving(true);
    try {
      const publishedDate = await saveEntry({ date, type, text, textRuns, alt, media, onProgress: setProgress });
      onPublished(publishedDate);
    } catch (error) {
      setError(["functions/already-exists", "functions/failed-precondition", "functions/invalid-argument", "functions/permission-denied"].includes(error.code)
        ? error.message
        : error.code ? "The entry could not be saved. Your input is still here—check your connection and try again." : error.message);
    } finally {
      setSaving(false);
      setProgress("");
    }
  }

  return (
    <dialog ref={dialog} className="editor-dialog" aria-labelledby="editor-title" onCancel={(event) => {
      event.preventDefault();
      if (!busy) onClose();
    }}>
      <header className="editor-header">
        <h2 id="editor-title">A moment to keep.</h2>
        <button className="icon-button" aria-label="Close editor" disabled={busy} onClick={onClose}><X size={21} /></button>
      </header>
      <form onSubmit={publish}>
        <fieldset disabled={busy} className="editor-fields">
          <p className="editor-date">Today · <time dateTime={date}>{dateFormat.format(dateFromKey(date))}</time> · Pacific time</p>
          {occupied ? <p className="editor-hint" role="status">Today’s moment is already kept. Come back tomorrow for another.</p> : <>
            <div className="editor-formats" role="group" aria-label="Entry format">
              {Object.entries(entryTypes).map(([value, label]) => (
                <button key={value} type="button" aria-pressed={type === value} onClick={() => changeType(value)}>{label}</button>
              ))}
            </div>
            {type === "text" ? (
              <div className="editor-label">Your words
                <TextEditor value={words} onChange={setWords} disabled={busy} />
              </div>
            ) : (
              <>
                <label className="editor-label">{type === "photo" ? "Choose a photo" : "Choose a recording"}
                  <input key={type} type="file" accept={type === "photo" ? "image/*" : "audio/*,.m4a,.mp3,.wav"} onChange={chooseFile} />
                </label>
                <p className="editor-hint">{type === "photo"
                  ? "Photos are resized and compressed before upload, with location metadata removed."
                  : "Up to one minute and 5 MB. Upload a recording from your phone; M4A or MP3 works well."}</p>
                {type === "photo" && (
                  <label className="editor-label">Image description <span className="editor-hint">(optional, for accessibility)</span>
                    <input value={alt} maxLength={2000} onChange={(event) => setAlt(event.target.value)} />
                  </label>
                )}
              </>
            )}
          </>}
        </fieldset>
        {preparing && <p role="status" className="editor-hint">Preparing your {type === "photo" ? "photo" : "recording"}…</p>}
        {!occupied && <section className="editor-preview" aria-label="Entry preview">
          {((type === "text" && text.trim()) || source) && <h3>Preview</h3>}
          {type === "text" && text.trim() && <p><FormattedText text={text} textRuns={textRuns} /></p>}
          {type === "photo" && source && <img src={source} alt={alt} />}
          {type === "photo" && media && <p className="editor-hint">Photo ready · {Math.ceil((media.photo.size + media.thumbnail.size) / 1024)} KB total</p>}
          {type === "audio" && source && (
            <>
              <Waveform values={media?.waveform} />
              <audio key={source} controls preload="metadata" src={source} aria-label="Recording preview" />
              <small>{Math.ceil(media?.duration || 0)} seconds</small>
            </>
          )}
        </section>}
        {!occupied && <p className="editor-hint">Once published, this moment cannot be edited or deleted.</p>}
        {error && <p className="editor-error" role="alert">{error}</p>}
        <footer className="editor-footer">
          <span role="status">{progress}</span>
          <button className="publish-button" disabled={busy || occupied} type="submit">{saving ? "Publishing…" : "Publish"}</button>
        </footer>
      </form>
    </dialog>
  );
}
