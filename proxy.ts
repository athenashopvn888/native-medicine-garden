import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PRIMARY_ORIGIN = "https://www.nativemedicinecannabis.com";
const LEGACY_CA_HOSTS = new Set([
  "nativemedicinegarden.ca",
  "www.nativemedicinegarden.ca",
]);

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  if (host && LEGACY_CA_HOSTS.has(host)) {
    const { pathname, search } = request.nextUrl;
    return NextResponse.redirect(new URL(`${PRIMARY_ORIGIN}${pathname}${search}`), 301);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
