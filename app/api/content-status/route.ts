import { NextResponse } from "next/server";
import { getCigaretteSnapshot } from "../../lib/cigaretteFeed";
import { currentManifestHealth, getFleetContent } from "../../lib/fleetContent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Diagnostic only. No secrets and no environment values. */
export async function GET() {
  const [fleet, cig] = await Promise.all([getFleetContent(), getCigaretteSnapshot()]);
  return NextResponse.json({
    version: fleet.version,
    manifest: currentManifestHealth(),
    mode: fleet.active ? "bundle" : "coded",
    cig: { web: cig.web.show, tv: cig.tv.show },
  }, { headers: { "Cache-Control": "no-store" } });
}
