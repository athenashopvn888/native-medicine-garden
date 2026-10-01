import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const headerPath = new URL("../app/components/TvStoreHeader.tsx", import.meta.url);

test("TV and TV2 share the current store logo asset", async () => {
  const header = await readFile(headerPath, "utf8");

  assert.ok(header.includes('src="/storeFavicon.webp"'));
  assert.ok(header.includes('alt={`${tvStore.name} logo`}'));
  assert.ok(!header.includes("/banners/logo.jpg"));
});
