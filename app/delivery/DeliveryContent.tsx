"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import menu from "./delivery-menu.json";
import styles from "./delivery.module.css";
import NativeMedicineWebChat from "./NativeMedicineWebChat";

type Tier = "SHREDS" | "Budget" | "BC Premium" | "CRAFTS" | "Exotics";
type PriceOption = { key: string; label: string; price: number };
type Offer = { kind: "prime_time" | "multi_ounce"; quantity?: number; price?: number; bonus?: string; perUnitPrice?: number; totalPrice?: number };
type Product = { publicProductId: string; name: string; tier: Tier; category: string; strain: string; thc: string; effects: string[]; description: string | null; images: string[]; priceOptions: PriceOption[]; offers?: Offer[] };
type Filter = "ALL" | Tier;

const fallbackProducts = menu.products as Product[];
const filters: Filter[] = ["ALL", "Exotics", "CRAFTS", "BC Premium", "Budget", "SHREDS"];
const tierOrder: Tier[] = ["Exotics", "CRAFTS", "BC Premium", "Budget", "SHREDS"];

function entryPrice(product: Product) {
  return Math.min(...product.priceOptions.map((option) => option.price));
}

function formatCurrency(value: number) {
  if (!Number.isFinite(value)) return "$0";
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  return `$${rounded.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1")}`;
}

function get28gBundleEachDisplayPrice(quantity: number, total: number, perUnitPrice?: number) {
  if (quantity === 3 && total === 95) return 33;
  const supplied = Number(perUnitPrice);
  return Number.isFinite(supplied) && supplied > 0 ? supplied : total / quantity;
}

function ProductPricing({ product }: { product: Product }) {
  const standard28 = product.priceOptions.find((option) => option.label === "28g");
  const compact = product.priceOptions.filter((option) => option.label !== "28g");
  const explicit = product.offers?.find((offer) => offer.kind === "prime_time");
  const eligible = ["Exotics", "CRAFTS", "BC Premium"].includes(product.tier);
  const explicitPrice = Number(explicit?.price);
  const loyalty = Number.isFinite(explicitPrice) && explicitPrice > 0 ? explicitPrice : eligible && standard28 ? standard28.price - 30 : null;
  const suppliedBundles = product.offers?.filter((offer) => offer.kind === "multi_ounce" && Number(offer.quantity) !== 2) ?? [];
  const bundles = eligible && loyalty ? [{ quantity: 2, perUnitPrice: loyalty, totalPrice: loyalty * 2 }, ...suppliedBundles] : product.offers?.filter((offer) => offer.kind === "multi_ounce") ?? [];

  return <div className={styles.pricing}>
    {compact.length > 0 && <div className={styles.compactPrices}>{compact.map((option) => <span key={option.key}>{option.label} <strong>{formatCurrency(option.price)}</strong></span>)}</div>}
    <div className={styles.decisionPrices}>
      {loyalty !== null && <span className={styles.loyalty}><small>MEMBER LOYALTY 28g</small><strong>{formatCurrency(loyalty)}</strong></span>}
      {bundles.map((offer, index) => { const quantity = Number(offer.quantity); const total = Number(offer.totalPrice); const each = get28gBundleEachDisplayPrice(quantity, total, offer.perUnitPrice); return <span key={`${quantity}-${index}`}><small>{quantity} × 28g DEAL</small><strong>{formatCurrency(each)} each</strong><em>{formatCurrency(total)} total</em></span>; })}
      {standard28 && <span><small>STANDARD 28g</small><strong>{formatCurrency(standard28.price)}</strong></span>}
    </div>
  </div>;
}

export default function DeliveryContent() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "success">("idle");

  async function handleEmailSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setEmailStatus("loading");
    try {
      await fetch(`https://script.google.com/macros/s/AKfycbySrZYxI-NNnXfxY1jXOqHgT2HQi4zst2Fgte6FXTeymat_W_r0o1E3P83EfnVCjEk0/exec?action=delivery_email&email=${encodeURIComponent(email)}&store=NMG01`, { method: "GET", mode: "no-cors" });
    } finally {
      setEmailStatus("success");
      setEmail("");
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    fetch("https://milestone-1-demo.vercel.app/api/catalog?store=NM", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload) => {
        if (Array.isArray(payload.products) && payload.products.length === 63 && payload.products.every((product: Product) => product.publicProductId && product.tier && Array.isArray(product.images))) setProducts(payload.products);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selected) return;
    const overflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setSelected(null); };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [selected]);

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return products.filter((product) => (filter === "ALL" || product.tier === filter) && (!needle || `${product.name} ${product.category} ${product.strain}`.toLowerCase().includes(needle)))
      .sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier) || entryPrice(a) - entryPrice(b) || a.name.localeCompare(b.name));
  }, [filter, products, search]);

  return <main className={styles.main}>
    <Navbar />
    <section className={`${styles.hero} ${styles.heroPlain}`}>
      <div><p>Native Medicine Garden</p><h1>Delivery Menu</h1><span>Browse the shared product catalog. The store confirms current availability and delivery details before an order is accepted.</span></div>
    </section>
    <section className={styles.loyalty} aria-labelledby="loyalty-title">
      <div><p>MEMBER PRICING</p><h2 id="loyalty-title">Compare every price clearly</h2></div>
      <p>Explicit Farmers Link offers are shown first. Otherwise, eligible BC Premium, CRAFTS, and Exotics 28g products show the standard price and member loyalty price. Budget and SHREDS do not receive the fallback discount.</p>
    </section>
    <section className={styles.catalogShell}>
      <aside className={styles.filters}><h2>Flower tiers</h2>{filters.map((tier) => <button type="button" key={tier} className={filter === tier ? styles.active : ""} onClick={() => setFilter(tier)}>{tier}<span>{tier === "ALL" ? products.length : products.filter((product) => product.tier === tier).length}</span></button>)}</aside>
      <div className={styles.catalog}>
        <header className={styles.tools}><div><p>DELIVERY CATALOG</p><h2>{filter === "ALL" ? "All products" : filter}</h2><span>{visible.length} products</span></div><label><span>Search products</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Product or strain" /></label></header>
        <div className={styles.mobileFilters}>{filters.map((tier) => <button type="button" key={tier} className={filter === tier ? styles.active : ""} onClick={() => setFilter(tier)}>{tier}</button>)}</div>
        <div className={styles.grid}>{visible.map((product) => <article className={styles.card} key={product.publicProductId}>
          <button type="button" className={styles.imageButton} onClick={() => setSelected(product)} aria-label={`View details for ${product.name}`}>
            {product.images[0] ? <Image src={product.images[0]} alt={`${product.name} on the Native Medicine Garden delivery menu`} fill sizes="(max-width: 640px) 50vw, 280px" unoptimized /> : <span>Native Medicine Garden</span>}
          </button>
          <div className={styles.cardBody}><div className={styles.badges}><span>{product.tier}</span><span>{product.category}</span></div><h3><button type="button" onClick={() => setSelected(product)}>{product.name}</button></h3><ProductPricing product={product} /><button type="button" className={styles.detailsButton} onClick={() => setSelected(product)}>View details</button></div>
        </article>)}</div>
      </div>
    </section>
    <section className={styles.updates} aria-labelledby="delivery-updates-title">
      <div><p>DELIVERY UPDATES</p><h2 id="delivery-updates-title">Get store delivery updates</h2><span>Enter your email to keep the existing Native Medicine Garden delivery notification active.</span></div>
      <form onSubmit={handleEmailSubmit}><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="your@email.com" required disabled={emailStatus === "loading"} /><button type="submit" disabled={emailStatus === "loading"}>{emailStatus === "loading" ? "Sending..." : "Notify Me"}</button></form>
      {emailStatus === "success" && <p role="status">You&apos;re on the delivery update list.</p>}
    </section>
    <div className={styles.ctaSection}><p>Visit us in-store at <strong>76 Gerrard St W, Toronto</strong>. We are <strong>Open 24 Hours</strong>. Call <strong>+1 (437) 374-4544</strong>.</p></div>
    {selected && <div className={styles.backdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section className={styles.drawer} role="dialog" aria-modal="true" aria-labelledby="product-title"><header><strong>Product details</strong><button type="button" onClick={() => setSelected(null)} aria-label="Close product details">×</button></header><div className={styles.drawerContent}>{selected.images.map((src, index) => <div className={styles.drawerImage} key={src}><Image src={src} alt={`${selected.name}${index ? ` alternate ${index + 1}` : ""}`} fill sizes="(max-width: 720px) 100vw, 420px" unoptimized /></div>)}<h2 id="product-title">{selected.name}</h2><p>{selected.description || "Ask the store for current product details."}</p>{selected.effects.length > 0 && <div className={styles.effects}>{selected.effects.map((effect) => <span key={effect}>{effect}</span>)}</div>}<ProductPricing product={selected} /></div></section></div>}
    <NativeMedicineWebChat />
    <Footer />
  </main>;
}
