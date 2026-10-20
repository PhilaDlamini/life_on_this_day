// Calendar helpers use local dates so entries stay on the day they were recorded.
export function dateFromKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Always include the current local month, even when the archive is empty.
// Past months only appear when they contain an entry.
export function archiveMonths(entries, today = new Date()) {
  const currentMonth = dateKey(today).slice(0, 7);
  const keys = new Set([currentMonth]);

  for (const date of Object.keys(entries)) {
    const month = date.slice(0, 7);
    if (month <= currentMonth) keys.add(month);
  }

  return [...keys]
    .sort()
    .reverse()
    .map((key) => {
      const [year, month] = key.split("-").map(Number);
      return new Date(year, month - 1, 1);
    });
}

export function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Null cells pad a Monday-first grid; longer months can occupy six rows.
export function calendarDays(month) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cellCount = Math.max(35, Math.ceil((mondayOffset + daysInMonth) / 7) * 7);

  return Array.from({ length: cellCount }, (_, index) => {
    const day = index - mondayOffset + 1;
    if (day < 1 || day > daysInMonth) return null;
    return new Date(month.getFullYear(), month.getMonth(), day);
  });
}
