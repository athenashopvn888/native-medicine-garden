import Link from "next/link";
import styles from "./SmokePilot.module.css";

interface SmokePilotSpotlightProps {
  storeName: string;
  locationLabel: string;
  cigaretteHref: string;
  nicotineHref: string;
}

export default function SmokePilotSpotlight({
  storeName,
  locationLabel,
  cigaretteHref,
  nicotineHref,
}: SmokePilotSpotlightProps) {
  return (
    <section className={styles.spotlight} aria-labelledby="smoke-spotlight-title">
      <div className={styles.spotlightInner}>
        <div className={styles.spotlightCopy}>
          <span className={styles.kicker}>Smoke Shop Spotlight</span>
          <h2 id="smoke-spotlight-title">Cigarettes &amp; Nicotine Vapes</h2>
          <p>
            Find Native cigarette brands, nicotine vape devices, flavours and listed
            prices at {storeName} in {locationLabel}.
          </p>
        </div>
        <div className={styles.spotlightCards}>
          <Link href={cigaretteHref} className={`${styles.spotlightCard} ${styles.cigaretteCard}`}>
            <span className={styles.cardCode}>CG</span>
            <span>
              <strong>Native Cigarettes</strong>
              <small>Brands, pack styles and menu prices</small>
            </span>
            <b aria-hidden="true">→</b>
          </Link>
          <Link href={nicotineHref} className={`${styles.spotlightCard} ${styles.nicotineCard}`}>
            <span className={styles.cardCode}>NV</span>
            <span>
              <strong>Nicotine Vapes</strong>
              <small>Devices, flavours and menu prices</small>
            </span>
            <b aria-hidden="true">→</b>
          </Link>
        </div>
      </div>
    </section>
  );
}

