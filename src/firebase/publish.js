import { onValue, ref, runTransaction } from "firebase/database";

export async function commitPost(database, date, post) {
  const entryRef = ref(database, `posts/${date}`);
  let unsubscribe = () => {};
  try {
    // Keep the initial server value in the SDK cache while the transaction runs.
    // A one-off get alone may release its cache and make an existing entry look null.
    await new Promise((resolve, reject) => {
      unsubscribe = onValue(entryRef, () => resolve(), reject);
    });
    const result = await runTransaction(entryRef, (current) => {
      if (current !== null) return;
      return post;
    }, { applyLocally: false });
    if (!result.committed) throw new Error("This date already has an entry. Published moments cannot be changed.");
  } finally {
    unsubscribe();
  }
}
