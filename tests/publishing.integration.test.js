import assert from "node:assert/strict";
import { test } from "node:test";
import { OWNER_UID, journalDay } from "../functions/shared/journalDay.js";

const enabled = Boolean(process.env.FIREBASE_DATABASE_EMULATOR_HOST);
const project = "demo-life-on-this-day";
const endpoint = `http://127.0.0.1:5001/${project}/us-central1/publishEntry`;
const emulatorTest = (name, fn) => test(name, { skip: !enabled }, fn);

// Unsigned tokens are accepted ONLY by local Auth/Functions emulators.
function ownerToken(uid = OWNER_UID) {
  const issued = Math.floor(Date.now() / 1000);
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "none", typ: "JWT" })}.${encode({
    aud: project, iss: `https://securetoken.google.com/${project}`, sub: uid, user_id: uid,
    iat: issued, exp: issued + 3600, auth_time: issued, email_verified: true,
    firebase: { sign_in_provider: "google.com", identities: {} },
  })}.`;
}

async function publish(date, post, token = ownerToken()) {
  const response = await fetch(endpoint, { method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ data: { date, post } }),
  });
  return { status: response.status, body: await response.json() };
}

emulatorTest("callable rejects visitors, other accounts, and dates outside today", async () => {
  const post = { type: "text", text: "Not published." };
  for (const token of [null, ownerToken("another-user")]) {
    const response = await publish(journalDay(), post, token);
    assert.equal(response.body.error.status, "PERMISSION_DENIED");
  }
  for (const date of ["2000-01-01", "2099-01-01"]) {
    const response = await publish(date, post);
    assert.equal(response.body.error.status, "FAILED_PRECONDITION");
  }
  const invalid = await publish(journalDay(), { type: "audio", audioURL: "https://example.com/audio", duration: 61 });
  assert.equal(invalid.body.error.status, "INVALID_ARGUMENT");
  const malformed = await publish(journalDay(), { type: "text", text: "Safe", textRuns: [{ text: "Different", bold: true }] });
  assert.equal(malformed.body.error.status, "INVALID_ARGUMENT");
});

emulatorTest("concurrent callable publications keep exactly one entry and reject replacement", async () => {
  const date = journalDay();
  const responses = await Promise.all([
    publish(date, { type: "text", text: "First device.", textRuns: [{ text: "First", bold: true, italic: true, underline: true }, { text: " device." }] }),
    publish(date, { type: "text", text: "Second device.", textRuns: [{ text: "Second", bold: true, italic: true, underline: true }, { text: " device." }] }),
  ]);
  assert.equal(responses.filter((response) => response.status === 200).length, 1);
  assert.equal(responses.filter((response) => response.body.error?.status === "ALREADY_EXISTS").length, 1);
  const response = await fetch(`http://${process.env.FIREBASE_DATABASE_EMULATOR_HOST}/posts/${date}.json?ns=${project}`);
  const original = await response.json();
  assert.ok(["First device.", "Second device."].includes(original.text));
  assert.equal(original.textRuns[0].bold, true);
  assert.equal(original.textRuns[0].italic, true);
  assert.equal(original.textRuns[0].underline, true);
  assert.equal(original.textRuns.map((run) => run.text).join(""), original.text);
  assert.equal((await publish(date, { type: "text", text: "Replacement." })).body.error.status, "ALREADY_EXISTS");
});
