import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { entryTypes } from "../../data/entryTypes.js";
import { dateKey } from "../../utils/calendar.js";
import { prepareAudio, preparePhoto } from "../../utils/prepareMedia.js";
import { saveEntry } from "../../firebase/saveEntry.js";
import Waveform from "../Waveform.jsx";
import "./EntryEditor.css";

// Local form state survives a failed save. Nothing is published until Publish is pressed.
export default function EntryEditor({ initialDate, posts, onClose, onPublished }) {
  const dialog = useRef(null);
  const preparation = useRef(0);
  const [date, setDate] = useState(initialDate);
  const [type, setType] = useState("text");
  const [text, setText] = useState("");
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
    if (type === "text" && !text.trim()) { setError("Write something before publishing."); return; }
    if (type !== "text" && !media) { setError("Choose a file before publishing."); return; }
    if (!window.confirm(`Keep this moment for ${date}? Once published, it cannot be edited or deleted.`)) return;
    setSaving(true);
    try {
      await saveEntry({ date, type, text, alt, media, onProgress: setProgress });
      onPublished(date);
    } catch (error) {
      setError(error.code
        ? "The entry could not be saved. Your input is still here—check your connection and try again."
        : error.message);
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
          <label className="editor-label">Date
            <input type="date" required value={date} max={dateKey(new Date())} onChange={(event) => setDate(event.target.value)} />
          </label>
          {occupied ? <p className="editor-hint" role="status">This date already holds a moment. It is final—choose another date.</p> : <>
            <div className="editor-formats" role="group" aria-label="Entry format">
              {Object.entries(entryTypes).map(([value, label]) => (
                <button key={value} type="button" aria-pressed={type === value} onClick={() => changeType(value)}>{label}</button>
              ))}
            </div>
            {type === "text" ? (
              <label className="editor-label">Your words
                <textarea value={text} onChange={(event) => setText(event.target.value)} maxLength={20000} rows={7} placeholder="Whatever stayed with you." required />
              </label>
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
          {type === "text" && text.trim() && <p>{text}</p>}
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
