import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const assets = [
  {
    path: fileURLToPath(
      new URL("../public/banners/FlowerTvBanner.webp", import.meta.url),
    ),
    width: 2172,
    height: 418,
    expectedBounds: [9, 10, 2161, 407],
  },
  {
    path: fileURLToPath(
      new URL("../public/banners/ItemTv.webp", import.meta.url),
    ),
    width: 2172,
    height: 346,
    expectedBounds: [3, 10, 2171, 335],
  },
] as const;

async function nonWhiteBounds(path: string) {
  const { data, info } = await sharp(path)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const offset = (y * info.width + x) * 3;
      if (Math.min(data[offset], data[offset + 1], data[offset + 2]) < 235) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  return [minX, minY, maxX, maxY];
}

test("NMG TV banners are tightly cropped with preserved border padding", async () => {
  for (const asset of assets) {
    const metadata = await sharp(asset.path).metadata();
    assert.equal(metadata.width, asset.width);
    assert.equal(metadata.height, asset.height);
    assert.deepEqual(await nonWhiteBounds(asset.path), asset.expectedBounds);
  }
});

test("TV1 retains its responsive CSS banner container", () => {
  const page = readFileSync(
    new URL("../app/tv/page.tsx", import.meta.url),
    "utf8",
  );
  const styles = readFileSync(
    new URL("../app/tv/tv.module.css", import.meta.url),
    "utf8",
  );
  assert.match(page, /className=\{styles\.menuBanner\}/);
  assert.match(page, /className=\{styles\.menuBannerImage\}/);
  assert.doesNotMatch(page, /margin:\s*"-40px -40px 30px -40px"/);
  assert.match(styles, /\.menuBanner\s*\{[^}]*overflow:\s*hidden/s);
  assert.match(styles, /\.menuBannerImage\s*\{[^}]*height:\s*auto/s);
});
