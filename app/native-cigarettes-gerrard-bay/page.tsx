import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthorityLanding from "../components/AuthorityLanding";
import CigaretteUnavailable from "../components/CigaretteUnavailable";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { AUTHORITY_PAGES } from "../lib/authorityPages";
import { publicWebsiteCigaretteFlag } from "../lib/cigDecision";
import { cigarettePageUnavailable, getCigaretteSnapshot } from "../lib/cigaretteFeed";
import { SHOW_CIGARETTES } from "../lib/siteConfig";
export const metadata: Metadata = { title: { absolute: "Native Cigarettes Gerrard & Bay, Downtown Toronto | Native Medicine Garden" }, description: AUTHORITY_PAGES.cigarettes.summary, alternates: { canonical: AUTHORITY_PAGES.cigarettes.path }, robots: { index: true, follow: true } };
export const dynamic = "force-dynamic";
export default async function Page() {
  const snap = await getCigaretteSnapshot();
  if (cigarettePageUnavailable(snap.web)) {
    return <><Navbar /><CigaretteUnavailable /><Footer /></>;
  }
  if (!publicWebsiteCigaretteFlag(snap.web, SHOW_CIGARETTES)) redirect("/items/vapes");
  return <AuthorityLanding page={AUTHORITY_PAGES.cigarettes} />;
}
