import { API_BASE_URL } from "@/lib/api";
import { searchResultsResponseSchema } from "@/lib/searchContract";
import {
  approvedResultsSearchQuery,
  browserSafeSearchResults,
  safeSearchProxyStatus,
} from "@/lib/searchProxy";

export const dynamic = "force-dynamic";

function failure(status: number, message: string) {
  return Response.json(
    { message },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

export async function GET(request: Request) {
  const query = approvedResultsSearchQuery(new URL(request.url).searchParams);
  if (!query) return failure(422, "راجع عبارة البحث وخيارات الصفحة.");

  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE_URL}/search/results?${query}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      redirect: "manual",
      signal: request.signal,
    });
  } catch {
    if (request.signal.aborted) return new Response(null, { status: 499 });
    return failure(502, "تعذّر الاتصال بخدمة البحث.");
  }

  const payload: unknown = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    const status = safeSearchProxyStatus(upstream.status);
    return failure(
      status,
      status === 404
        ? "صفحة النتائج المطلوبة غير موجودة."
        : status === 422
          ? "راجع عبارة البحث وخيارات الصفحة."
          : status === 429
            ? "طلبات البحث كثيرة حاليًا؛ حاول بعد قليل."
            : "تعذّر تنفيذ البحث الآن.",
    );
  }

  const parsed = searchResultsResponseSchema.safeParse(payload);
  if (!parsed.success) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Search results validation failed", parsed.error.issues);
    }
    return failure(502, "أعادت خدمة البحث بيانات غير متوافقة.");
  }

  return Response.json(browserSafeSearchResults(parsed.data), {
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
