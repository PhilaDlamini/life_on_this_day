// Shuffle a copy so picking highlights never changes the calendar's date order.
export function pickEntryDates(dates, random = Math.random) {
  const shuffled = [...dates];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  return shuffled.slice(0, 5);
}
