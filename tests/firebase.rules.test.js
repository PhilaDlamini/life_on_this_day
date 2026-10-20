import { readFile } from "node:fs/promises";
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { deleteObject, getBytes, listAll, ref as storageRef, uploadBytes } from "firebase/storage";
import { commitPost } from "../src/firebase/publish.js";
import { get, ref, set, update } from "firebase/database";

// Ordinary npm test stays offline. The dedicated rules command starts the emulator.
const enabled = Boolean(process.env.FIREBASE_DATABASE_EMULATOR_HOST);
let environment;
const ownerUID = "test-journal-owner";
const ownerToken = { email_verified: true, firebase: { sign_in_provider: "google.com" } };
const rulesTest = (name, fn) => test(name, { skip: !enabled }, fn);

before(async () => {
  if (!enabled) return;
  const source = await readFile(new URL("../database.rules.json", import.meta.url), "utf8");
  const configuredOwner = JSON.parse(source).rules.posts.$date[".write"].match(/auth.uid === '([^']+)'/)[1];
  const rules = source.replaceAll(configuredOwner, ownerUID);
  const storageRules = (await readFile(new URL("../storage.rules", import.meta.url), "utf8")).replaceAll(configuredOwner, ownerUID);
  environment = await initializeTestEnvironment({ projectId: "demo-life-on-this-day", database: { rules }, storage: { rules: storageRules } });
  await environment.withSecurityRulesDisabled(async (context) => {
    const database = context.database();
    await set(ref(database), {
      posts: { "2026-10-18": { type: "text", text: "A public entry." } },
      drafts: { [ownerUID]: { "2026-10-19": { type: "text", text: "Private." } } },
    });
  });
});

after(async () => { if (environment) await environment.cleanup(); });

rulesTest("visitors can read published posts but not the root or drafts", async () => {
  const database = environment.unauthenticatedContext().database();
  const snapshot = await assertSucceeds(get(ref(database, "posts")));
  assert.equal(snapshot.child("2026-10-18/text").val(), "A public entry.");
  await assertFails(get(ref(database)));
  await assertFails(get(ref(database, "drafts")));
});

rulesTest("visitors and another Google user cannot write or delete entries", async () => {
  for (const context of [environment.unauthenticatedContext(), environment.authenticatedContext("another-user", ownerToken)]) {
    const database = context.database();
    await assertFails(set(ref(database, "posts/2026-10-17"), { type: "text", text: "No." }));
    await assertFails(set(ref(database, "posts/2026-10-18"), null));
  }
});

rulesTest("the verified Google owner can save each supported format", async () => {
  const database = environment.authenticatedContext(ownerUID, ownerToken).database();
  for (const [date, post] of Object.entries({
    "2026-10-15": { type: "text", text: "Words." },
    "2026-10-16": { type: "photo", photoURL: "https://example.com/photo.jpg", alt: "Light." },
    "2026-10-17": { type: "audio", audioURL: "https://example.com/memo.m4a", duration: 12 },
  })) await assertSucceeds(set(ref(database, `posts/${date}`), post));
});

rulesTest("the owner cannot write combined formats, unknown fields, bad keys, or unsafe URLs", async () => {
  const database = environment.authenticatedContext(ownerUID, ownerToken).database();
  const invalid = [
    { type: "text", text: "Words", photoURL: "https://example.com/photo.jpg" },
    { type: "text", text: "" },
    { type: "photo", photoURL: "javascript:alert(1)" },
    { type: "audio", audioURL: "https://example.com/memo.m4a", alt: "Not a photo" },
    { type: "text", text: "Words", secret: true },
    { type: "video", videoURL: "https://example.com/video.mp4" },
  ];
  for (const post of invalid) await assertFails(set(ref(database, "posts/2026-10-20"), post));
  await assertFails(set(ref(database, "posts/2026-13-01"), { type: "text", text: "No." }));
});

rulesTest("an unverified or non-Google session cannot use the owner's UID to write", async () => {
  for (const token of [
    { ...ownerToken, email_verified: false },
    { email_verified: true, firebase: { sign_in_provider: "password" } },
  ]) {
    const database = environment.authenticatedContext(ownerUID, token).database();
    await assertFails(set(ref(database, "posts/2026-10-21"), { type: "text", text: "No." }));
  }
});

rulesTest("drafts and configuration remain inaccessible even to the owner in this checkpoint", async () => {
  const database = environment.authenticatedContext(ownerUID, ownerToken).database();
  await assertFails(get(ref(database, "drafts")));
  await assertFails(set(ref(database, "ownerUID"), "another-user"));
  await assertFails(set(ref(database, `drafts/${ownerUID}/2026-10-20`), { type: "text", text: "Later." }));
});


rulesTest("publishing seals an empty date and rejects a second entry", async () => {
  const database = environment.authenticatedContext(ownerUID, ownerToken).database();
  const original = { type: "text", text: "First entry." };
  await commitPost(database, "2026-10-23", original);
  await assert.rejects(commitPost(database, "2026-10-23", { type: "text", text: "Revised." }), /already has an entry/);
  assert.deepEqual((await get(ref(database, "posts/2026-10-23"))).val(), original);
});

rulesTest("the owner cannot change, replace, or delete a published moment, including nested writes", async () => {
  const database = environment.authenticatedContext(ownerUID, ownerToken).database();
  const entry = ref(database, "posts/2026-10-18");
  const original = (await get(entry)).val();
  await assertFails(set(entry, { type: "text", text: "Revised." }));
  await assertFails(set(entry, { type: "photo", photoURL: "https://example.com/photo.jpg" }));
  await assertFails(set(entry, null));
  await assertFails(set(ref(database, "posts/2026-10-18/text"), "Changed."));
  await assertFails(update(entry, { text: "Changed." }));
  await assertFails(update(ref(database), { "posts/2026-10-18/text": "Changed." }));
  await assertFails(set(ref(database, "posts"), {}));
  assert.deepEqual((await get(entry)).val(), original);
});

rulesTest("concurrent publishers can keep only one moment for a date", async () => {
  const first = environment.authenticatedContext(ownerUID, ownerToken).database();
  const second = environment.authenticatedContext(ownerUID, ownerToken).database();
  const results = await Promise.allSettled([
    commitPost(first, "2026-10-25", { type: "text", text: "First device." }),
    commitPost(second, "2026-10-25", { type: "text", text: "Second device." }),
  ]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.ok(["First device.", "Second device."].includes((await get(ref(first, "posts/2026-10-25/text"))).val()));
});

rulesTest("failed validation leaves a new date empty", async () => {
  const database = environment.authenticatedContext(ownerUID, ownerToken).database();
  await assert.rejects(commitPost(database, "2026-10-24", { type: "audio", audioURL: "https://example.com/memo.m4a", duration: 61 }));
  assert.equal((await get(ref(database, "posts/2026-10-24"))).val(), null);
});


rulesTest("Storage allows owner uploads and public downloads, but no deletion even by the owner", async () => {
  const path = "published/2026-10-18/test-upload/photo.jpg";
  const ownerStorage = environment.authenticatedContext(ownerUID, ownerToken).storage();
  await assertSucceeds(uploadBytes(storageRef(ownerStorage, path), new Uint8Array([1, 2, 3]), { contentType: "image/jpeg" }));
  const publicStorage = environment.unauthenticatedContext().storage();
  assert.equal((await assertSucceeds(getBytes(storageRef(publicStorage, path)))).byteLength, 3);
  await assertFails(listAll(storageRef(publicStorage, "published")));
  await assertFails(deleteObject(storageRef(publicStorage, path)));
  await assertFails(uploadBytes(storageRef(publicStorage, "published/2026-10-18/visitor/photo.jpg"), new Uint8Array([1]), { contentType: "image/jpeg" }));
  const otherStorage = environment.authenticatedContext("someone-else", ownerToken).storage();
  await assertFails(uploadBytes(storageRef(otherStorage, "published/2026-10-18/other/photo.jpg"), new Uint8Array([1]), { contentType: "image/jpeg" }));
  await assertFails(deleteObject(storageRef(ownerStorage, path)));
  assert.equal((await getBytes(storageRef(publicStorage, path))).byteLength, 3);
});

rulesTest("Storage rejects oversized files, unexpected types, private paths, and in-place replacement", async () => {
  const storage = environment.authenticatedContext(ownerUID, ownerToken).storage();
  const put = (path, bytes, contentType) => uploadBytes(storageRef(storage, path), new Uint8Array(bytes), { contentType });
  await assertFails(put("published/2026-10-18/limits/photo.jpg", 800 * 1024 + 1, "image/jpeg"));
  await assertFails(put("published/2026-10-18/limits/thumbnail.jpg", 100 * 1024 + 1, "image/jpeg"));
  await assertFails(put("published/2026-10-18/limits/recording", 5 * 1024 * 1024 + 1, "audio/mp4"));
  await assertFails(put("published/2026-10-18/types/photo.jpg", 5, "text/html"));
  await assertFails(put("published/2026-10-18/types/recording", 5, "application/javascript"));
  await assertFails(put("drafts/test/private.jpg", 5, "image/jpeg"));
  await assertSucceeds(put("published/2026-10-18/immutable/photo.jpg", 5, "image/jpeg"));
  await assertFails(put("published/2026-10-18/immutable/photo.jpg", 6, "image/jpeg"));
});
