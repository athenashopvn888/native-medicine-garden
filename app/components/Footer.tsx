import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          {/* Column 1 — Store Description */}
          <div className={styles.col}>
            <div className={styles.brand}>
              NATIVE MEDICINE GARDEN CANNABIS DISPENSARY
            </div>
            <p className={styles.desc}>
              Your Local Cannabis Dispensary At 76 Gerrard St W, Toronto. Visit
              Native Medicine Garden For Premium Flower, Edibles, Vapes &amp;
              More. Open 24 Hours.
            </p>
            <div className={styles.buttons}>
              <a href="tel:+14373394466" className={styles.btnPrimary}>
                Call Now
              </a>
            </div>
          </div>

          {/* Column 2 — Contact Info */}
          <div className={styles.col}>
            <h3 className={styles.colTitle}>Contact Info</h3>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>Address:</span>
              <span>76 Gerrard St W</span>
              <span>Toronto, ON M5G 1J5</span>
              <span>Canada</span>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>Phone:</span>
              <span>
                <a href="tel:+14373394466" style={{ color: "inherit" }}>
                  (437) 339-4466
                </a>
              </span>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>Hours:</span>
              <span className={styles.highlight}>Open 24 Hours</span>
            </div>
          </div>

          {/* Column 3 — Quick Links */}
          <div className={styles.col}>
            <h3 className={styles.colTitle}>Quick Links</h3>
            <nav className={styles.links}>
              <Link href="/">Home</Link>
              <Link href="/exotic">Exotic Flower</Link>
              <Link href="/premium">Premium Flower</Link>
              <Link href="/aaa">AAA+ Flower</Link>
              <Link href="/aa">AA Flower</Link>
              <Link href="/budget">Budget Flower</Link>
              <Link href="/items/edibles">Edibles</Link>
              <Link href="/items/cigarettes">Cigarettes</Link>
              <Link href="/items/vapes">Vape Pens</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/delivery">Delivery (Coming Soon)</Link>
              <Link href="/games">Games Arcade</Link>
              <Link href="/info/gerrard-bay-weed-dispensary">
                Gerrard and Bay Dispensary
              </Link>
              <Link href="/info/cheap-weed-gerrard-bay">
                Cheap Weed Gerrard and Bay
              </Link>
              <Link href="/info/native-cigarettes-gerrard-bay">
                Native Cigarettes
              </Link>
              <Link href="/info/weed-store-near-downtown-toronto">
                Weed Store Near Gerrard and Bay
              </Link>
              <Link href="/weed-dispensary-toronto/">
                Native Medicine Garden Weed Dispensary in Toronto
              </Link>
              <Link href="/contact">Contact Us</Link>
              <Link href="/resources">Resources</Link>
            </nav>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>
            (c) {new Date().getFullYear()} Native Medicine Garden. Must be 19+
            to enter. Please follow applicable laws and product labels.
          </p>
        </div>
      </div>
    </footer>
  );
}
