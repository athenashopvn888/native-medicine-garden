import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { TV_BUNDLE_LABELS } from "../app/tv/tvPricing.ts";

test("regular and sale rows share the approved NMG bundle labels", () => {
  assert.deepEqual(TV_BUNDLE_LABELS, {
    first: "2G = 3G",
    second: "3G = 6G",
  });
});

test("NMG TV ticker no longer includes Play Games", () => {
  const source = readFileSync(
    new URL("../app/tv/page.tsx", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /Play Games/i);
  assert.doesNotMatch(source, /nativemedicinecannabis\.com\/games/i);
});
