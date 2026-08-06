import { type NextRequest } from "next/server";

import { API_BASE_URL } from "@/lib/api";
import { filterScientificLibraryCookieHeader } from "@/lib/scientificLibraryCookies";
import { createScientificLibraryViewResponse } from "@/lib/scientificLibraryProxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

function isSameOriginPost(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    return false;
  }

  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const originUrl = new URL(origin);
    const requestHost = request.headers.get("host")?.trim().toLowerCase();
    return (
      originUrl.origin === request.nextUrl.origin ||
      Boolean(requestHost && originUrl.host.toLowerCase() === requestHost)
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  if (!isSameOriginPost(request)) {
    return Response.json(
      { message: "الطلب غير مسموح من هذا المصدر." },
      { status: 403, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const { slug } = await context.params;
  const upstreamHeaders = new Headers({ Accept: "application/json" });
  const cookie = filterScientificLibraryCookieHeader(
    request.headers.get("cookie"),
  );
  if (cookie) upstreamHeaders.set("Cookie", cookie);

  let upstream: Response;
  try {
    upstream = await fetch(
      `${API_BASE_URL}/scientific-library/items/${encodeURIComponent(slug)}/view`,
      {
        method: "POST",
        headers: upstreamHeaders,
        cache: "no-store",
        redirect: "manual",
        signal: request.signal,
      },
    );
  } catch (error) {
    if (request.signal.aborted) {
      return new Response(null, { status: 499 });
    }

    console.error("Scientific library view proxy failed", error);
    return Response.json(
      { message: "تعذّر الاتصال بخدمة مشاهدات المكتبة العلمية." },
      { status: 502 },
    );
  }

  return createScientificLibraryViewResponse(upstream);
}
