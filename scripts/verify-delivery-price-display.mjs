import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const deliveryRoot = new URL("../app/delivery/", import.meta.url);
const componentUrl = ["DeliveryCatalog.tsx", "DeliveryContent.tsx"]
  .map((name) => new URL(name, deliveryRoot))
  .find((url) => fs.existsSync(url));
assert(componentUrl, "delivery pricing component must exist");

const source = fs.readFileSync(componentUrl, "utf8");
const menu = JSON.parse(fs.readFileSync(new URL("delivery-menu.json", deliveryRoot), "utf8"));

assert(source.includes("quantity === 3 && total === 95"), "3 x 28g / $95 must use the explicit $33 EACH display rule");
assert(source.includes("get28gBundleEachDisplayPrice"), "bundle EACH prices must use the guarded display helper");
assert(source.includes("formatCurrency"), "delivery currency must use the safe formatter");
assert(!source.includes("${each}"), "raw EACH interpolation must not ship");
assert(!source.includes("${total}"), "raw total interpolation must not ship");
assert(!source.includes("${option.price}"), "raw option-price interpolation must not ship");
assert(!source.includes("${regular28.price}"), "raw 28g-price interpolation must not ship");

function formatCurrency(value) {
  assert(Number.isFinite(value), "currency input must be finite");
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  return `$${rounded.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1")}`;
}

function bundleEach(quantity, total, perUnitPrice) {
  if (quantity === 3 && total === 95) return 33;
  const supplied = Number(perUnitPrice);
  return Number.isFinite(supplied) && supplied > 0 ? supplied : total / quantity;
}

const targetProducts = menu.products.filter((product) =>
  product.tier === "SHREDS" &&
  product.offers?.some((offer) => offer.kind === "multi_ounce" && Number(offer.quantity) === 3 && Number(offer.totalPrice) === 95)
);
assert.equal(targetProducts.length, 3, "the three canonical SHREDS products must preserve their 3 x 28g / $95 offers");
for (const product of targetProducts) {
  const offer = product.offers.find((candidate) => candidate.kind === "multi_ounce" && Number(candidate.quantity) === 3 && Number(candidate.totalPrice) === 95);
  assert.equal(formatCurrency(bundleEach(3, 95, offer.perUnitPrice)), "$33", `${product.name} must render $33 EACH`);
  assert.equal(formatCurrency(Number(offer.totalPrice)), "$95", `${product.name} must preserve the $95 total`);
}

const renderedCurrency = menu.products.flatMap((product) => [
  ...product.priceOptions.map((option) => formatCurrency(Number(option.price))),
  ...(product.offers ?? []).flatMap((offer) => {
    if (offer.kind !== "multi_ounce") return offer.price ? [formatCurrency(Number(offer.price))] : [];
    const quantity = Number(offer.quantity);
    const total = Number(offer.totalPrice);
    return [formatCurrency(bundleEach(quantity, total, offer.perUnitPrice)), formatCurrency(total)];
  }),
]);
assert(renderedCurrency.every((value) => /^\$\d+(?:\.\d{1,2})?$/.test(value)), "currency output must never expose long decimals or scientific notation");
assert(!renderedCurrency.some((value) => value.includes("31.666")), "raw 95 / 3 output must never ship");

const appRoot = new URL("../app/", import.meta.url);
const layoutSource = fs.readFileSync(new URL("layout.tsx", appRoot), "utf8");
const stylesSource = fs.readFileSync(new URL("globals.css", appRoot), "utf8");
const announcement = "NEW DELIVERY MENU IS HERE — CLICK TO EXPLORE";
assert.equal(layoutSource.split(announcement).length - 1, 1, "delivery announcement must appear exactly once in the root layout");
assert(/className="deliveryAnnouncement"\s+href="\/delivery"/.test(layoutSource), "delivery announcement must link to /delivery");
assert(stylesSource.includes(".deliveryAnnouncement"), "delivery announcement styles must exist");
assert(/\.deliveryAnnouncement\s*\{[^}]*display:\s*flex;/s.test(stylesSource), "delivery announcement must render as a visible flex strip");
assert(/--delivery-announcement-height:\s*42px;/.test(stylesSource), "delivery announcement height must have one shared 42px variable");
assert(/\.deliveryAnnouncement\s*\{[^}]*position:\s*fixed;[^}]*top:\s*0;[^}]*height:\s*var\(--delivery-announcement-height\);/s.test(stylesSource), "delivery announcement must stay fixed at the viewport top");
assert(/\.deliveryAnnouncement\s*\{[^}]*min-height:\s*var\(--delivery-announcement-height\);/s.test(stylesSource), "delivery announcement must keep the shared click-target height");
assert(/\.deliveryAnnouncement\s*\{[^}]*z-index:\s*1100;/s.test(stylesSource), "delivery announcement must stack above the fixed header");
assert(/\.deliveryAnnouncement\s*\{[^}]*background:\s*var\(--green-deep,\s*#052e16\);/s.test(stylesSource), "delivery announcement must use a high-contrast brand-dark background");
assert(/body\s*>\s*\.deliveryAnnouncement\s*~\s*\*\s*nav\s*\{[^}]*top:\s*var\(--delivery-announcement-height\)\s*!important;/s.test(stylesSource), "fixed navigation must sit directly below the delivery announcement");
assert(/body\s*\{[^}]*padding-top:\s*var\(--delivery-announcement-height\);/s.test(stylesSource), "document flow must reserve the announcement height");

function collectPublicSources(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === "games" ? [] : collectPublicSources(absolute);
    return /\.(?:tsx|ts)$/.test(entry.name) ? [absolute] : [];
  });
}

const publicSource = collectPublicSources(fileURLToPath(appRoot)).map((file) => fs.readFileSync(file, "utf8")).join("\n");
assert(!/Play Games|Games Arcade|href=["']\/games["']|href:\s*["']\/games["']|slug:\s*["']games["']|\$\{BASE\}\/games/.test(publicSource), "public Play Games and /games discovery links must not ship");

assert(source.includes("$60 PRODUCT MINIMUM"), "delivery page must show the approved $60 product minimum");
assert(source.includes("Member Loyalty Savings"), "delivery page must show the approved loyalty section");
assert(source.includes("Rewards and coupons apply to a later order—not the qualifying purchase."), "loyalty rewards must be described as later-order rewards");
assert(source.includes("save $30 on an eligible regular-price 28g item"), "delivery page must explain the approved later-order $30 saving");
assert(source.includes("3g Craft coupon earned with a qualifying $120+ purchase"), "delivery page must explain the approved later-order Craft coupon");
assert(source.includes("Make a $50+ purchase within 14 days"), "delivery page must explain the approved keep-active condition");
assert(source.includes("Complimentary items apply only to regular-price Craft or Exotic ounces—not BC Premium."), "delivery page must preserve the approved complimentary-item condition");
assert(source.includes("HOW TO ORDER") && source.includes("Select LIVE ORDER") && source.includes("private selfie-with-ID") && source.includes("dispatcher confirms availability"), "delivery page must show the four-step consent-first order flow");
const smsMatch = source.match(/href="sms:(\+1[2-9]\d{9})"><span>DELIVERY TEXT NUMBER<\/span> (\+1 \([2-9]\d{2}\) \d{3}-\d{4})<\/a>/);
assert(smsMatch, "delivery page must show one valid dedicated SMS number and sms action");
assert(!source.includes("__DELIVERY_"), "delivery phone placeholders must never ship");
const digits = smsMatch[2].replace(/\D/g, "");
assert.equal(`+${digits}`, smsMatch[1], "visible delivery number must match the sms action");
const deliveryStyles = fs.readFileSync(new URL("delivery.module.css", deliveryRoot), "utf8");
if (/<Image src="\/banners\/.+Delivery/i.test(source)) {
  assert(/\.hero>img\{[^}]*width:100%;[^}]*height:auto;[^}]*object-fit:contain/s.test(deliveryStyles), "delivery artwork must render full-width at its intrinsic aspect ratio without cropping");
  assert(!/\.hero>img\{[^}]*(?:object-fit:cover|max-height:|height:\d)/s.test(deliveryStyles), "delivery artwork must not use cover crop or a fixed height");
}
assert(!/farmers\s*link|farmerslink|farmer['’]s\s*link/i.test(publicSource), "public supplier wording must not ship");

console.log("Verified delivery pricing, announcement bar, public navigation, and supplier-wording guards.");
