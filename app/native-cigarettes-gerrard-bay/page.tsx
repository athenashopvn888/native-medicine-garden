import type { Metadata } from "next";
import AuthorityLanding from "../components/AuthorityLanding";
import { AUTHORITY_PAGES } from "../lib/authorityPages";
export const metadata: Metadata = { title: { absolute: "Native Cigarettes Gerrard & Bay, Downtown Toronto | Native Medicine Garden" }, description: AUTHORITY_PAGES.cigarettes.summary, alternates: { canonical: AUTHORITY_PAGES.cigarettes.path }, robots: { index: true, follow: true } };
export default function Page(){ return <AuthorityLanding page={AUTHORITY_PAGES.cigarettes} />; }
