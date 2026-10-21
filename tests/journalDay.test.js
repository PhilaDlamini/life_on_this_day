import assert from "node:assert/strict";
import { test } from "node:test";
import { journalDay, OWNER_UID } from "../functions/shared/journalDay.js";
import { publishMoment } from "../functions/publishMoment.js";

const auth = { uid: OWNER_UID, token: { email_verified: true, firebase: { sign_in_provider: "google.com" } } };
const now = () => new Date("2026-10-20T04:00:00Z");
const data = { date: "2026-10-19", post: { type: "text", text: "A moment." } };

test("the journal day uses Pacific midnight in winter, summer, and around DST changes", () => {
  for (const [instant, expected] of [
    ["2027-01-01T07:59:59Z", "2026-12-31"], ["2027-01-01T08:00:00Z", "2027-01-01"],
    ["2026-01-20T07:59:59Z", "2026-01-19"], ["2026-01-20T08:00:00Z", "2026-01-20"],
    ["2026-07-20T06:59:59Z", "2026-07-19"], ["2026-07-20T07:00:00Z", "2026-07-20"],
    ["2026-03-08T09:59:59Z", "2026-03-08"], ["2026-03-08T10:00:00Z", "2026-03-08"],
    ["2026-11-01T08:59:59Z", "2026-11-01"], ["2026-11-01T09:00:00Z", "2026-11-01"],
  ]) assert.equal(journalDay(new Date(instant)), expected);
});

test("the publisher rejects other dates and unauthorized sessions before writing", async () => {
  const commit = () => assert.fail("Rejected submissions must not reach the database");
  for (const date of ["2026-10-18", "2026-10-20", "not-a-date"]) {
    await assert.rejects(publishMoment({ auth, data: { ...data, date } }, { commit, now }), { code: "failed-precondition" });
  }
  for (const session of [null, { ...auth, uid: "another-owner" },
    { ...auth, token: { ...auth.token, email_verified: false } },
    { ...auth, token: { ...auth.token, firebase: { sign_in_provider: "password" } } }]) {
    await assert.rejects(publishMoment({ auth: session, data }, { commit, now }), { code: "permission-denied" });
  }
});

test("the publisher validates content before its privileged database write", async () => {
  const commit = () => assert.fail("Invalid content must not reach the database");
  for (const post of [
    { type: "text", text: " " }, { type: "text", text: "x".repeat(20001) },
    { type: "text", text: "A note", extra: true },
    { type: "photo", photoURL: "javascript:alert(1)" },
    { type: "photo", photoURL: "https://example.com/photo.jpg", alt: "x".repeat(2001) },
    { type: "audio", audioURL: "https://example.com/memo.m4a", duration: 61 },
  ]) await assert.rejects(publishMoment({ auth, data: { ...data, post } }, { commit, now }), { code: "invalid-argument" });
});

test("valid formats publish for today and an occupied day stays final", async () => {
  for (const post of [data.post,
    { type: "photo", photoURL: "https://example.com/photo.jpg", thumbnailURL: "https://example.com/thumb.jpg", alt: "Light." },
    { type: "audio", audioURL: "https://example.com/memo.m4a", duration: 60, waveform: [12, 100] },
  ]) {
    const result = await publishMoment({ auth, data: { ...data, post } }, { now, commit: async (date, value) => {
      assert.equal(date, data.date);
      assert.deepEqual(value, post.type === "text" ? { type: "text", runs: [{ text: post.text }] } : post);
      return true;
    } });
    assert.deepEqual(result, { date: data.date });
  }
  await assert.rejects(publishMoment({ auth, data }, { now, commit: async () => false }), { code: "already-exists" });
  const rollover = [new Date("2026-10-20T06:59:59Z"), new Date("2026-10-20T07:00:00Z")];
  await assert.rejects(publishMoment({ auth, data }, {
    now: () => rollover.shift(), commit: async () => false,
  }), { code: "failed-precondition" });
});
