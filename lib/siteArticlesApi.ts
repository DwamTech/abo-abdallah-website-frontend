import { z } from "zod";

import { API_BASE_URL, ApiError } from "@/lib/api";

const apiNumber = z.coerce.number();
const nullableText = z.string().nullable().optional();
const nullableApiNumber = z.preprocess(
  (value) => (value === null || value === "" ? undefined : value),
  z.coerce.number().optional(),
);

export const siteArticleCardSchema = z.object({
  id: z.union([z.number(), z.string()]),
  slug: z.string(),
  title: z.string(),
  category: z.string(),
  excerpt: z.string(),
  date_label: z.string(),
  reading_minutes: apiNumber,
  reading_time_label: z.string(),
});

export const siteArticleSchema = siteArticleCardSchema.extend({
  content: z.string(),
  author_name: nullableText,
  featured_image_url: nullableText,
  keywords: z.array(z.string()).default([]),
  views_count: apiNumber,
  published_at: nullableText,
});

export type SiteArticleCard = z.infer<typeof siteArticleCardSchema>;
export type SiteArticle = z.infer<typeof siteArticleSchema>;

const articleStatsSchema = z.object({
  articles_count: apiNumber,
  categories_count: apiNumber,
});

const articleHomeSchema = z.object({
  data: z.array(siteArticleCardSchema).max(6),
  stats: articleStatsSchema,
});

export type SiteArticleHome = z.infer<typeof articleHomeSchema>;

const paginatorLinkSchema = z.string().nullable();
const articleIndexSchema = z.object({
  data: z.array(siteArticleCardSchema),
  links: z.object({
    first: paginatorLinkSchema,
    last: paginatorLinkSchema,
    prev: paginatorLinkSchema,
    next: paginatorLinkSchema,
  }),
  meta: z.object({
    current_page: apiNumber,
    last_page: apiNumber,
    per_page: apiNumber,
    total: apiNumber,
    from: nullableApiNumber,
    to: nullableApiNumber,
  }),
  filter_options: z.object({
    categories: z.array(z.string()),
  }),
});

export type SiteArticleIndex = z.infer<typeof articleIndexSchema>;

const articleDetailSchema = z.object({
  data: siteArticleSchema,
  related_articles: z.array(siteArticleCardSchema).max(3),
});

export type SiteArticleDetail = z.infer<typeof articleDetailSchema>;

function articleApiUrl(
  path: string,
  params?: Record<string, string | number | undefined>,
) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}/site-articles${normalizedPath}`);

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function fetchAndParse<T>(
  path: string,
  schema: z.ZodType<T>,
  options: {
    params?: Record<string, string | number | undefined>;
    signal?: AbortSignal;
  } = {},
) {
  let response: Response;

  try {
    response = await fetch(articleApiUrl(path, options.params), {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw error;
    throw new ApiError("تعذّر الاتصال بخادم المقالات والدراسات.", undefined, {
      cause: error,
    });
  }

  if (!response.ok) {
    throw new ApiError(
      response.status === 404
        ? "المقال أو الدراسة المطلوبة غير موجودة."
        : "تعذّر تحميل بيانات المقالات والدراسات.",
      response.status,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    throw new ApiError(
      "أعاد خادم المقالات استجابة غير صالحة.",
      response.status,
      {
        cause: error,
      },
    );
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "Site articles API validation failed",
        path,
        parsed.error.issues,
      );
    }
    throw new ApiError("صيغة بيانات المقالات غير متوافقة.", response.status, {
      cause: parsed.error,
    });
  }

  return parsed.data;
}

export function getSiteArticlesHome(signal?: AbortSignal) {
  return fetchAndParse("/home", articleHomeSchema, { signal });
}

export function getSiteArticles(
  params: {
    search?: string;
    category?: string;
    page?: number;
    per_page?: number;
  } = {},
  signal?: AbortSignal,
) {
  return fetchAndParse("/items", articleIndexSchema, { params, signal });
}

export function getSiteArticle(slug: string, signal?: AbortSignal) {
  return fetchAndParse(
    `/items/${encodeURIComponent(slug)}`,
    articleDetailSchema,
    { signal },
  );
}
