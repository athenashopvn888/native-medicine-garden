import Link from "next/link";
import styles from "./VapeActionPanel.module.css";
import { DIRECTIONS_URL, PHONE_DISPLAY, PHONE_TEL } from "../lib/store";

export default function VapeActionPanel() {
  const body = encodeURIComponent("Hi Native Medicine Garden, please hold this nicotine vape/flavour if available: ");
  return <aside className={styles.panel} aria-label="Nicotine vape contact options"><div><strong>Confirm a nicotine vape before travelling</strong><p>Adults 19+ with valid government photo ID. Nicotine is addictive. A hold is confirmed only when staff reply.</p></div><div className={styles.actions}><a href={`tel:${PHONE_TEL}`}>Call {PHONE_DISPLAY}</a><a href={DIRECTIONS_URL}>Directions</a><a href={`sms:${PHONE_TEL}?&body=${body}`}>Text to hold</a><Link href="/vape-shop-gerrard-bay">Vape shop page</Link></div></aside>;
}
