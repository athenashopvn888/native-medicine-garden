import assert from "node:assert/strict";
import fs from "node:fs";

const menu = JSON.parse(fs.readFileSync(new URL("../app/delivery/delivery-menu.json", import.meta.url)));
assert.equal(menu.products.length, 63, "delivery fallback must contain 63 products");
const images = menu.products.flatMap((product) => product.images);
assert.equal(images.length, 66, "delivery fallback must preserve 66 image slots");
assert(images.every((url) => /^https:\/\/athena-cannabis-images\.vercel\.app\/products\/delivery\/v1\/delivery-v1-[a-f0-9]{24}\.webp$/.test(url)), "every image must use the versioned Athena path");
const source = fs.readFileSync(new URL("../app/delivery/DeliveryContent.tsx", import.meta.url), "utf8");
assert(source.includes("unoptimized"), "catalog images must bypass the storefront optimizer");
assert(!source.includes("/api/catalog-image"), "legacy SOD image proxy must not appear");
assert(!source.includes("__SOD_"), "placeholders must not ship");
for (const url of [...new Set(images)]) {
  const response = await fetch(url);
  assert.equal(response.status, 200, `${url} must return 200`);
  assert.match(response.headers.get("content-type") || "", /^image\//, `${url} must be an image`);
  assert.match(response.headers.get("cache-control") || "", /immutable/, `${url} must be immutable`);
}
console.log(`Verified ${menu.products.length} products, ${images.length} image slots, ${new Set(images).size} immutable Athena assets.`);
