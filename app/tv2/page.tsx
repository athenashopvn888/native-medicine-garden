"use client";
import {
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import styles from "./tv2.module.css";
import {
  TV2_HIRING_REDUCED_MOTION_MESSAGE,
  TV2_HIRING_SLIDES,
  getNextTv2HiringSlide,
} from "./tv2Hiring";
import {
  type Tv2DaytimePromo,
  getNextTv2PromoIndex,
  getTv2DaytimePromo,
  getTv2PromoRotationUrls,
  isTv2Daytime,
} from "./tv2Promos";
import {
  TV2_HIRING_INTERVAL_MS,
  TV2_PROMO_INTERVAL_MS,
  TV2_TICKER_INTERVAL_MS,
} from "./tv2Timing";

/* -- TYPES -- */
interface Item {
  sku: string; name: string; category: string;
  type?: string; thc?: string; mg?: string; price?: string; image?: string; isSale?: boolean;
}

/* -- CATEGORY CONFIG -- */
const CARD_CONFIG = [
  { id:"PREROLLS_ADDONS", title:"🔥 PREROLLS & ADD ONS", accent:"#dc2626", filter:(it:Item)=>it.category==="PREROLLS"||it.category==="ADD ONS", preset:"🔥 START SLOW · 2–3 PUFFS · WAIT 5 MIN" },
  { id:"VAPES",           title:"💨 VAPES",              accent:"#0284c7", filter:(it:Item)=>["VAPE PENS","VAPE DISPOSABLE"].includes(it.category), preset:"💨 1–2 PUFFS · WAIT 2–3 MIN · REPEAT" },
  { id:"EDIBLES",         title:"🍬 EDIBLES",            accent:"#7c3aed", filter:(it:Item)=>it.category==="EDIBLES", preset:"🍬 START SMALL · WAIT 45 MIN · THEN MORE" },
  { id:"CONCENTRATES",    title:"⚗️ CONCENTRATES",       accent:"#b45309", filter:(it:Item)=>it.category==="CONCENTRATES", preset:"⚠️ VERY STRONG · TINY AMOUNT · WAIT 10–15 MIN" },
  { id:"CIGARETTES",      title:"🚬 CIGARETTES",         accent:"#78350f", filter:(it:Item)=>it.category==="CIGARETTES", preset:"" },
  { id:"MAGIC",           title:"🍄 MAGIC & OTHERS",     accent:"#9333ea", filter:(it:Item)=>it.category==="MAGIC & OTHERS", preset:"🍫 START SMALL · WAIT 45 MIN · THEN MORE" },
];

/* -- HELPERS -- */
const fmtPrice = (v?:string) => { const s=String(v||"").trim(); if(!s)return""; return /^\$/.test(s)?s:"$"+s; };
const fmtTHC = (v?:string) => { const s=String(v||"").trim(); if(!s)return""; if(/^\d+(\.\d+)?%?$/.test(s)){const n=parseFloat(s);return(n<=1?Math.round(n*100):Math.round(n))+"%";}return s; };
const fmtMG = (v?:string) => { const s=String(v||"").trim(); if(!s)return""; if(/^\d+(\.\d+)?$/.test(s))return s+"mg"; return s; };

/* -- ITEM CARD -- */
function ItemCard({ title, accent, items, hiIdx, preset }: {
  title:string; accent:string; items:Item[]; hiIdx:number; preset:string;
}) {
  const MAX = 10;
  const hiW = Math.min(hiIdx % Math.max(1, items.length), items.length - 1);
  const hi = items[hiW] || items[0];

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

  const topIdx = items.length > MAX ? Math.floor(hiIdx / MAX) * MAX % items.length : 0;
  const displayItems = items.length > MAX
    ? Array.from({length: MAX}, (_,i) => items[(topIdx+i)%items.length])
    : items.slice(0, MAX);

  const metaParts: string[] = [];
  if (hi?.type) metaParts.push(hi.type);
  if (hi?.thc) metaParts.push(fmtTHC(hi.thc));
  if (hi?.mg) metaParts.push(fmtMG(hi.mg));
  if (hi?.price) metaParts.push(fmtPrice(hi.price));

  return (
    <div className={styles.card} style={{"--accent":accent} as React.CSSProperties}>
      <div className={styles.cardHeader}>{title}</div>
      <div className={styles.cardMain}>
        {/* LEFT */}
        <div className={styles.mediaSide}>
          <div className={styles.mediaFrame}>
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
          <div className={styles.detailCard}>
            <div className={styles.detailAccent} style={{background:accent}} />
            <div className={styles.detailContent}>
              <div className={styles.detailTop}>
                {metaParts.map((p,i) => (
                  <span key={i}>
                    {i > 0 && <span className={styles.detailSep}> · </span>}
                    <span className={p===fmtTHC(hi?.thc)?styles.detailThc:undefined} style={p===fmtPrice(hi?.price)?{fontWeight:900}:undefined}>{p}</span>
                  </span>
                ))}
              </div>
              <div className={styles.detailName}>{hi?.name||""}</div>
              {preset && <div className={styles.detailPreset}>{preset}</div>}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className={styles.listSide}>
          <div className={styles.listHead}>
            <div className={styles.mh}>Item</div>
            <div className={styles.mh}>Price</div>
          </div>
          <div className={styles.listBody}>
            {displayItems.map((it,i) => {
              const isHi = i === (hiW % Math.max(1, displayItems.length));
              const hiStyle = isHi ? {
                borderColor:`color-mix(in srgb, ${accent} 70%, rgba(2,6,23,.18) 30%)`,
                boxShadow:`0 0 0 3px color-mix(in srgb, ${accent} 50%, transparent 50%), 0 8px 20px rgba(2,6,23,.18), 0 0 28px color-mix(in srgb, ${accent} 70%, transparent 30%)`
              } : undefined;
              return (
                <div key={it.sku+i} className={`${styles.row} ${isHi?styles.rowHi:""}`} style={hiStyle}>
                  <div className={styles.mcItem}>
                    {it.name}
                    {it.type && <span className={styles.submeta}> · {it.type}</span>}
                    {it.thc && <span className={styles.submeta}> · {fmtTHC(it.thc)}</span>}
                    {it.mg && <span className={styles.submeta}> · {fmtMG(it.mg)}</span>}
                  </div>
                  <div className={styles.mcPrice}>{fmtPrice(it.price)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -- TICKER -- */
const TICKER_SLIDES = [
  "🔥 Native Medicine Garden — 76 Gerrard St W, Toronto",
  "Menu Categories and Current Items",
  "Open 24 Hours",
  "Pre-Rolls · Edibles · Vapes · Concentrates",
  "ALL SALES ARE FINAL",
];

function VerticalTicker() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [exitIdx, setExitIdx] = useState(-1);
  useEffect(() => {
    const iv = setInterval(() => {
      setExitIdx(activeIdx);
      setActiveIdx(prev => (prev + 1) % TICKER_SLIDES.length);
    }, TV2_TICKER_INTERVAL_MS);
    return () => clearInterval(iv);
  }, [activeIdx]);

  return (
    <div className={styles.ticker}>
      <div className={styles.tickerInner}>
        {TICKER_SLIDES.map((text, i) => (
          <div key={i} className={`${styles.tickerSlide} ${i===activeIdx?styles.tickerActive:""} ${i===exitIdx?styles.tickerExit:""}`}>
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function HiringRibbon() {
  const [activeSlide, setActiveSlide] = useState(0);
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );

  useEffect(() => {
    if (reducedMotion) return;
    const interval = window.setInterval(() => {
      setActiveSlide((current) => getNextTv2HiringSlide(current));
    }, TV2_HIRING_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [reducedMotion]);

  return (
    <div
      className={styles.hiringRibbon}
      data-testid="tv2-hiring-ribbon"
      aria-label="Native Medicine Garden hiring notice"
    >
      {reducedMotion ? (
        <span className={styles.hiringStatic}>
          {TV2_HIRING_REDUCED_MOTION_MESSAGE}
        </span>
      ) : (
        TV2_HIRING_SLIDES.map((message, index) => (
          <span
            key={message}
            className={`${styles.hiringMessage} ${
              index === activeSlide ? styles.hiringMessageActive : ""
            }`}
            aria-hidden={index !== activeSlide}
          >
            {message}
          </span>
        ))
      )}
    </div>
  );
}

function PromoCard({
  cardId,
  accent,
  promo,
}: {
  cardId: string;
  accent: string;
  promo: Tv2DaytimePromo;
}) {
  const imageUrls = useMemo(() => getTv2PromoRotationUrls(promo), [promo]);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (imageUrls.length <= 1) return;
    const interval = window.setInterval(() => {
      setActiveImage((current) =>
        getNextTv2PromoIndex(current, imageUrls.length),
      );
    }, TV2_PROMO_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [imageUrls]);

  const src = imageUrls[activeImage] || promo.fallbackSrc;
  if (!src) return null;

  return (
    <div
      className={styles.card}
      data-promo-card={cardId}
      style={{"--accent":accent} as React.CSSProperties}
    >
      <div className={styles.cardHeader}>PROMO</div>
      <div className={styles.promoMain}>
        <div className={styles.promoViewport}>
          <img
            key={src}
            className={[styles.promoImg, styles.promoActive].join(" ")}
            src={src}
            alt={promo.alt}
            referrerPolicy="no-referrer"
            onError={(event) => {
              if (
                promo.fallbackSrc &&
                event.currentTarget.getAttribute("src") !== promo.fallbackSrc
              ) {
                event.currentTarget.src = promo.fallbackSrc;
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* -- MAIN TV2 PAGE -- */
export default function TV2Page() {
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
  const [items, setItems] = useState<Item[]>([]);
  const [highlights, setHighlights] = useState<Record<string,number>>({});
  const [lastUpdate, setLastUpdate] = useState("");
  const [daytime, setDaytime] = useState(() => isTv2Daytime());
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const iv = setInterval(() => setDaytime(isTv2Daytime()), 60_000);
    return () => clearInterval(iv);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/tv-data?type=items");
      const data: Item[] = res.ok ? await res.json() : [];
      setItems(data);
      const hi: Record<string,number> = {};
      CARD_CONFIG.forEach(c => { hi[c.id] = 0; });
      setHighlights(hi);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) { console.warn("[TV2] Load failed:", err); }
  }, []);

  const fitToScreen = useCallback(() => {
    if (!wrapRef.current) return;
    const viewport = window.visualViewport;
    const W = viewport?.width ?? document.documentElement.clientWidth;
    const H = viewport?.height ?? document.documentElement.clientHeight;
    const offsetLeft = viewport?.offsetLeft ?? 0;
    const offsetTop = viewport?.offsetTop ?? 0;
    const scale = Math.max(0.01, Math.min(W / 3840, H / 2160));
    const tx = Math.round(offsetLeft + (W - 3840 * scale) / 2);
    const ty = Math.round(offsetTop + (H - 2160 * scale) / 2);
    const transform = `translate(${tx}px,${ty}px) scale(${scale})`;
    if (wrapRef.current.style.transform !== transform) {
      wrapRef.current.style.transform = transform;
    }
    wrapRef.current.dataset.fitted = "true";
  }, []);

  useLayoutEffect(() => {
    let primaryFrame = 0;
    let followupFrame = 0;
    const settleTimers: number[] = [];

    const scheduleFit = () => {
      window.cancelAnimationFrame(primaryFrame);
      window.cancelAnimationFrame(followupFrame);
      primaryFrame = window.requestAnimationFrame(() => {
        fitToScreen();
        followupFrame = window.requestAnimationFrame(fitToScreen);
      });
    };

    scheduleFit();
    window.addEventListener("resize", scheduleFit);
    window.visualViewport?.addEventListener("resize", scheduleFit);
    window.visualViewport?.addEventListener("scroll", scheduleFit);
    document.addEventListener("visibilitychange", scheduleFit);

    const resizeObserver = new ResizeObserver(scheduleFit);
    resizeObserver.observe(document.documentElement);

    for (const delay of [100, 500, 1500]) {
      settleTimers.push(window.setTimeout(scheduleFit, delay));
    }

    return () => {
      window.cancelAnimationFrame(primaryFrame);
      window.cancelAnimationFrame(followupFrame);
      settleTimers.forEach((timer) => window.clearTimeout(timer));
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleFit);
      window.visualViewport?.removeEventListener("resize", scheduleFit);
      window.visualViewport?.removeEventListener("scroll", scheduleFit);
      document.removeEventListener("visibilitychange", scheduleFit);
    };
  }, [fitToScreen]);

  useEffect(() => {
    const initialLoad = window.setTimeout(loadData, 0);
    const refresh = setInterval(loadData, 5*60*1000);
    return () => {
      window.clearTimeout(initialLoad);
      clearInterval(refresh);
    };
  }, [loadData]);

  useEffect(() => {
    if (!items.length) return;
    const interval = setInterval(() => {
      setHighlights(prev => {
        const next = {...prev};
        CARD_CONFIG.forEach(c => {
          const filtered = items.filter(c.filter);
          next[c.id] = ((prev[c.id]||0) + 1) % Math.max(1, filtered.length);
        });
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [items]);

  return (
    <div className={styles.tvPage} style={bgUrl ? { backgroundImage: `url(${bgUrl})`, backgroundSize: "cover" } : undefined}>
      <div className={styles.wrap} ref={wrapRef}>
        <HiringRibbon />

        {/* GRID */}
        <div className={styles.stage}>
          <div className={styles.grid}>
            {CARD_CONFIG.map(card => {
              const filtered = items.filter(card.filter);
              const promo = getTv2DaytimePromo(card.id, daytime);

              if (promo) {
                return (
                  <PromoCard
                    key={card.id}
                    cardId={card.id}
                    accent={card.accent}
                    promo={promo}
                  />
                );
              }

              return (
                <ItemCard key={card.id} title={card.title} accent={card.accent}
                  items={filtered} hiIdx={highlights[card.id]||0} preset={card.preset} />
              );
            })}
          </div>
        </div>
        <VerticalTicker />
      </div>
      <div className={styles.lastUpdated}>Updated: {lastUpdate}</div>
    </div>
  );
}
