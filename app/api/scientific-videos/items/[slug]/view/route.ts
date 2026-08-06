import { SCIENTIFIC_VIDEOS_API_BASE_URL } from "@/lib/scientificVideosApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ slug: string }> };
const COOKIE_PREFIX = "cms_viewed_scientific_video_item_";

function sameOrigin(request: Request): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && !["same-origin", "none"].includes(fetchSite)) return false;
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

function filteredCookieHeader(request: Request): string | undefined {
  const cookies = (request.headers.get("cookie") || "")
    .split(";")
    .map((cookie) => cookie.trim())
    .filter((cookie) => cookie.startsWith(COOKIE_PREFIX));
  return cookies.length ? cookies.join("; ") : undefined;
}

export async function POST(
  request: Request,
  context: Context,
): Promise<Response> {
  if (!sameOrigin(request)) {
    return Response.json({ message: "الطلب غير مسموح." }, { status: 403 });
  }

  const { slug } = await context.params;
  const cookie = filteredCookieHeader(request);
  let upstream: Response;
  try {
    upstream = await fetch(
      `${SCIENTIFIC_VIDEOS_API_BASE_URL}/scientific-videos/items/${encodeURIComponent(slug)}/view`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          ...(cookie ? { Cookie: cookie } : {}),
        },
        cache: "no-store",
      },
    );
  } catch {
    return Response.json({ message: "تعذّر تسجيل المشاهدة." }, { status: 502 });
  }

  if (!upstream.ok) {
    return Response.json(
      {
        message:
          upstream.status === 404
            ? "المادة غير موجودة."
            : "تعذّر تسجيل المشاهدة.",
      },
      {
        status:
          upstream.status >= 400 && upstream.status < 600
            ? upstream.status
            : 502,
      },
    );
  }

  const payload = await upstream
    .json()
    .catch(() => ({ data: { counted: false } }));
  const response = Response.json(payload, { status: 200 });
  const setCookies =
    typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : [upstream.headers.get("set-cookie")].filter((value): value is string =>
          Boolean(value),
        );
  setCookies
    .filter((value) => value.trim().startsWith(COOKIE_PREFIX))
    .forEach((value) => response.headers.append("set-cookie", value));
  response.headers.set("cache-control", "private, no-store");
  return response;
}
