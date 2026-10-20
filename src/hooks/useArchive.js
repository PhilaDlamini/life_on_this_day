import { useEffect, useState } from "react";
import { getArchiveDates, subscribeToMonth } from "../firebase/database.js";
import { archiveMonths, dateKey } from "../utils/calendar.js";

// Own the read lifecycle; calendar components remain independent of Firebase.
export default function useArchive() {
  const [posts, setPosts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const unsubscribes = [];
    let active = true;
    const timeout = setTimeout(() => {
      if (!active) return;
      setError("The journal is taking too long to load. Please try again.");
      setLoading(false);
      controller.abort();
    }, 15000);
    setLoading(true);
    setError("");

    async function load() {
      try {
        const dates = await getArchiveDates(controller.signal);
        if (!active) return;
        const dateMap = Object.fromEntries(dates.map((date) => [date, true]));
        const months = archiveMonths(dateMap).map((month) => dateKey(month).slice(0, 7));
        const pending = new Set(months);
        setPosts({});

        for (const month of months) {
          unsubscribes.push(subscribeToMonth(month, (monthPosts) => {
            if (!active) return;
            setPosts((current) => ({
              ...Object.fromEntries(Object.entries(current).filter(([date]) => !date.startsWith(month))),
              ...monthPosts,
            }));
            pending.delete(month);
            if (pending.size === 0) {
              clearTimeout(timeout);
              setLoading(false);
            }
          }, () => {
            if (!active) return;
            clearTimeout(timeout);
            setError("The journal could not be loaded. Please try again.");
            setLoading(false);
          }));
        }
      } catch (error) {
        if (!active || error.name === "AbortError") return;
        clearTimeout(timeout);
        setError("The journal could not be loaded. Please try again.");
        setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [attempt]);

  return { posts, loading, error, retry: () => setAttempt((value) => value + 1) };
}
