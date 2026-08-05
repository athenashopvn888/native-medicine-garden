import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  DEFAULT_EFFECTS,
  SATIVA_EFFECTS,
  getFlowerEffects,
} from "../app/tv/flowerEffects.ts";

const tvPage = readFileSync(
  new URL("../app/tv/page.tsx", import.meta.url),
  "utf8",
);

test("NMG TV uses the ADC effects mappings", () => {
  assert.deepEqual(SATIVA_EFFECTS, [
    ["⚡", "Energy"],
    ["🧠", "Cerebral"],
    ["🚀", "Uplift"],
  ]);
  assert.deepEqual(DEFAULT_EFFECTS, [
    ["🛋️", "Couch Lock"],
    ["😌", "Relax"],
    ["🌙", "Sleepy"],
  ]);
  assert.strictEqual(getFlowerEffects("SATIVA"), SATIVA_EFFECTS);
  assert.strictEqual(getFlowerEffects("indica"), DEFAULT_EFFECTS);
});

test("NMG VibeCard renders effects without placeholder product-detail labels", () => {
  assert.match(tvPage, /<div className=\{styles\.vibeHead\}>EFFECTS<\/div>/);
  assert.match(tvPage, /const vibes = getFlowerEffects\(type\)/);
  assert.doesNotMatch(tvPage, /PRODUCT DETAILS|Package Details/);
});
