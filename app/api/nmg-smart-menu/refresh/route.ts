import { getNmgSmartMenu } from "@/app/lib/nmgSmartMenuService";
import { verifyBearer } from "@/app/lib/staffPhotoAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!verifyBearer(request, process.env.CRON_SECRET)) return Response.json({ ok: false }, { status: 401 });
  try {
    const result = await getNmgSmartMenu({ force: true });
    return Response.json({ ok: true, servedFrom: result.servedFrom, fallbackReason: result.fallbackReason, manifest: result.lineup.manifest });
  } catch (error) {
    console.error("NMG smart-menu refresh failed", error instanceof Error ? error.message : "unknown error");
    return Response.json({ ok: false, error: "NMG smart-menu refresh is unavailable." }, { status: 503 });
  }
}
