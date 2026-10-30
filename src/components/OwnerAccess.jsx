import { Plus } from "lucide-react";
import "./OwnerAccess.css";

// Authentication is an owner utility; visitors can read without signing in.
export default function OwnerAccess({ auth, onNewEntry, canPublish = true }) {
  const { user, isOwner, loading, busy, error, signIn } = auth;

  return (
    <div className="owner-access">
      {isOwner ? (
        <button className="owner-add" aria-label="Add an entry" title="Add an entry" disabled={busy || !canPublish} onClick={onNewEntry}>
          <Plus size={20} strokeWidth={1.5} aria-hidden="true" />
        </button>
      ) : user ? <span>Read-only account</span> : (
        <button className="owner-link" disabled={loading || busy} aria-busy={loading || busy} onClick={signIn}>
          Owner sign-in
        </button>
      )}
      {error && <small className="owner-error" role="alert">{error}</small>}
    </div>
  );
}
