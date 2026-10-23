import { NextResponse } from "next/server";
import { getCigaretteSnapshot, toPublicCigaretteState } from "../../lib/cigaretteFeed";
import { currentManifestHealth, getFleetContent } from "../../lib/fleetContent";
import { contentStatusPayload } from "../../lib/fleet/status";
import { SHOW_CIGARETTES } from "../../lib/siteConfig";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Diagnostic only. No secrets and no environment values. */
export async function GET() {
  const [fleet, cig] = await Promise.all([getFleetContent(), getCigaretteSnapshot()]);
  const cigarettes = toPublicCigaretteState(cig);
  return NextResponse.json({
    ...contentStatusPayload(fleet, {
      web: SHOW_CIGARETTES ? cigarettes.web : false,
      tv: cigarettes.tv,
      guides: cig.guides.show,
    }),
    manifest: currentManifestHealth(),
    mode: fleet.active ? "bundle" : "coded",
  }, { headers: { "Cache-Control": "no-store" } });
}
