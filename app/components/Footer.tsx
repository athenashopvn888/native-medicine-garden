"use client";

import Link from "next/link";
import { useCigaretteState } from "./CigaretteStateProvider";
import { useFleetContent } from "./FleetContentProvider";
import { napMatchesCoded } from "../lib/fleet/resolve";
import styles from "./Footer.module.css";

export default function Footer() {
  const showCigarettes = useCigaretteState().web;
  const fleet = useFleetContent();
  const custom = fleet.active && !napMatchesCoded(fleet.nap);
  const street = custom ? fleet.nap.street : "76 Gerrard St W";
  const cityLine = custom ? fleet.nap.cityLine : "Toronto, ON M5G 1J5";
  const phoneDisplay = custom ? fleet.nap.phoneDisplay : "+1 (437) 374-4544";
  const phoneTel = custom ? fleet.nap.phoneTel : "+14373744544";
  const hours = custom ? fleet.nap.hours : "Open 24 Hours";
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
              <a href={`tel:${phoneTel}`} className={styles.btnPrimary}>
                Call Now
              </a>
            </div>
          </div>

          {/* Column 2 — Contact Info */}
          <div className={styles.col}>
            <h3 className={styles.colTitle}>Contact Info</h3>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>Address:</span>
              <span>{street}</span>
              <span>{cityLine}</span>
              <span>Canada</span>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>Phone:</span>
              <span>
                <a href={`tel:${phoneTel}`} style={{ color: "inherit" }}>
                  {phoneDisplay}
                </a>
              </span>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>Hours:</span>
              <span className={styles.highlight}>{hours}</span>
            </div>
          </div>

          {/* Column 3 — Quick Links */}
          <div className={styles.col}>
            <h3 className={styles.colTitle}>Quick Links</h3>
            <nav className={styles.links}>
              <Link href="/">Home</Link>
              <Link href="/visit">Visit Gerrard &amp; Bay</Link>
              <Link href="/exotic-weed">Exotic Weed</Link>
              <Link href="/premium-weed">Premium Weed</Link>
              <Link href="/aaa-weed">AAA+ Weed</Link>
              <Link href="/aa-weed">AA Weed</Link>
              <Link href="/budget-weed">Budget Weed</Link>
              <Link href="/items/edibles">Edibles</Link>
              {showCigarettes ? (<Link href="/items/cigarettes" data-cig-marker="">Cigarettes</Link>) : <Link href="/items/cigarettes">Backwoods</Link>}
<Link href="/items/vapes">Nicotine Vapes</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/hours">Store Hours</Link>
              <Link href="/weed-dispensary-gerrard-bay">Gerrard &amp; Bay dispensary</Link>
              <Link href="/weed-delivery-toronto">WEED DELIVERY</Link>
              <Link href="/info/cheap-weed-gerrard-bay">
                Cheap Weed Gerrard and Bay
              </Link>
{showCigarettes ? (<Link href="/info/native-cigarettes-gerrard-bay" data-cig-marker="">
                Native Cigarettes
              </Link>) : null}
              <Link href="/info/nicotine-vapes-gerrard-bay">Nicotine Vapes Gerrard & Bay</Link>
              <Link href="/contact">Contact Us</Link>
              <Link href="/weed-resources">Weed Resources</Link>
              <Link href="/guides">Guides</Link>
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
