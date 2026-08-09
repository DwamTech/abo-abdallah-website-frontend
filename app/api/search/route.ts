import { API_BASE_URL } from "@/lib/api";
import { searchResponseSchema } from "@/lib/searchContract";
import {
  approvedPreviewSearchQuery,
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
  const query = approvedPreviewSearchQuery(new URL(request.url).searchParams);
  if (!query) return failure(422, "أدخل عبارة بحث صحيحة.");

  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE_URL}/search?${query}`, {
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
      status === 422
        ? "أدخل عبارة بحث صحيحة."
        : status === 429
          ? "طلبات البحث كثيرة حاليًا؛ حاول بعد قليل."
          : "تعذّر تنفيذ البحث الآن.",
    );
  }

  const parsed = searchResponseSchema.safeParse(payload);
  if (!parsed.success) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Search preview validation failed", parsed.error.issues);
    }
    return failure(502, "أعادت خدمة البحث بيانات غير متوافقة.");
  }

  return Response.json(parsed.data, {
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
