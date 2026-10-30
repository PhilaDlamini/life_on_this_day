import assert from "node:assert/strict";
import { test } from "node:test";
import { applyAppearance, readAppearance, saveAppearance } from "../src/utils/appearance.js";

function withBrowserGlobals(values, run) {
  const originals = Object.fromEntries(Object.keys(values).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  try {
    for (const [key, value] of Object.entries(values)) Object.defineProperty(globalThis, key, { value, configurable: true });
    run();
  } finally {
    for (const [key, original] of Object.entries(originals)) {
      if (original) Object.defineProperty(globalThis, key, original);
      else delete globalThis[key];
    }
  }
}

test("appearance defaults to System and restores only supported saved choices", () => {
  let saved = null;
  withBrowserGlobals({ localStorage: { getItem: () => saved, setItem: (_, value) => { saved = value; } } }, () => {
    assert.equal(readAppearance(), "system");
    for (const value of ["light", "dark", "system"]) {
      saveAppearance(value);
      assert.equal(readAppearance(), value);
    }
    saved = "invalid";
    assert.equal(readAppearance(), "system");
  });
});

test("blocked storage does not stop theme changes or restoring System browser colors", () => {
  const metas = ["light", "dark"].map((scheme) => ({ dataset: { scheme }, media: "" }));
  const document = { documentElement: { dataset: {} }, querySelectorAll: () => metas };
  const blocked = () => { throw new Error("Storage unavailable"); };
  withBrowserGlobals({ document, localStorage: { getItem: blocked, setItem: blocked } }, () => {
    assert.equal(readAppearance(), "system");
    assert.doesNotThrow(() => saveAppearance("dark"));
    applyAppearance("dark");
    assert.equal(document.documentElement.dataset.appearance, "dark");
    assert.deepEqual(metas.map((meta) => meta.media), ["not all", "all"]);
    applyAppearance("light");
    assert.deepEqual(metas.map((meta) => meta.media), ["all", "not all"]);
    applyAppearance("system");
    assert.equal(document.documentElement.dataset.appearance, "system");
    assert.deepEqual(metas.map((meta) => meta.media), ["(prefers-color-scheme: light)", "(prefers-color-scheme: dark)"]);
  });
});
