import { NextResponse } from "next/server";
import { allFlowers, allItems } from "../../lib/products";
import { getCigaretteSnapshot, reconcileSurfaceItems, snapshotHeaders } from "../../lib/cigaretteFeed";
import { getTvData } from "../../lib/tvStock";

export const runtime = "nodejs";

// Always run the handler. Upstream Apps Script reads are cached for ~300s
// inside getTvData; this response itself is not cached (Cache-Control: no-store).
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const type = new URL(request.url).searchParams.get("type") || "flowers";
  const snap = await getCigaretteSnapshot();
  const { body, headers } = await getTvData({
    type,
    staticFlowers: allFlowers,
    staticItems: allItems,
  });

  let payload: unknown = body;
  const responseHeaders: Record<string, string> = { ...headers, ...snapshotHeaders(snap) };
  if (type === "items" && Array.isArray(body)) {
    const menuItems = body as typeof snap.items;
    payload = reconcileSurfaceItems(menuItems, snap.items, snap.tv.show);
    responseHeaders["x-tv-data-item-count"] = String((payload as unknown[]).length);
  }

  return NextResponse.json(payload, { headers: responseHeaders });
}
