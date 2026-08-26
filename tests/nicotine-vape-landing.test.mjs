import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const source = fs.readFileSync(new URL("../app/info/nicotine-vapes-gerrard-bay/page.tsx", import.meta.url), "utf8");
const images = ["1091-Beast-Mode-Max.webp","GEEK-PROMAX.jpg","geek_universe_pulse_x_25k.webp","1086-Level-X-G2-pod.webp","nexa_showcase_600x600.webp","1081OVNS10000.jpg"];
test("Native Medicine Garden nicotine page uses six live-checked VAPE PENS images and safe routes", () => {
  for (const image of images) assert.match(source, new RegExp(image.replaceAll(".", "\\.")));
  assert.equal((source.match(/image: /g) ?? []).length, 6);
  assert.match(source, /menuHref="\/items\/vapes"/);
  assert.match(source, /showMenuGrid=\{false\}/);
  assert.doesNotMatch(source, /address=/);
  assert.doesNotMatch(source, /hours=/);
});
