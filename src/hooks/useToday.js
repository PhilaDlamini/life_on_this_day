import { useEffect, useState } from "react";
import { journalDay } from "../../functions/shared/journalDay.js";

// Keep an editor left open overnight on today's date without losing its draft.
export default function useToday() {
  const [today, setToday] = useState(() => journalDay());
  useEffect(() => {
    const update = () => setToday(journalDay());
    const interval = setInterval(update, 1000);
    window.addEventListener("focus", update);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", update);
    };
  }, []);
  return today;
}
