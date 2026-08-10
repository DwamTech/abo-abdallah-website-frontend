import { API_BASE_URL } from "@/lib/api";
import { hadithCardsGalleryPageSchema } from "@/lib/hadithCardsApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

const MAX_PER_PAGE = 36;

function failure(status: number, message: string) {
  return Response.json(
    { success: false, message },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

function positiveInteger(value: string | null, fallback: number, maximum: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, maximum);
}

/**
 * Keeps progressive gallery loading on the public origin. It avoids exposing
 * cross-origin browser calls while preserving the Laravel endpoint as the
 * single source of project-card data.
 */
export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) return failure(404, "معرض المشروع المطلوب غير موجود.");

  const searchParams = new URL(request.url).searchParams;
  const page = positiveInteger(searchParams.get("page"), 1, 10_000);
  const perPage = positiveInteger(searchParams.get("per_page"), 24, MAX_PER_PAGE);
  const query = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  const upstreamUrl = `${API_BASE_URL}/hadith-cards/projects/${encodeURIComponent(normalizedSlug)}/gallery?${query}`;

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    return failure(503, "خدمة معرض البطاقات غير متاحة الآن.");
  }

  const payload: unknown = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return failure(
      upstream.status === 404 ? 404 : upstream.status === 422 ? 422 : 502,
      upstream.status === 404
        ? "معرض المشروع المطلوب غير موجود."
        : "تعذّر تحميل معرض البطاقات الآن.",
    );
  }

  const parsed = hadithCardsGalleryPageSchema.safeParse(payload);
  if (!parsed.success) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Hadith cards gallery BFF validation failed", parsed.error.issues);
    }

    return failure(502, "أعادت خدمة معرض البطاقات بيانات غير متوافقة.");
  }

  return Response.json(parsed.data, {
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
