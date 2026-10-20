// One fixed calendar prevents device clocks and travel from opening extra dates.
export const JOURNAL_TIME_ZONE = "America/Los_Angeles";
export const OWNER_UID = "sieqz9C2ZGW9xrMKlhgj0jO543X2";

const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: JOURNAL_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
});

export function journalDay(now = new Date()) {
  const parts = Object.fromEntries(formatter.formatToParts(now).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
