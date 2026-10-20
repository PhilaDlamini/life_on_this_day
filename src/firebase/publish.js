import { onValue, ref, runTransaction } from "firebase/database";

// Stable comparison protects against another device changing this date while editing.
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  }
  return value;
}

export async function commitPost(database, date, post, expectedPost) {
  const entryRef = ref(database, `posts/${date}`);
  let unsubscribe = () => {};
  try {
    // Keep the initial server value in the SDK cache while the transaction runs.
    // A one-off get alone may release its cache and make an existing entry look null.
    await new Promise((resolve, reject) => {
      unsubscribe = onValue(entryRef, () => resolve(), reject);
    });
    const result = await runTransaction(entryRef, (current) => {
      if (JSON.stringify(canonical(current)) !== JSON.stringify(canonical(expectedPost))) return;
      return post;
    }, { applyLocally: false });
    if (!result.committed) throw new Error("This date changed while you were editing. Close the editor, reload the journal, and try again.");
  } finally {
    unsubscribe();
  }
}
