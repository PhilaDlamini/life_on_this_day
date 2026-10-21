import { journalDay, OWNER_UID } from "./shared/journalDay.js";
import { canonicalPost } from "./shared/textRuns.js";
import { isValidPost } from "./shared/posts.js";

export class PublicationError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

// The callable verifies the ID token; this function applies the journal's policy.
export async function publishMoment({ auth, data }, { commit, now = () => new Date() }) {
  if (!auth || auth.uid !== OWNER_UID || auth.token.email_verified !== true
    || auth.token.firebase?.sign_in_provider !== "google.com") {
    throw new PublicationError("permission-denied", "Only the journal’s owner can publish.");
  }
  const date = journalDay(now());
  if (data?.date !== date) {
    throw new PublicationError("failed-precondition", "Only today’s Pacific date can be published. Your draft is still here—close and reopen the editor to refresh the date.");
  }
  if (!isValidPost(data.post)) {
    throw new PublicationError("invalid-argument", "This entry is not valid. Check its text or media and try again.");
  }
  // Check again at the actual transaction, including any retries around midnight.
  const committed = await commit(date, canonicalPost(data.post));
  if (!committed) {
    if (journalDay(now()) !== date) {
      throw new PublicationError("failed-precondition", "A new Pacific day has begun. Review your draft and publish it for today.");
    }
    throw new PublicationError("already-exists", "Today’s moment is already kept. Come back tomorrow for another.");
  }
  return { date };
}
