import { NextResponse } from "next/server";
import { getCigaretteSnapshot } from "../../lib/cigaretteFeed";
import { currentManifestHealth, getFleetContent } from "../../lib/fleetContent";
import { contentStatusPayload } from "../../lib/fleet/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Diagnostic only. No secrets and no environment values. */
export async function GET() {
  const [fleet, cig] = await Promise.all([getFleetContent(), getCigaretteSnapshot()]);
  return NextResponse.json({
    ...contentStatusPayload(fleet, { web: cig.web.show, tv: cig.tv.show, guides: cig.guides.show }),
    manifest: currentManifestHealth(),
    mode: fleet.active ? "bundle" : "coded",
  }, { headers: { "Cache-Control": "no-store" } });
}
