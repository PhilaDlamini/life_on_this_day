import assert from "node:assert/strict";
import { test } from "node:test";
import { pickEntryDates } from "../src/utils/randomEntries.js";

test("highlights pick five distinct dates without changing calendar order", () => {
  const dates = Array.from({ length: 12 }, (_, index) => `2026-10-${String(index + 1).padStart(2, "0")}`);
  const original = [...dates];
  const selected = pickEntryDates(dates, () => 0);
  assert.equal(selected.length, 5);
  assert.equal(new Set(selected).size, 5);
  assert.ok(selected.every((date) => dates.includes(date)));
  assert.deepEqual(dates, original);
  assert.notDeepEqual(selected, pickEntryDates(dates, () => 0.999));
});

test("small and empty archives show only available moments", () => {
  assert.deepEqual(pickEntryDates([]), []);
  assert.deepEqual(pickEntryDates(["2026-10-19"]), ["2026-10-19"]);
});
