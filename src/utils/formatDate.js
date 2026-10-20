// Reuse formatters across the calendar, mobile list, and viewer.
export const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});
export const monthFormat = new Intl.DateTimeFormat("en-US", { month: "long" });
export const shortMonthFormat = new Intl.DateTimeFormat("en-US", { month: "short" });
