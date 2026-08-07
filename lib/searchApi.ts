import { z } from "zod";
import { API_BASE_URL, ApiError } from "@/lib/api";

// ─────────────────────────── Schemas ───────────────────────────

const searchResultItemSchema = z.object({
  id: z.union([z.number(), z.string()]),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.string(),
  url: z.string(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

const searchModuleResultSchema = z.object({
  label: z.string(),
  items: z.array(searchResultItemSchema),
  total: z.coerce.number(),
  more_url: z.string(),
});

const searchResponseSchema = z.object({
  query: z.string(),
  results: z.record(z.string(), searchModuleResultSchema),
  total_results: z.coerce.number(),
});

// ─────────────────────────── Types ───────────────────────────

export type SearchResultItem = z.infer<typeof searchResultItemSchema>;
export type SearchModuleResult = z.infer<typeof searchModuleResultSchema>;
export type SearchResponse = z.infer<typeof searchResponseSchema>;

export type SearchParams = {
  q: string;
  limit?: number;
  modules?: string[];
};

// ─────────────────────────── API ───────────────────────────

function buildSearchUrl(params: SearchParams): string {
  const url = new URL(`${API_BASE_URL}/search`);
  url.searchParams.set("q", params.q);
  if (params.limit !== undefined) {
    url.searchParams.set("limit", String(params.limit));
  }
  if (params.modules && params.modules.length > 0) {
    url.searchParams.set("modules", params.modules.join(","));
  }
  return url.toString();
}

/**
 * globalSearch — يبحث عبر جميع موديولات المحتوى بطلب واحد.
 *
 * يستدعي GET /api/search?q=... ويُعيد النتائج الموحّدة.
 */
export async function globalSearch(
  params: SearchParams,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  let response: Response;

  try {
    response = await fetch(buildSearchUrl(params), {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw error;
    throw new ApiError("تعذّر الاتصال بخادم البحث.", undefined, {
      cause: error,
    });
  }

  if (!response.ok) {
    throw new ApiError(
      response.status === 422
        ? "أدخل كلمة بحث أطول."
        : "تعذّر تنفيذ البحث. حاول مرة أخرى.",
      response.status,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    throw new ApiError("أعاد الخادم استجابة غير صالحة.", response.status, {
      cause: error,
    });
  }

  const parsed = searchResponseSchema.safeParse(payload);
  if (!parsed.success) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Search API validation failed", parsed.error.issues);
    }
    throw new ApiError("صيغة نتائج البحث غير متوافقة.", response.status, {
      cause: parsed.error,
    });
  }

  return parsed.data;
}

/** ترتيب الموديولات في نتائج البحث */
export const SEARCH_MODULE_ORDER = [
  "library",
  "listening",
  "fatwas",
  "dissertations",
  "videos",
  "articles",
] as const;

/** أيقونات Lucide لكل موديول */
export const SEARCH_MODULE_ICONS: Record<string, string> = {
  library: "BookOpen",
  listening: "Headphones",
  fatwas: "MessageCircleQuestion",
  dissertations: "GraduationCap",
  videos: "Video",
  articles: "FileText",
};
