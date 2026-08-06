import { type NextRequest } from "next/server";

import { API_BASE_URL } from "@/lib/api";
import { filterScientificLibraryCookieHeader } from "@/lib/scientificLibraryCookies";
import { createScientificLibraryReadResponse } from "@/lib/scientificLibraryProxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const upstreamHeaders = new Headers({
    Accept: "application/pdf,application/octet-stream;q=0.9,*/*;q=0.8",
  });

  const range = request.headers.get("range");
  const ifRange = request.headers.get("if-range");
  const cookie = filterScientificLibraryCookieHeader(
    request.headers.get("cookie"),
  );
  if (range) upstreamHeaders.set("Range", range);
  if (ifRange) upstreamHeaders.set("If-Range", ifRange);
  if (cookie) upstreamHeaders.set("Cookie", cookie);

  let upstream: Response;
  try {
    upstream = await fetch(
      `${API_BASE_URL}/scientific-library/items/${encodeURIComponent(slug)}/read`,
      {
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

    console.error("Scientific library reader proxy failed", error);
    return Response.json(
      { message: "تعذّر الاتصال بقارئ المكتبة العلمية." },
      { status: 502 },
    );
  }

  return createScientificLibraryReadResponse(upstream);
}
