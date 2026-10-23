import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("tv-data publishes the cigarette headers and strips real cigarettes only when tv is off", () => {
  const route = read("../app/api/tv-data/route.ts");
  assert.match(route, /snapshotHeaders\(snap\)/);
  assert.match(route, /reconcileSurfaceItems\(menuItems, snap\.items, snap\.tv\.show\)/);
  assert.doesNotMatch(route, /type === ["']cig["']/);
  assert.doesNotMatch(route, /SHOW_CIGARETTES/);
});

test("tv and tv2 read x-tv-data-cig-tv on the existing tv-data poll", () => {
  const tv = read("../app/tv/page.tsx");
  const tv2 = read("../app/tv2/page.tsx");
  for (const source of [tv, tv2]) {
    assert.match(source, /readCigaretteTvHeader\(/);
    assert.match(source, /fetch\("\/api\/tv-data\?type=items"\)/);
    assert.match(source, /5\*60\*1000/);
    assert.doesNotMatch(source, /SHOW_CIGARETTES/);
  }
  assert.match(tv2, /cigaretteBoardItems\(items, show\)/);
  assert.match(tv2, /title = isCig \? \(tvCig\.show \? tvCig\.wording\.tv2BoardTitle : "BACKWOODS"\)/);
  assert.equal((tv2.match(/setInterval\(/g) || []).length, 4);
  assert.equal((tv.match(/setInterval\(loadData, 5\*60\*1000\)/g) || []).length, 1);
});
