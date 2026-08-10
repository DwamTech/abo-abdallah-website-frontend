import { isSameOriginMutation } from "./sameOriginRequest.ts";

const VIEW_COOKIE_PREFIX = "cms_viewed_";

export function publicViewCookieHeader(value: string | null): string | null {
  const cookies = (value ?? "")
    .split(";")
    .map((cookie) => cookie.trim())
    .filter((cookie) => cookie.startsWith(VIEW_COOKIE_PREFIX));

  return cookies.length ? cookies.join("; ") : null;
}

function upstreamSetCookies(upstream: Response): string[] {
  if (typeof upstream.headers.getSetCookie === "function") {
    return upstream.headers.getSetCookie();
  }

  const cookie = upstream.headers.get("set-cookie");
  return cookie ? [cookie] : [];
}

function privateJson(payload: unknown, status: number) {
  const response = Response.json(payload, { status });
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}

export function publicViewFailureStatus(status: number): 403 | 404 | 429 | 502 {
  return status === 403 || status === 404 || status === 429 ? status : 502;
}

export async function proxyPublicView(
  request: Request,
  upstreamUrl: string,
): Promise<Response> {
  if (!isSameOriginMutation(request)) {
    return privateJson(
      { message: "الطلب غير مسموح من هذا المصدر." },
      403,
    );
  }

  const headers = new Headers({ Accept: "application/json" });
  const cookie = publicViewCookieHeader(request.headers.get("cookie"));
  if (cookie) headers.set("Cookie", cookie);

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers,
      cache: "no-store",
      redirect: "manual",
      signal: request.signal,
    });
  } catch {
    if (request.signal.aborted) return new Response(null, { status: 499 });
    return privateJson({ message: "تعذّر الاتصال بخدمة المشاهدات." }, 502);
  }

  if (!upstream.ok) {
    const status = publicViewFailureStatus(upstream.status);
    const message =
      status === 403
        ? "تسجيل المشاهدة غير متاح."
        : status === 404
          ? "المادة المطلوبة غير موجودة."
          : status === 429
            ? "طلبات المشاهدة كثيرة حاليًا؛ حاول بعد قليل."
            : "تعذّر تسجيل المشاهدة.";
    return privateJson({ message }, status);
  }

  if (upstream.status === 204) {
    return new Response(null, {
      status: 204,
      headers: {
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        Vary: "Cookie",
      },
    });
  }

  const payload: unknown = await upstream.json().catch(() => null);
  if (payload === null) {
    return privateJson({ message: "تعذّر تسجيل المشاهدة." }, 502);
  }

  const response = privateJson(payload, upstream.status);
  response.headers.set("Vary", "Cookie");

  upstreamSetCookies(upstream)
    .filter((value) => value.trim().startsWith(VIEW_COOKIE_PREFIX))
    .forEach((value) => response.headers.append("Set-Cookie", value));

  return response;
}
