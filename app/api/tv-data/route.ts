import { NextResponse } from "next/server";
import { allItems } from "../../lib/products";
import { getNmgSmartMenu } from "../../lib/nmgSmartMenuService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "flowers";

  if (type === "items") {
    return NextResponse.json(allItems);
  }

  if (type === "smart-manifest") {
    try {
      const result = await getNmgSmartMenu();
      return NextResponse.json({ servedFrom: result.servedFrom, fallbackReason: result.fallbackReason, manifest: result.lineup.manifest });
    } catch {
      return NextResponse.json({ error: "No valid NMG smart-menu lineup is available." }, { status: 503 });
    }
  }

  try {
    const result = await getNmgSmartMenu();
    return NextResponse.json({ kind: "nmg-smart-lineup", ...result });
  } catch {
    return NextResponse.json({ error: "No valid NMG smart-menu lineup is available." }, { status: 503 });
  }
}
