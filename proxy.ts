import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/api";
import { createWebsiteStatusReader } from "@/lib/websiteStatus";
import { maintenanceResponse } from "@/lib/maintenanceDocument";

const getWebsiteStatus = createWebsiteStatusReader(
  `${API_BASE_URL}/site/status`,
);

export async function proxy(request: NextRequest) {
  const status = await getWebsiteStatus();
  if (status !== "open") {
    return maintenanceResponse(status === "closed", request.method === "HEAD");
  }

  return NextResponse.next({
    headers: {
      "Cache-Control": "private, no-store",
      "CDN-Cache-Control": "no-store",
    },
  });
}

// Leave the existing API routes, immutable assets, public media, and ACME challenges reachable.
export const config = {
  matcher: [
    "/((?!api(?:/|$)|_next/static/|_next/image(?:/|$)|media/|\\.well-known/|(?:favicon\\.ico|icon\\.svg|robots\\.txt|sitemap\\.xml)$).*)",
  ],
};
