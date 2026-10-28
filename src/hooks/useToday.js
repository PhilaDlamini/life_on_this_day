import { useEffect, useState } from "react";
import { journalDay } from "../../functions/shared/journalDay.js";

// Follow Pacific midnight for the editor and archive, also after a sleeping tab wakes.
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
