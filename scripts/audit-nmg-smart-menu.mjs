import { buildSmartLineup, defaultSmartMenuState } from "../app/lib/nmgSmartMenu.ts";
import { NMG_SMART_MENU_CONFIG } from "../app/lib/nmgSmartMenuConfig.ts";

const endpoint = process.env.APPS_SCRIPT_URL;
if (!endpoint) throw new Error("APPS_SCRIPT_URL is required.");
const separator = endpoint.includes("?") ? "&" : "?";
const base = `${endpoint}${separator}store=NMG01`;

async function readJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`NMG inventory endpoint returned HTTP ${response.status}.`);
  return response.json();
}

const inventory = await readJson(`${base}&stock=1`);
const catalog = await readJson(`${base}&catalog=1`);
const sku373Rows = catalog.flowers.filter((flower) => String(flower.sku) === "373").length;
if (sku373Rows !== 1) throw new Error(`Expected one live SKU 373 catalog row, received ${sku373Rows}.`);
const { lineup } = buildSmartLineup({
  inventory,
  flowers: catalog.flowers,
  items: catalog.items,
  state: defaultSmartMenuState(),
  config: NMG_SMART_MENU_CONFIG,
});
console.log(JSON.stringify({ sku373Rows, manifest: lineup.manifest }, null, 2));
