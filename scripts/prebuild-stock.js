/**
 * Prebuild script: Fetches live stock data from Apps Script
 * and writes flowers.json + items.json before Next.js builds.
 *
 * This runs automatically via "prebuild" in package.json.
 * Prefer stock=1 + catalog=1 (faster sequential reads), then merge
 * locally with the same rules as Apps Script buildProductJSON_.
 * Combined ?store=NMG01 is a fallback only (slow Gmail+Sheet merge).
 * If the fetch fails, the existing JSON files are kept as fallback.
 * Never invent SKUs or prices.
 */

const fs = require('fs');
const path = require('path');

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || '';
const STORE_CODE = 'NMG01';
const FETCH_TIMEOUT_MS = 120_000;
const FLOWERS_PATH = path.join(__dirname, '..', 'app', 'lib', 'flowers.json');
const ITEMS_PATH = path.join(__dirname, '..', 'app', 'lib', 'items.json');
const SNAPSHOT_PATH = path.join(__dirname, '..', 'app', 'lib', 'stock-snapshot.json');

const WEIGHTS = [
  ['price3g', '3g'],
  ['price5g', '5g'],
  ['price14g', '14g'],
  ['price28g', '28g'],
];

function storeUrl(extra = '') {
  return `${APPS_SCRIPT_URL}?store=${STORE_CODE}${extra}`;
}

async function fetchJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

function hasSalePrice(f) {
  return !!(
    (f.price3g && f.price3g.sale !== null) ||
    (f.price5g && f.price5g.sale !== null) ||
    (f.price14g && f.price14g.sale !== null) ||
    (f.price28g && f.price28g.sale !== null)
  );
}

function cleanName(name) {
  return name
    .replace(/\s*\(?\s*AAA\+?\s*ON\s*SALE\s*\)?\s*$/i, '')
    .replace(/\s*\(?\s*AAA\+?\s*SALE!?\s*\)?\s*$/i, '')
    .replace(/\s*\bSALE!?\s*$/i, '')
    .replace(/\s*\bON\s*SALE\s*$/i, '')
    .trim();
}

function filterFlowersByStock(flowers, stock) {
  const out = [];
  for (const flower of flowers) {
    const sku = String(flower.sku || '').trim();
    const skuStock = stock[sku];
    if (!skuStock) continue;
    const next = { ...flower };
    for (const [priceKey, weightKey] of WEIGHTS) {
      if (!skuStock[weightKey] || skuStock[weightKey] <= 0) {
        next[priceKey] = null;
      }
    }
    if (!next.price3g && !next.price5g && !next.price14g && !next.price28g) continue;
    out.push(next);
  }
  return out;
}

function filterItemsByStock(items, stock) {
  return items.filter((item) => {
    const skus = String(item.sku || '')
      .split(',')
      .map((sku) => sku.trim().replace(/\.0$/, ''))
      .filter(Boolean);
    return skus.some((sku) => Boolean(stock[sku]));
  });
}

function postProcessFlowers(flowers) {
  const SALE_RE = /\bSALE\b/i;
  const ON_SALE_RE = /ON\s*SALE/i;
  let saleFixed = 0;
  for (const f of flowers) {
    if (!f.isSale) {
      if (SALE_RE.test(f.name) || ON_SALE_RE.test(f.name) || hasSalePrice(f)) {
        f.isSale = true;
        saleFixed++;
      }
    }
    f.name = cleanName(f.name);
  }
  if (saleFixed > 0) console.log(`[prebuild] Fixed ${saleFixed} sale flags from names`);
  return flowers;
}

function postProcessItems(items) {
  let itemsFixed = 0;
  for (const it of items) {
    if (typeof it.price === 'string' && it.price.includes('[object')) {
      it.price = '';
      itemsFixed++;
    }
  }
  if (itemsFixed > 0) console.log(`[prebuild] Fixed ${itemsFixed} mangled item prices`);
  return items;
}

function writeOutputs({ flowers, items, storeCode, stockDate, skuCount, source }) {
  fs.writeFileSync(FLOWERS_PATH, JSON.stringify(flowers, null, 2), 'utf-8');
  console.log(`[prebuild] flowers.json updated: ${flowers.length} products`);

  const tiers = {};
  flowers.forEach((f) => { tiers[f.tier] = (tiers[f.tier] || 0) + 1; });
  Object.entries(tiers).forEach(([t, c]) => console.log(`  ${t}: ${c}`));

  fs.writeFileSync(ITEMS_PATH, JSON.stringify(items, null, 2), 'utf-8');
  console.log(`[prebuild] items.json updated: ${items.length} products`);

  const cats = {};
  items.forEach((i) => { cats[i.category] = (cats[i.category] || 0) + 1; });
  Object.entries(cats).sort().forEach(([c, n]) => console.log(`  ${c}: ${n}`));

  const snapshot = {
    storeCode: storeCode || STORE_CODE,
    stockDate: stockDate || null,
    skuCount: skuCount ?? null,
    flowerCount: flowers.length,
    itemCount: items.length,
    source,
    generatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2), 'utf-8');
  console.log(`[prebuild] stock-snapshot.json written (${source})`);
  console.log(`[prebuild] Stock date: ${snapshot.stockDate || 'unknown'}`);
}

async function loadFromStockAndCatalog() {
  console.log('[prebuild] Fetching stock=1 (ONHAND)...');
  const inventory = await fetchJson(storeUrl('&stock=1'));
  if (!inventory || !inventory.stock || typeof inventory.stock !== 'object') {
    throw new Error('Invalid stock=1 response: missing stock map');
  }
  if (inventory.storeCode && inventory.storeCode !== STORE_CODE) {
    throw new Error(`Unexpected storeCode ${inventory.storeCode}; expected ${STORE_CODE}`);
  }

  console.log('[prebuild] Fetching catalog=1 (Apps Script prices)...');
  const catalog = await fetchJson(storeUrl('&catalog=1'));
  if (!Array.isArray(catalog.flowers) || !Array.isArray(catalog.items)) {
    throw new Error('Invalid catalog=1 response: missing flowers or items');
  }

  return {
    flowers: filterFlowersByStock(catalog.flowers, inventory.stock),
    items: filterItemsByStock(catalog.items, inventory.stock),
    storeCode: inventory.storeCode || STORE_CODE,
    stockDate: inventory.date || null,
    skuCount: inventory.skuCount ?? Object.keys(inventory.stock).length,
    source: 'stock+catalog',
  };
}

async function loadFromCombined() {
  console.log('[prebuild] Falling back to combined ?store=NMG01 feed...');
  const data = await fetchJson(storeUrl());
  if (!Array.isArray(data.flowers) || !Array.isArray(data.items)) {
    throw new Error('Invalid combined response: missing flowers or items');
  }
  return {
    flowers: data.flowers,
    items: data.items,
    storeCode: data.storeCode || STORE_CODE,
    stockDate: data.stockDate || null,
    skuCount: null,
    source: 'combined',
  };
}

async function main() {
  if (!APPS_SCRIPT_URL) {
    console.log('[prebuild] No APPS_SCRIPT_URL set — using existing static JSON files');
    return;
  }

  console.log(`[prebuild] Fetching live NMG01 stock from Apps Script (timeout ${FETCH_TIMEOUT_MS}ms)...`);

  try {
    let payload;
    try {
      payload = await loadFromStockAndCatalog();
    } catch (err) {
      console.warn(`[prebuild] stock+catalog path failed: ${err.message}`);
      payload = await loadFromCombined();
    }

    payload.flowers = postProcessFlowers(payload.flowers);
    payload.items = postProcessItems(payload.items);
    writeOutputs(payload);
    console.log('[prebuild] Done!');
  } catch (err) {
    console.warn(`[prebuild] Live fetch failed: ${err.message}`);
    console.warn('[prebuild] Keeping existing JSON files as fallback');
  }
}

main();
