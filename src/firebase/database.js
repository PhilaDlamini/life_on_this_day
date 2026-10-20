import { endAt, onValue, orderByKey, query, ref, startAt } from "firebase/database";
import { database, databaseURL } from "./config.js";
import { isValidPost, isDateKey } from "../utils/posts.js";

// Discover only date keys. Full text and media URLs are fetched month by month.
export async function getArchiveDates(signal) {
  const url = new URL(databaseURL);
  url.pathname = "/posts.json";
  url.searchParams.set("shallow", "true");
  const response = await fetch(url, { signal, cache: "no-store" });
  if (!response.ok) throw new Error("The journal could not be loaded. Please try again.");
  const dates = await response.json();
  return Object.keys(dates || {}).filter(isDateKey);
}

// Returns the Firebase unsubscribe function for React's effect cleanup.
export function subscribeToMonth(monthKey, onPosts, onError) {
  const monthQuery = query(
    ref(database, "posts"),
    orderByKey(),
    startAt(`${monthKey}-01`),
    endAt(`${monthKey}-31`),
  );

  return onValue(monthQuery, (snapshot) => {
    const posts = Object.fromEntries(
      Object.entries(snapshot.val() || {}).filter(([date, post]) => isDateKey(date) && isValidPost(post)),
    );
    onPosts(posts);
  }, onError);
}
