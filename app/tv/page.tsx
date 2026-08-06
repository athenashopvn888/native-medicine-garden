"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import styles from "./tv.module.css";
import { TV_TICKER_INTERVAL_MS, TV_TICKER_SLIDES } from "../tvTicker";
import { TV_BUNDLE_LABELS } from "./tvPricing";
import { getFlowerEffects } from "./flowerEffects";
import { NMG_REGULAR_WINDOW_MS, regularWindowBucket, selectRegularWindow } from "../lib/nmgSmartMenuWindow.ts";

/* -- Types -- */
interface PricePoint { regular: number; sale: number | null; }
interface Flower {
  sku: string; name: string; tier: string; type: "indica"|"sativa"|"hybrid";
  isHot: boolean; isSale: boolean; isMustTry?: boolean; thc: string;
  price3g: PricePoint|null; price5g: PricePoint|null;
  price14g: PricePoint|null; price28g: PricePoint|null;
  image: string; promoImage?: string|null;
}
interface SmartTierData { lockedProducts: Flower[]; regularProducts: Flower[]; regularCapacity: number; }
interface SmartLineupResponse {
  kind: "nmg-smart-lineup";
  lineup: { version: string; sourceTimestamp: string; tiers: Record<string,SmartTierData> };
}
interface Item {
  sku: string; name: string; category: string; type: string;
  thc: string; mg: string; price: string; image: string;
}

/* -- Constants -- */
const TIER_ACCENT: Record<string,string> = {
  EXOTIC:"#dc2626", PREMIUM:"#f97316", "AAA+":"#2563eb",
  AA:"#ea580c", BUDGET:"#16a34a", OZ:"#db2777"
};
const TIER_CROWN: Record<string,string> = {
  EXOTIC:"👑", PREMIUM:"👑", "AAA+":"👑", AA:"🏅", BUDGET:"💰", OZ:"🎯"
};
const TIER_UNIT: Record<string,string> = {
  EXOTIC:"$20/G", PREMIUM:"$15/G", "AAA+":"$10/G", AA:"$4/g", BUDGET:"$3/g"
};
const TIER_DEAL: Record<string,string> = {
  EXOTIC:"Buy 3g Get 3 FREE", PREMIUM:"Buy 3g Get 3 FREE",
  "AAA+":"Buy 3g Get 3 FREE", BUDGET:"$10 / 3g Special"
};
const SMART_TIERS = ["EXOTIC","PREMIUM","AAA+","AA","BUDGET"] as const;

/* -- Helpers -- */
function fmtTHC(v: string): string {
  const s = String(v||"").trim(); if (!s) return "";
  const n = parseFloat(s);
  if (!isNaN(n)) return (n <= 1 ? Math.round(n*100) : Math.round(n)) + "%";
  return s;
}

/* -- Price cell with strikethrough for sale -- */
function PriceCell({ pp, color }: { pp: PricePoint|null; color?: string }) {
  if (!pp) return <span>-</span>;
  if (pp.sale !== null && pp.sale !== pp.regular) {
    return (
      <span>
        <del className={styles.oldPrice}>${pp.regular}</del>
        <b className={`${styles.salePrice} ${color || ''}`}>${pp.sale}</b>
      </span>
    );
  }
  return <b className={color || ''}>${pp.regular}</b>;
}

/* -- Type badge component -- */
function TypeTag({ type }: { type: string }) {
  const t = type?.toLowerCase();
  const label = t === "sativa" ? "SAT" : t === "indica" ? "IND" : t === "hybrid" ? "HYB" : "";
  if (!label) return null;
  const cls = t === "sativa" ? styles.tagSat : t === "indica" ? styles.tagInd : styles.tagHyb;
  return <span className={`${styles.tag} ${cls}`}>{label}</span>;
}

/* -- Vibe card -- */
function VibeCard({ type }: { type: string }) {
  const vibes = getFlowerEffects(type);
  return (
    <div className={styles.vibeSection}>
      <div className={styles.vibeHead}>EFFECTS</div>
      <div className={styles.vibePills}>
        {vibes.map(([emoji, label]) => (
          <span key={label} className={styles.vibePill}>
            <span className={styles.vibeEmoji}>{emoji}</span>
            <span className={styles.vibeLabel}>{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* -- Helpers -- */
function hasSalePrice(f: Flower): boolean {
  return !!(f.price3g?.sale || f.price5g?.sale || f.price14g?.sale || f.price28g?.sale);
}
function hasNameSale(name: string): boolean {
  return /\bSALE\b/i.test(name) || /ON\s*SALE/i.test(name);
}
function cleanName(name: string): string {
  return name
    .replace(/\s*\(?\s*AAA\+?\s*ON\s*SALE\s*\)?\s*$/i, '')
    .replace(/\s*\(?\s*AAA\+?\s*SALE!?\s*\)?\s*$/i, '')
    .replace(/\s*\bSALE!?\s*$/i, '')
    .replace(/\s*\bON\s*SALE\s*$/i, '')
    .trim();
}

/* The server locks SALE > TOP PICK > MUST TRY and supplies a deterministic regular cycle. */
const MAX_VIS = 10;

function buildSlotWindow(flowers: Flower[], hiIdx: number): { vis: Flower[]; hiW: number; hi: Flower | undefined } {
  if (!flowers.length) return { vis: [], hiW: 0, hi: undefined };
  const vis = flowers.slice(0, MAX_VIS);
  const hiW = vis.length ? hiIdx % vis.length : 0;
  const hi = vis[hiW] || flowers[0];

  return { vis, hiW, hi };
}

/* ============================================================
   FLOWER CARD
   ============================================================ */
function FlowerCard({
  tier, flowers, hiIdx, cardCls, tierCls, badgeCls
}: {
  tier: string; flowers: Flower[]; hiIdx: number;
  cardCls: string; tierCls: string; badgeCls: string;
}) {
  const accent = TIER_ACCENT[tier] || "#2563eb";

  const { vis, hiW, hi } = buildSlotWindow(flowers, hiIdx);

  const prevRef = useRef<string>("");
  const [fadeImg, setFadeImg] = useState("");
  const [prevImg, setPrevImg] = useState("");

  useEffect(() => {
    if (hi?.image && hi.image !== prevRef.current) {
      setPrevImg(prevRef.current);
      setFadeImg(hi.image);
      prevRef.current = hi.image;
    }
  }, [hi?.image]);

  const isTop3 = ["EXOTIC","PREMIUM","AAA+"].includes(tier);
  const isAA = tier === "AA";
  const isBudget = tier === "BUDGET";

  return (
    <div data-smart-tier={tier} className={`${styles.card} ${cardCls} ${tierCls}`}>
      {/* HEADER */}
      <div className={`${styles.cardHeader} ${isTop3 ? styles.headerSheen : ""}`}
        style={{ background:`linear-gradient(180deg, ${accent} 0%, color-mix(in srgb, ${accent} 82%, #000 18%) 100%)` }}>
        <span className={styles.tierCrown}>{TIER_CROWN[tier]||"🌿"}</span>
        <span className={styles.headerTitle}>
          {isTop3 ? (
            <div className={styles.dealScroller}>
              <span className={styles.dealScrollInner}>
                <span>Buy 2g Get 1g FREE</span>
                <span>Buy 3g Get 3g FREE</span>
              </span>
            </div>
          ) : isAA ? <span className={styles.headerDeal}>$20 5g AA</span>
            : isBudget ? <span className={styles.headerDeal}>$10 / 3g Special</span>
            : TIER_DEAL[tier] ? <span className={styles.headerDeal}>{TIER_DEAL[tier]}</span> : null}
        </span>
        <div className={`${styles.tierBadge} ${badgeCls}`}>
          <span>{tier} {TIER_UNIT[tier]}</span>
        </div>
      </div>

      {/* BODY */}
      <div className={styles.cardBody}>
        {/* LEFT: Image + Detail */}
        <div className={styles.mediaSide}>
          <div className={styles.mediaFrame}>
            <div className={styles.mediaViewport}>
              {hi?.isSale && <div className={styles.saleBadge}>SALE</div>}
              {hi?.isHot && <div className={styles.topPickBadge}>TOP PICK</div>}
              {hi?.thc && <div className={styles.imgThcBadge}>{fmtTHC(hi.thc)}</div>}
              {prevImg && (
                <img src={prevImg} alt="" className={`${styles.budImg} ${styles.budImgFadeOut}`}
                  referrerPolicy="no-referrer" 
            onError={(e) => {
              const t = e.currentTarget;
              if (t.src.indexOf('r2.dev') !== -1 || t.src.indexOf('images.torontodispensaryhub.com') !== -1) {
                const filename = t.src.split('/').pop();
                t.src = 'https://athena-cannabis-images.vercel.app/products/' + filename;
              }
            }}
          />
              )}
              {fadeImg && (
                <img key={fadeImg} src={fadeImg} alt={hi?.name||""}
                  className={`${styles.budImg} ${styles.budImgFadeIn}`}
                  referrerPolicy="no-referrer" 
            onError={(e) => {
              const t = e.currentTarget;
              if (t.src.indexOf('r2.dev') !== -1 || t.src.indexOf('images.torontodispensaryhub.com') !== -1) {
                const filename = t.src.split('/').pop();
                t.src = 'https://athena-cannabis-images.vercel.app/products/' + filename;
              }
            }}
          />
              )}
              {hi?.type && (
                <div className={styles.imgTypeBadge}>
                  <span className={`${styles.imgType} ${
                    hi.type === "sativa" ? styles.imgTypeSat :
                    hi.type === "indica" ? styles.imgTypeInd : styles.imgTypeHyb
                  }`}>{hi.type.toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Detail card */}
          <div className={styles.detailCard}>
            <div className={styles.detailAccent} style={{ background: accent }} />
            <div className={styles.detailName}>{hi?.name || ""}</div>
            <div className={styles.detailMeta}>
              {hi?.thc && <span className={styles.detailThc}>{fmtTHC(hi.thc)}</span>}
              {hi?.price3g && <><span className={styles.detailSep}>·</span><span>3g <b>${hi.price3g.sale ?? hi.price3g.regular}</b></span></>}
              {hi?.price5g && <><span className={styles.detailSep}>·</span><span>5g <b>${hi.price5g.sale ?? hi.price5g.regular}</b></span></>}
              {hi?.price14g && <><span className={styles.detailSep}>·</span><span>14g <b>${hi.price14g.sale ?? hi.price14g.regular}</b></span></>}
            </div>
          </div>

          {hi?.type && <VibeCard type={hi.type} />}
        </div>

        {/* RIGHT: List */}
        <div className={styles.listSide}>
          {/* Deal strip - top 3 only */}
          {isTop3 && (
            <div className={styles.dealStrip}>
              <div className={`${styles.dealBox} ${styles.dealBoxA}`}>
                <span className={styles.dealRotClip}>
                  <span className={`${styles.dealRotTrack} ${styles.dealTrackA}`}>
                    <span className={`${styles.dealRotLine} ${styles.dealTotal} ${styles.dealTotalGold}`}>3G TOTAL</span>
                    <span className={`${styles.dealRotLine} ${styles.dealBase}`}>Buy 2g</span>
                    <span className={`${styles.dealRotLine} ${styles.dealFree} ${styles.dealFreeGreen}`}>Get 1g FREE</span>
                    <span className={`${styles.dealRotLine} ${styles.dealTotal} ${styles.dealTotalGold}`}>3G TOTAL</span>
                  </span>
                </span>
              </div>
              <div className={`${styles.dealBox} ${styles.dealBoxB} ${styles.dealBoxBig}`}>
                <span className={styles.dealRotClip}>
                  <span className={`${styles.dealRotTrack} ${styles.dealTrackB}`}>
                    <span className={`${styles.dealRotLine} ${styles.dealTotal} ${styles.dealTotalRed}`}>6G TOTAL</span>
                    <span className={`${styles.dealRotLine} ${styles.dealBase}`}>Buy 3g</span>
                    <span className={`${styles.dealRotLine} ${styles.dealFree} ${styles.dealFreeGreen}`}>Get 3g FREE</span>
                    <span className={`${styles.dealRotLine} ${styles.dealTotal} ${styles.dealTotalRed}`}>6G TOTAL</span>
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Column headers */}
          {isTop3 ? (
            <div className={`${styles.listHead} ${styles.tTop3}`}>
              <div className={styles.mh}>Strain</div>
              <div className={styles.mh}>THC</div>
              <div className={styles.mh}>Price</div>
            </div>
          ) : isAA ? (
            <div className={`${styles.listHead} ${styles.tAA}`}>
              <div className={styles.mh}>Strain</div>
              <div className={styles.mh}>THC</div>
              <div className={styles.mh}>Price</div>
            </div>
          ) : (
            <div className={`${styles.listHead} ${styles.tBudget}`}>
              <div className={styles.mh}>Strain</div>
              <div className={styles.mh}>THC</div>
              <div className={styles.mh}>Price</div>
            </div>
          )}

          {vis.map((f, i) => {
            const isHi = i === hiW;
            const hiStyle = isHi ? {
              borderColor: `color-mix(in srgb, ${accent} 70%, rgba(2,6,23,.18) 30%)`,
              boxShadow: `0 0 0 3px color-mix(in srgb, ${accent} 50%, transparent 50%), 0 8px 20px rgba(2,6,23,.18), 0 0 28px color-mix(in srgb, ${accent} 70%, transparent 30%)`
            } : undefined;

            if (isTop3) {
              const p3 = f.price3g; const p5 = f.price5g;
              return (
                <div key={f.sku+i} data-flower-sku={f.sku} className={`${styles.row} ${styles.tTop3} ${isHi?styles.rowHi:""}${f.isSale?" "+styles.rowSale:""}`} style={hiStyle}>
                  <div className={`${styles.mc} ${styles.mcStrain}`}>
                    {f.name}
                    {f.isSale && <span className={`${styles.tag} ${styles.tagSale}`}>SALE</span>}
                    {f.isHot && <span className={`${styles.tag} ${styles.tagHot}`}>TOP PICK</span>}
                    {f.isMustTry && <span className={`${styles.tag} ${styles.tagMust}`}>MUST TRY</span>}
                    <TypeTag type={f.type} />
                  </div>
                  <div className={`${styles.mc} ${styles.mcThc}`}>{fmtTHC(f.thc)}</div>
                  <div className={`${styles.mc} ${styles.mcPrice} ${styles.mcPriceDeal}`}>
                    {p3 && (
                      <div className={styles.pLine}>
                        <span className={styles.pLab}>{TV_BUNDLE_LABELS.first}</span>
                        <PriceCell pp={p3} color={styles.priceGreen} />
                      </div>
                    )}
                    {p5 && (
                      <div className={styles.pLine}>
                        <span className={styles.pLab}>{TV_BUNDLE_LABELS.second}</span>
                        <PriceCell pp={p5} color={styles.priceBlue} />
                      </div>
                    )}
                    {!p3 && !p5 && f.price14g && (
                      <div className={styles.pLine}>
                        <span className={styles.pLab}>14G</span>
                        <PriceCell pp={f.price14g} color={styles.priceBlue} />
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            if (isAA) {
              return (
                <div key={f.sku+i} data-flower-sku={f.sku} className={`${styles.row} ${styles.tAA} ${isHi?styles.rowHi:""}${f.isSale?" "+styles.rowSale:""}`} style={hiStyle}>
                  <div className={`${styles.mc} ${styles.mcStrain}`}>
                    {f.name}
                    {f.isSale && <span className={`${styles.tag} ${styles.tagSale}`}>SALE</span>}
                    {f.isHot && <span className={`${styles.tag} ${styles.tagHot}`}>TOP PICK</span>}
                    {f.isMustTry && <span className={`${styles.tag} ${styles.tagMust}`}>MUST TRY</span>}
                    <TypeTag type={f.type} />
                  </div>
                  <div className={`${styles.mc} ${styles.mcThc}`}>{fmtTHC(f.thc)}</div>
                  <div className={`${styles.mc} ${styles.mcPrice} ${styles.mcPriceDeal}`}>
                    {f.price5g && (
                      <div className={styles.pLine}>
                        <span className={styles.pLab}>5g</span>
                        <PriceCell pp={f.price5g} color={styles.priceGreen} />
                      </div>
                    )}
                    {f.price14g && (
                      <div className={styles.pLine}>
                        <span className={styles.pLab}>14g</span>
                        <PriceCell pp={f.price14g} color={styles.priceBlue} />
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // BUDGET
            return (
              <div key={f.sku+i} data-flower-sku={f.sku} className={`${styles.row} ${styles.tBudget} ${isHi?styles.rowHi:""}${f.isSale?" "+styles.rowSale:""}`} style={hiStyle}>
                <div className={`${styles.mc} ${styles.mcStrain}`}>
                  {f.name}
                  {f.isSale && <span className={`${styles.tag} ${styles.tagSale}`}>SALE</span>}
                  {f.isHot && <span className={`${styles.tag} ${styles.tagHot}`}>TOP PICK</span>}
                  {f.isMustTry && <span className={`${styles.tag} ${styles.tagMust}`}>MUST TRY</span>}
                  <TypeTag type={f.type} />
                </div>
                <div className={`${styles.mc} ${styles.mcThc}`}>{fmtTHC(f.thc)}</div>
                <div className={`${styles.mc} ${styles.mcPrice} ${styles.mcPriceDeal}`}>
                  {f.price3g && (
                    <div className={styles.pLine}>
                      <span className={styles.pLab}>3g</span>
                      <PriceCell pp={f.price3g} color={styles.priceGreen} />
                    </div>
                  )}
                  {f.price28g && (
                    <div className={styles.pLine}>
                      <span className={styles.pLab}>oz</span>
                      <PriceCell pp={f.price28g} color={styles.pricePink} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   OZ CARD
   ============================================================ */
function OZCard({ flowers, hiIdx }: { flowers: Flower[]; hiIdx: number }) {
  const accent = "#db2777";
  const sativa = flowers.filter(f => f.type === "sativa");
  const indica = flowers.filter(f => f.type !== "sativa");
  const hi = flowers[hiIdx] || flowers[0];

  const prevRef = useRef<string>("");
  const [fadeImg, setFadeImg] = useState("");
  const [prevImg, setPrevImg] = useState("");
  useEffect(() => {
    if (hi?.image && hi.image !== prevRef.current) {
      setPrevImg(prevRef.current);
      setFadeImg(hi.image);
      prevRef.current = hi.image;
    }
  }, [hi?.image]);

  return (
    <div className={`${styles.card} ${styles.cardOz} ${styles.tierOz}`}>
      <div className={`${styles.cardHeader}`}
        style={{ background:`linear-gradient(180deg, ${accent} 0%, color-mix(in srgb, ${accent} 82%, #000 18%) 100%)` }}>
        <span className={styles.tierCrown}>🎯</span>
        <span className={styles.headerTitle}><span className={styles.headerDeal}>$40 up OZ</span></span>
        <div className={`${styles.tierBadge} ${styles.tierBadgeOz}`}><span>OZ</span></div>
      </div>

      <div className={styles.ozBody}>
        <div className={styles.ozTop}>
          <div className={styles.ozImgWrap}>
            <div className={styles.mediaViewport}>
              {hi?.isHot && <div className={styles.topPickBadge}>TOP PICK</div>}
              {prevImg && <img src={prevImg} alt="" className={`${styles.budImg} ${styles.budImgFadeOut}`} referrerPolicy="no-referrer" 
            onError={(e) => {
              const t = e.currentTarget;
              if (t.src.indexOf('r2.dev') !== -1 || t.src.indexOf('images.torontodispensaryhub.com') !== -1) {
                const filename = t.src.split('/').pop();
                t.src = 'https://athena-cannabis-images.vercel.app/products/' + filename;
              }
            }}
          />}
              {fadeImg && <img key={fadeImg} src={fadeImg} alt={hi?.name||""} className={`${styles.budImg} ${styles.budImgFadeIn}`} referrerPolicy="no-referrer" 
            onError={(e) => {
              const t = e.currentTarget;
              if (t.src.indexOf('r2.dev') !== -1 || t.src.indexOf('images.torontodispensaryhub.com') !== -1) {
                const filename = t.src.split('/').pop();
                t.src = 'https://athena-cannabis-images.vercel.app/products/' + filename;
              }
            }}
          />}
              {hi?.type && (
                <div className={styles.imgTypeBadge}>
                  <span className={`${styles.imgType} ${hi.type==="sativa"?styles.imgTypeSat:styles.imgTypeInd}`}>{hi.type.toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>
          <div className={styles.ozDetail}>
            <div className={styles.ozDetailName}>{hi?.name||""}</div>
            <div className={styles.ozDetailMeta}>
              {hi?.thc && <span className={styles.ozDetailThc}>{fmtTHC(hi.thc)}</span>}
              {hi?.price28g && <><span className={styles.ozDetailSep}>·</span><span className={styles.ozDetailPrice}>oz <b>${hi.price28g.sale ?? hi.price28g.regular}</b></span></>}
            </div>
            {hi?.type && <VibeCard type={hi.type} />}
          </div>
        </div>

        <div className={styles.ozCols}>
          <div className={styles.ozCol}>
            <div className={styles.ozColHead}>SATIVA</div>
            <div className={styles.ozColHeadSub}>
              <span>Strain</span><span>OZ</span>
            </div>
            {sativa.length === 0 && <div className={styles.ozEmpty}>-</div>}
            {sativa.map((f,i) => (
              <div key={f.sku+i} className={`${styles.ozRow} ${f===hi?styles.ozRowHi:""}`}>
                <span className={styles.ozName}>
                  {f.name}
                  {f.isSale && <span className={`${styles.tag} ${styles.tagSale}`}>SALE</span>}
                  {f.isHot && <span className={`${styles.tag} ${styles.tagHot}`}>TOP PICK</span>}
                  {f.isMustTry && <span className={`${styles.tag} ${styles.tagMust}`}>MUST TRY</span>}
                  <TypeTag type={f.type} />
                  <span style={{fontSize:14,opacity:0.6,marginLeft:4}}>{fmtTHC(f.thc)}</span>
                </span>
                <span className={styles.ozPrice}>${f.price28g?.sale ?? f.price28g?.regular ?? "-"}</span>
              </div>
            ))}
          </div>
          <div className={styles.ozCol}>
            <div className={styles.ozColHead}>INDICA</div>
            <div className={styles.ozColHeadSub}>
              <span>Strain</span><span>OZ</span>
            </div>
            {indica.map((f,i) => (
              <div key={f.sku+i} className={`${styles.ozRow} ${f===hi?styles.ozRowHi:""}`}>
                <span className={styles.ozName}>
                  {f.name}
                  {f.isSale && <span className={`${styles.tag} ${styles.tagSale}`}>SALE</span>}
                  {f.isHot && <span className={`${styles.tag} ${styles.tagHot}`}>TOP PICK</span>}
                  {f.isMustTry && <span className={`${styles.tag} ${styles.tagMust}`}>MUST TRY</span>}
                  <TypeTag type={f.type} />
                  <span style={{fontSize:14,opacity:0.6,marginLeft:4}}>{fmtTHC(f.thc)}</span>
                </span>
                <span className={styles.ozPrice}>${f.price28g?.sale ?? f.price28g?.regular ?? "-"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ADDONS CARD
   ============================================================ */
function AddOnsCard({ items, hiIdx }: { items: Item[]; hiIdx: number }) {
  const hi = items[hiIdx] || items[0];

  const prevRef = useRef<string>("");
  const [fadeImg, setFadeImg] = useState("");
  const [prevImg, setPrevImg] = useState("");
  useEffect(() => {
    if (hi?.image && hi.image !== prevRef.current) {
      setPrevImg(prevRef.current);
      setFadeImg(hi.image);
      prevRef.current = hi.image;
    }
  }, [hi?.image]);

  return (
    <div className={`${styles.card} ${styles.cardAddons}`}>
      <div className={styles.cardHeader}
        style={{ background:"linear-gradient(180deg, #16a34a 0%, #0d7a38 100%)", fontSize:28, justifyContent:"center" }}>
        ADD ONS
      </div>
      <div className={styles.addonsBody}>
        <div className={styles.addonsHero}>
          <div className={styles.addonsHeroImg}>
            <div className={styles.mediaViewport}>
              {prevImg && <img src={prevImg} alt="" className={`${styles.budImg} ${styles.budImgFadeOut}`} referrerPolicy="no-referrer" 
            onError={(e) => {
              const t = e.currentTarget;
              if (t.src.indexOf('r2.dev') !== -1 || t.src.indexOf('images.torontodispensaryhub.com') !== -1) {
                const filename = t.src.split('/').pop();
                t.src = 'https://athena-cannabis-images.vercel.app/products/' + filename;
              }
            }}
          />}
              {fadeImg && <img key={fadeImg} src={fadeImg} alt={hi?.name||""} className={`${styles.budImg} ${styles.budImgFadeIn}`} referrerPolicy="no-referrer" 
            onError={(e) => {
              const t = e.currentTarget;
              if (t.src.indexOf('r2.dev') !== -1 || t.src.indexOf('images.torontodispensaryhub.com') !== -1) {
                const filename = t.src.split('/').pop();
                t.src = 'https://athena-cannabis-images.vercel.app/products/' + filename;
              }
            }}
          />}
            </div>
          </div>
          <div className={styles.addonsDetailCard}>
            <div className={styles.addonsDetailName}>{hi?.name||""}</div>
            <div className={styles.addonsDetailPrice}>PRICE {(hi?.price||'').replace(/\[object.*\]/,'')}</div>
            <div className={styles.effectIcons}>CURRENT MENU ITEM</div>
          </div>
        </div>

        <div className={styles.addonsListHead}>
          <span>ITEM</span><span>PRICE</span>
        </div>
        <div className={styles.addonsList}>
          {items.map((it,i) => (
            <div key={it.sku+i} className={`${styles.addonRow} ${i===hiIdx?styles.addonRowHi:""}`}
              style={i===hiIdx ? {borderColor:"rgba(34,197,94,.55)", boxShadow:"0 0 0 2px rgba(34,197,94,.35), 0 6px 16px rgba(2,6,23,.15)"} : undefined}>
              {it.image && <img src={it.image} alt={it.name} className={styles.addonImg} referrerPolicy="no-referrer" 
            onError={(e) => {
              const t = e.currentTarget;
              if (t.src.indexOf('r2.dev') !== -1 || t.src.indexOf('images.torontodispensaryhub.com') !== -1) {
                const filename = t.src.split('/').pop();
                t.src = 'https://athena-cannabis-images.vercel.app/products/' + filename;
              }
            }}
          />}
              <div className={styles.addonInfo}>
                <div className={styles.addonName}>{it.name}</div>
                <div className={styles.addonPrice}>{(it.price||'').replace(/\[object.*\]/,'')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   VERTICAL TICKER
   ============================================================ */
function VerticalTicker() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [exitIdx, setExitIdx] = useState(-1);

  useEffect(() => {
    const iv = setInterval(() => {
      setExitIdx(activeIdx);
      setActiveIdx(prev => (prev + 1) % TV_TICKER_SLIDES.length);
    }, TV_TICKER_INTERVAL_MS);
    return () => clearInterval(iv);
  }, [activeIdx]);

  return (
    <div className={styles.ticker}>
      <div className={styles.tickerInner}>
        {TV_TICKER_SLIDES.map((text, i) => (
          <div key={i} className={`${styles.tickerSlide} ${i === activeIdx ? styles.tickerActive : ""} ${i === exitIdx ? styles.tickerExit : ""}`}>
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   MAIN TV PAGE
   ============================================================ */
export default function TVMenuPage() {
  const [bgUrl, setBgUrl] = useState("");
  useEffect(() => {
    fetch("https://athena-cannabis-images.vercel.app/backgrounds/list.json")
      .then(r => r.json())
      .then(data => {
        if (data && data.length) {
          const hourIndex = Math.floor(Date.now() / (3600 * 1000)) % data.length;
          setBgUrl(`https://athena-cannabis-images.vercel.app/backgrounds/${data[hourIndex]}`);
        }
      })
      .catch(err => console.warn("[BG] Load failed:", err));
  }, []);
  const [tierLineups, setTierLineups] = useState<Record<string,SmartTierData>>({});
  const [regularBucket, setRegularBucket] = useState(() => regularWindowBucket(Date.now()));
  const [addOns, setAddOns] = useState<Item[]>([]);
  const [highlights, setHighlights] = useState<Record<string,number>>({});
  const [lastUpdate, setLastUpdate] = useState("");
  const [particles, setParticles] = useState<Array<{size:number;left:string;color:string;shadow:string;dur:string;delay:string}>>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  const flowers = useMemo(() => Object.fromEntries(SMART_TIERS.map((tier) => {
    const lineup = tierLineups[tier];
    if (!lineup) return [tier, []];
    const regular = selectRegularWindow(lineup.regularProducts, lineup.regularCapacity, regularBucket).products;
    return [tier, [...lineup.lockedProducts, ...regular]];
  })) as Record<string,Flower[]>, [tierLineups, regularBucket]);
  const ozFlowers = useMemo(() => SMART_TIERS.flatMap((tier) => flowers[tier]).filter((flower, index, values) =>
    Boolean(flower.price28g) && values.findIndex((candidate) => candidate.sku === flower.sku) === index,
  ), [flowers]);

  const loadData = useCallback(async () => {
    try {
      const [fRes, iRes] = await Promise.all([
        fetch("/api/tv-data?type=flowers"),
        fetch("/api/tv-data?type=items"),
      ]);
      if (!fRes.ok) throw new Error(`Smart flower lineup HTTP ${fRes.status}`);
      const smartData = await fRes.json() as SmartLineupResponse;
      if (smartData.kind !== "nmg-smart-lineup" || !smartData.lineup?.tiers) throw new Error("Smart flower lineup is invalid");
      const iData: Item[] = iRes.ok ? await iRes.json() : [];
      const lineups: Record<string,SmartTierData> = {};
      for (const tier of SMART_TIERS) {
        const source = smartData.lineup.tiers[tier];
        if (!source || !Array.isArray(source.lockedProducts) || !Array.isArray(source.regularProducts)) throw new Error(`Smart ${tier} lineup is invalid`);
        const cleanProducts = (products: Flower[]) => products.map((flower) => ({
            ...flower,
            isSale: flower.isSale || hasSalePrice(flower) || hasNameSale(flower.name),
            name: cleanName(flower.name),
          }));
        lineups[tier] = {
          lockedProducts: cleanProducts(source.lockedProducts),
          regularProducts: cleanProducts(source.regularProducts),
          regularCapacity: source.regularCapacity,
        };
      }
      setTierLineups(lineups);
      setRegularBucket(regularWindowBucket(Date.now()));

      setAddOns(iData.filter(it => it.category === "ADD ONS" || it.category === "PREROLLS").slice(0, 14));

      const hi: Record<string,number> = {};
      for (const t of SMART_TIERS) hi[t] = 0;
      hi["OZ"] = 0; hi["ADDONS"] = 0;
      setHighlights(hi);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) { console.warn("[TV] Load failed:", err); }
  }, []);

  const fitToScreen = useCallback(() => {
    if (!wrapRef.current) return;
    const W = window.innerWidth, H = window.innerHeight;
    const s = Math.min(W / 3840, H / 2160);
    const tx = Math.round((W - 3840*s)/2);
    const ty = Math.round((H - 2160*s)/2);
    wrapRef.current.style.transform = `translate(${tx}px,${ty}px) scale(${s})`;
  }, []);

  useEffect(() => {
    const colors = ['rgba(220,38,38,.12)','rgba(245,158,11,.10)','rgba(59,130,246,.10)','rgba(16,185,129,.08)','rgba(168,85,247,.08)'];
    setParticles(Array.from({length: 25}, (_, i) => {
      const size = 4 + Math.random() * 8;
      const color = colors[i % colors.length];
      return {
        size,
        left: `${5 + Math.random() * 90}%`,
        color,
        shadow: `0 0 ${size*3}px ${color}`,
        dur: `${18 + Math.random() * 22}s`,
        delay: `${-Math.random() * 25}s`,
      };
    }));
    loadData(); fitToScreen();
    window.addEventListener("resize", fitToScreen);
    const refresh = setInterval(loadData, 5*60*1000);
    return () => { window.removeEventListener("resize", fitToScreen); clearInterval(refresh); };
  }, [loadData, fitToScreen]);

  useEffect(() => {
    if (!Object.keys(tierLineups).length) return;
    const interval = setInterval(() => {
      setHighlights(prev => {
        const next = {...prev};
        for (const t of SMART_TIERS) {
            const total = flowers[t]?.length || 1;
            next[t] = ((prev[t]||0)+1) % total;
          }
        next["OZ"] = ((prev["OZ"]||0)+1) % Math.max(1, ozFlowers.length);
        next["ADDONS"] = ((prev["ADDONS"]||0)+1) % Math.max(1, addOns.length);
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [tierLineups, flowers, ozFlowers.length, addOns.length]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const scheduleBoundary = () => {
      const now = Date.now();
      const nextBoundary = (regularWindowBucket(now) + 1) * NMG_REGULAR_WINDOW_MS;
      timer = setTimeout(() => {
        setRegularBucket(regularWindowBucket(Date.now()));
        setHighlights((previous) => ({ ...previous, ...Object.fromEntries(SMART_TIERS.map((tier) => [tier, 0])) }));
        scheduleBoundary();
      }, Math.max(50, nextBoundary - now + 50));
    };
    scheduleBoundary();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (window.location.hostname !== "127.0.0.1" && window.location.hostname !== "localhost") return;
    const simulateBoundary = (event: Event) => {
      const nowMs = Number((event as CustomEvent<number>).detail);
      if (Number.isFinite(nowMs)) setRegularBucket(regularWindowBucket(nowMs));
    };
    window.addEventListener("nmg-smart-menu-qa-time", simulateBoundary);
    return () => window.removeEventListener("nmg-smart-menu-qa-time", simulateBoundary);
  }, []);

  const CM: Record<string,{c:string;t:string;b:string}> = {
    EXOTIC:{c:styles.cardExotic,t:styles.tierExotic,b:styles.tierBadgeExotic},
    PREMIUM:{c:styles.cardPremium,t:styles.tierPremium,b:styles.tierBadgePremium},
    "AAA+":{c:styles.cardAaa,t:styles.tierAaa,b:styles.tierBadgeAaa},
    AA:{c:styles.cardAa,t:styles.tierAa,b:styles.tierBadgeAa},
    BUDGET:{c:styles.cardBudget,t:styles.tierBudget,b:styles.tierBadgeBudget},
  };

  return (
    <div className={styles.tvPage} style={bgUrl ? { backgroundImage: `url(${bgUrl})`, backgroundSize: "cover" } : undefined}>
      {/* Floating particles */}
      <div className={styles.particles}>
        {particles.map((p, i) => (
          <span key={i} className={styles.dot} style={{
            width: p.size, height: p.size,
            left: p.left,
            background: p.color,
            boxShadow: p.shadow,
            animationDuration: p.dur,
            animationDelay: p.delay,
          }} />
        ))}
      </div>
      <div className={styles.wrap} ref={wrapRef}>

        {/* GRID */}
        <div className={styles.stage}>
          <div className={styles.grid}>
            {/* Row 1: EXOTIC, PREMIUM, AAA+ */}
            {SMART_TIERS.slice(0,3).map(tier => (
              <FlowerCard key={tier} tier={tier} flowers={flowers[tier]||[]} hiIdx={highlights[tier]||0}
                cardCls={CM[tier].c} tierCls={CM[tier].t} badgeCls={CM[tier].b} />
            ))}
            {/* ADDONS right rail */}
            <AddOnsCard items={addOns} hiIdx={highlights["ADDONS"]||0} />
            {/* Row 2: AA, BUDGET, OZ */}
            {SMART_TIERS.slice(3).map(tier => (
              <FlowerCard key={tier} tier={tier} flowers={flowers[tier]||[]} hiIdx={highlights[tier]||0}
                cardCls={CM[tier].c} tierCls={CM[tier].t} badgeCls={CM[tier].b} />
            ))}
            <OZCard flowers={ozFlowers} hiIdx={highlights["OZ"]||0} />
          </div>
        </div>

        {/* TICKER */}
        <VerticalTicker />
      </div>
      <div className={styles.lastUpdated}>Updated: {lastUpdate}</div>
    </div>
  );
}
