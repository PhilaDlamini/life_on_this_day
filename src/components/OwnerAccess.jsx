import "./OwnerAccess.css";

// Authentication is an owner utility; visitors can read without signing in.
export default function OwnerAccess({ auth, onNewEntry, canEdit = true }) {
  const { user, isOwner, loading, busy, error, signIn, signOut } = auth;

  return (
    <div className="owner-access">
      {user ? (
        <>
          {isOwner ? <button className="owner-link" disabled={!canEdit} onClick={onNewEntry}>Add an entry</button> : <span>Read-only account</span>}
          <button className="owner-link" disabled={busy} onClick={signOut}>Sign out</button>
        </>
      ) : (
        <button className="owner-link" disabled={loading || busy} onClick={signIn}>
          {loading ? "Checking sign-in…" : busy ? "Signing in…" : "Owner sign-in"}
        </button>
      )}
      {error && <small className="owner-error" role="alert">{error}</small>}
    </div>
  );
}
