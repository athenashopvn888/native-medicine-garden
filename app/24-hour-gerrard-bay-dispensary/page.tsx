import type { Metadata } from "next";
import AuthorityLanding from "../components/AuthorityLanding";
import { AUTHORITY_PAGES } from "../lib/authorityPages";
export const metadata: Metadata = { title: { absolute: "24 Hour Dispensary Gerrard & Bay, Downtown Toronto | Native Medicine Garden" }, description: AUTHORITY_PAGES.hours.summary, alternates: { canonical: AUTHORITY_PAGES.hours.path }, robots: { index: true, follow: true } };
export default function Page(){ return <AuthorityLanding page={AUTHORITY_PAGES.hours} />; }
