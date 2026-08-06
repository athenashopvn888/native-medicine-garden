import { NextResponse } from "next/server";
import { getNmgSmartMenu } from "../../lib/nmgSmartMenuService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function headers(source: string, timestamp: string | null) {
  return {
    "cache-control": "no-store, max-age=0",
    "x-tv-data-refresh-seconds": "300",
    "x-tv-data-source": source,
    "x-tv-data-as-of": timestamp || "unavailable",
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "flowers";

  if (type === "items") {
    try {
      const result = await getNmgSmartMenu();
      if (!result.items.length) throw new Error("No valid NMG live items are available.");
      return NextResponse.json(result.items, { headers: headers(result.itemsSource, result.itemsSourceTimestamp) });
    } catch {
      return NextResponse.json({ error: "No valid NMG live items are available." }, { status: 503, headers: headers("unavailable", null) });
    }
  }

  if (type === "smart-manifest") {
    try {
      const result = await getNmgSmartMenu();
      return NextResponse.json({ servedFrom: result.servedFrom, fallbackReason: result.fallbackReason, itemsSource: result.itemsSource, itemsSourceTimestamp: result.itemsSourceTimestamp, manifest: result.lineup.manifest }, { headers: headers(result.servedFrom, result.lineup.sourceTimestamp) });
    } catch {
      return NextResponse.json({ error: "No valid NMG smart-menu lineup is available." }, { status: 503 });
    }
  }

  try {
    const result = await getNmgSmartMenu();
    return NextResponse.json({ kind: "nmg-smart-lineup", ...result }, { headers: headers(result.servedFrom, result.lineup.sourceTimestamp) });
  } catch {
    return NextResponse.json({ error: "No valid NMG smart-menu lineup is available." }, { status: 503 });
  }
}
