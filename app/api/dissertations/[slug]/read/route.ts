import { type NextRequest } from "next/server";

import { API_BASE_URL } from "@/lib/api";
import { createDissertationReadResponse } from "@/lib/dissertationProxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const headers = new Headers({
    Accept: "application/pdf,application/octet-stream;q=0.9",
  });
  const range = request.headers.get("range");
  const ifRange = request.headers.get("if-range");
  if (range && /^bytes=(?:\d+-\d*|-\d+)$/.test(range.trim())) {
    headers.set("Range", range.trim());
  }
  if (ifRange) headers.set("If-Range", ifRange);

  let upstream: Response;
  try {
    upstream = await fetch(
      `${API_BASE_URL}/dissertations/${encodeURIComponent(slug)}/read`,
      {
        headers,
        cache: "no-store",
        redirect: "manual",
        signal: request.signal,
      },
    );
  } catch {
    return Response.json(
      { message: "تعذّر الاتصال بقارئ الرسائل العلمية." },
      { status: 502 },
    );
  }

  return createDissertationReadResponse(upstream);
}
