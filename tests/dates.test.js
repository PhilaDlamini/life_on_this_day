import assert from "node:assert/strict";
import test from "node:test";
import { archiveMonths, calendarDays, dateFromKey, dateKey } from "../src/utils/calendar.js";
import { dailyTitle } from "../src/utils/dailyTitle.js";
import { titles } from "../src/data/titles.js";

const monthKeys = (posts, today) => archiveMonths(posts, today).map((month) => dateKey(month).slice(0, 7));

test("local date keys survive a round trip, including near midnight", () => {
  const localDate = new Date(2026, 9, 19, 23, 59);
  assert.equal(dateKey(localDate), "2026-10-19");
  assert.equal(dateKey(dateFromKey("2026-10-19")), "2026-10-19");
});

test("the archive always includes the current month and skips empty past months", () => {
  const today = new Date(2026, 9, 19);
  assert.deepEqual(monthKeys({}, today), ["2026-10"]);
  assert.deepEqual(monthKeys({ "2026-09-06": {}, "2026-07-12": {} }, today), ["2026-10", "2026-09", "2026-07"]);
});

test("months sort across years, deduplicate entries, and exclude future months", () => {
  const posts = { "2025-12-01": {}, "2025-12-02": {}, "2026-01-04": {}, "2026-02-01": {} };
  assert.deepEqual(monthKeys(posts, new Date(2026, 0, 12)), ["2026-01", "2025-12"]);
});

test("the Monday-first grid aligns leap February and keeps empty padding", () => {
  const days = calendarDays(new Date(2024, 1, 1));
  assert.equal(days.length, 35);
  assert.deepEqual(days.slice(0, 3), [null, null, null]);
  assert.equal(dateKey(days[3]), "2024-02-01");
  assert.equal(days.filter(Boolean).length, 29);
  assert.equal(days.at(-1), null);
});

test("a six-week month keeps every day", () => {
  const days = calendarDays(new Date(2026, 2, 1));
  assert.equal(days.length, 42);
  assert.equal(dateKey(days[6]), "2026-03-01");
  assert.equal(days.filter(Boolean).length, 31);
});

test("the daily title is stable all day and visits every title before repeating", () => {
  assert.equal(dailyTitle(new Date(2026, 9, 19, 0)), "As It Was");
  assert.equal(dailyTitle(new Date(2026, 9, 19, 23, 59)), "As It Was");
  const cycle = Array.from({ length: titles.length }, (_, index) => dailyTitle(new Date(2026, 9, 19 + index)));
  assert.deepEqual(cycle, titles);
  assert.equal(dailyTitle(new Date(2026, 9, 19 + titles.length)), "As It Was");
  assert.ok(titles.includes(dailyTitle(new Date(2025, 0, 1))));
});

test("titles advance by calendar day across daylight-saving and year boundaries", () => {
  for (const [year, month, day] of [[2026, 2, 8], [2026, 10, 1], [2026, 11, 31]]) {
    const current = titles.indexOf(dailyTitle(new Date(year, month, day)));
    const next = titles.indexOf(dailyTitle(new Date(year, month, day + 1)));
    assert.equal(next, (current + 1) % titles.length);
  }
});
