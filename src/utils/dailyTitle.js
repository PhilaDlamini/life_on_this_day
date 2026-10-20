import { titles } from "../data/titles.js";

export function dailyTitle(date = new Date()) {
  // Use local calendar parts, then count civil days without daylight-saving drift.
  const day = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const firstDay = Date.UTC(2026, 9, 19);
  const offset = Math.round((day - firstDay) / 86_400_000);
  return titles[((offset % titles.length) + titles.length) % titles.length];
}
