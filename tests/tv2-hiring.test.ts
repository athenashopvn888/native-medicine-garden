import test from "node:test";
import assert from "node:assert/strict";
import {
  TV2_HIRING_INTERVAL_MS,
  TV2_HIRING_REDUCED_MOTION_MESSAGE,
  TV2_HIRING_SLIDES,
  getNextTv2HiringSlide,
} from "../app/tv2/tv2Hiring.ts";

test("NMG TV2 hiring ribbon uses the approved messages and cadence", () => {
  assert.equal(TV2_HIRING_INTERVAL_MS, 3_000);
  assert.deepEqual([...TV2_HIRING_SLIDES], [
    "NOW HIRING BUDTENDERS & MANAGERS",
    "APPLY ONLINE",
    "nativemedicinecannabis.com",
  ]);
  assert.equal(getNextTv2HiringSlide(0), 1);
  assert.equal(getNextTv2HiringSlide(1), 2);
  assert.equal(getNextTv2HiringSlide(2), 0);
});

test("reduced motion uses one static combined NMG message", () => {
  assert.equal(
    TV2_HIRING_REDUCED_MOTION_MESSAGE,
    "NOW HIRING BUDTENDERS & MANAGERS · APPLY ONLINE · nativemedicinecannabis.com",
  );
});
