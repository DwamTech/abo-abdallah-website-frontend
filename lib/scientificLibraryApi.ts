import { z } from "zod";

import { API_BASE_URL, BACKEND_ORIGIN, ApiError } from "@/lib/api";
import { filterScientificLibraryCookieHeader } from "@/lib/scientificLibraryCookies";

const nullableText = z.string().nullable().optional();
const apiNumber = z.coerce.number();
const viewCount = z.coerce.number().int().nonnegative().catch(0);
const nullableApiNumber = z.preprocess(
  (value) => (value === null || value === "" ? undefined : value),
  z.coerce.number().optional(),
);
const apiBoolean = z
  .union([
    z.boolean(),
    z.literal(0),
    z.literal(1),
    z.literal("0"),
    z.literal("1"),
  ])
  .transform((value) => value === true || value === 1 || value === "1");
const stringList = z
  .union([z.array(z.string()), z.null(), z.undefined()])
  .transform((value) => value ?? []);

export const scientificLibraryItemSchema = z
  .object({
    id: z.union([z.number(), z.string()]),
    slug: z.string(),
    title: z.string(),
    short_title: nullableText,
    author_name: z.string(),
    description: z.string(),
    content_type: z.string(),
    scientific_field: z.string(),
    pages_count: apiNumber,
    edition: z.string(),
    publication_info: nullableText,
    source_type: z.enum(["file", "link", "embed"]),
    source_url: nullableText,
    reader_url: nullableText,
    download_url: nullableText,
    cover_url: nullableText,
    keywords: stringList,
    download_allowed: apiBoolean,
    is_featured: apiBoolean,
    is_published: apiBoolean,
    published_at: nullableText,
    views_count: viewCount,
  })
  .passthrough();

export type ScientificLibraryItem = z.infer<typeof scientificLibraryItemSchema>;

export const scientificLibraryCardSchema = z.object({
  id: z.union([z.number(), z.string()]),
  slug: z.string(),
  title: z.string(),
  short_title: nullableText,
  description: z.string(),
  content_type: z.string(),
  scientific_field: z.string(),
  pages_count: apiNumber,
  reader_available: apiBoolean,
  cover_url: nullableText,
  views_count: viewCount,
});

export type ScientificLibraryCard = z.infer<typeof scientificLibraryCardSchema>;

const scientificLibraryStatsSchema = z.object({
  materials_count: apiNumber,
  scientific_fields_count: apiNumber,
});

export type ScientificLibraryStats = z.infer<
  typeof scientificLibraryStatsSchema
>;

const scientificLibraryHomeSchema = z.object({
  data: z.object({
    featured: scientificLibraryCardSchema.nullable(),
    items: z.array(scientificLibraryCardSchema).max(3),
    stats: scientificLibraryStatsSchema,
  }),
});

export type ScientificLibraryHome = z.infer<
  typeof scientificLibraryHomeSchema
>["data"];

const paginatorLinkSchema = z.string().nullable();
const scientificLibraryIndexSchema = z.object({
  data: z.array(scientificLibraryCardSchema),
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
});

export type ScientificLibraryIndex = z.infer<
  typeof scientificLibraryIndexSchema
>;

const scientificLibraryFilterOptionsSchema = z.object({
  data: z.object({
    content_types: z.array(z.string()),
    scientific_fields: z.array(z.string()),
  }),
});

export type ScientificLibraryFilterOptions = z.infer<
  typeof scientificLibraryFilterOptionsSchema
>["data"];

const scientificLibraryDetailSchema = z.object({
  data: z.object({
    item: scientificLibraryItemSchema,
    related_items: z.array(scientificLibraryCardSchema).max(3),
  }),
});

export type ScientificLibraryDetail = z.infer<
  typeof scientificLibraryDetailSchema
>["data"];

function apiUrl(
  path: string,
  params?: Record<string, string | number | undefined>,
) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}/scientific-library${normalizedPath}`);

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== "")
      url.searchParams.set(key, String(value));
  }

  return url.toString();
}

async function fetchAndParse<T>(
  path: string,
  schema: z.ZodType<T>,
  options: {
    params?: Record<string, string | number | undefined>;
    signal?: AbortSignal;
    headers?: HeadersInit;
  } = {},
) {
  let response: Response;

  try {
    const headers = new Headers(options.headers);
    headers.set("Accept", "application/json");
    response = await fetch(apiUrl(path, options.params), {
      headers,
      cache: "no-store",
      credentials: "include",
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw error;
    throw new ApiError("تعذّر الاتصال بخادم المكتبة العلمية.", undefined, {
      cause: error,
    });
  }

  if (!response.ok) {
    throw new ApiError(
      response.status === 404
        ? "المصنَّف المطلوب غير موجود."
        : "تعذّر تحميل بيانات المكتبة العلمية.",
      response.status,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    throw new ApiError(
      "أعاد خادم المكتبة استجابة غير صالحة.",
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
        "Scientific library API response validation failed",
        path,
        parsed.error.issues,
      );
    }
    throw new ApiError(
      "صيغة بيانات المكتبة العلمية غير متوافقة.",
      response.status,
      {
        cause: parsed.error,
      },
    );
  }

  return parsed.data;
}

export async function getScientificLibraryHome(signal?: AbortSignal) {
  const result = await fetchAndParse("/home", scientificLibraryHomeSchema, {
    signal,
  });
  return result.data;
}

export function getScientificLibraryItems(
  params: {
    search?: string;
    content_type?: string;
    scientific_field?: string;
    page?: number;
    per_page?: number;
  } = {},
  signal?: AbortSignal,
) {
  return fetchAndParse("/items", scientificLibraryIndexSchema, {
    params,
    signal,
  });
}

export async function getScientificLibraryFilterOptions(signal?: AbortSignal) {
  const result = await fetchAndParse(
    "/filter-options",
    scientificLibraryFilterOptionsSchema,
    { signal },
  );
  return result.data;
}

export async function getScientificLibraryItem(
  slug: string,
  options: { signal?: AbortSignal; cookie?: string } = {},
) {
  const cookie = filterScientificLibraryCookieHeader(options.cookie);
  const result = await fetchAndParse(
    `/items/${encodeURIComponent(slug)}`,
    scientificLibraryDetailSchema,
    {
      signal: options.signal,
      headers: cookie ? { Cookie: cookie } : undefined,
    },
  );
  return result.data;
}

export async function recordScientificLibraryView(slug: string) {
  const response = await fetch(
    `/api/scientific-library/items/${encodeURIComponent(slug)}/view`,
    {
      method: "POST",
      headers: { Accept: "application/json" },
      credentials: "same-origin",
      cache: "no-store",
      keepalive: true,
    },
  );

  if (!response.ok) {
    throw new ApiError("تعذّر تسجيل مشاهدة المصنَّف.", response.status);
  }
}

export function scientificLibraryDownloadUrl(slug: string) {
  return apiUrl(`/items/${encodeURIComponent(slug)}/download`);
}

/**
 * Converts API-relative URLs to absolute URLs and rejects executable or unknown
 * schemes before a value reaches an anchor or iframe.
 */
export function resolveScientificLibraryUrl(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  try {
    const scientificPath = trimmed.replace(/^\/+/, "");
    const candidate = scientificPath.startsWith("scientific-library/")
      ? new URL(`${API_BASE_URL}/${scientificPath}`)
      : new URL(trimmed, `${BACKEND_ORIGIN}/`);

    return candidate.protocol === "http:" || candidate.protocol === "https:"
      ? candidate.toString()
      : null;
  } catch {
    return null;
  }
}

function googleDrivePreview(value: string) {
  try {
    const url = new URL(value);
    if (!/(^|\.)drive\.google\.com$/i.test(url.hostname)) return null;

    const id =
      url.pathname.match(/\/file\/d\/([^/]+)/)?.[1] ??
      url.searchParams.get("id");
    return id
      ? `https://drive.google.com/file/d/${encodeURIComponent(id)}/preview`
      : null;
  } catch {
    return null;
  }
}

export type ScientificLibraryReaderSource = {
  sourceUrl: string | null;
  readerUrl: string | null;
  downloadUrl: string | null;
};

export function resolveScientificLibraryReader(
  item: Pick<
    ScientificLibraryItem,
    "slug" | "source_type" | "source_url" | "reader_url"
  > & { download_url?: string | null },
): ScientificLibraryReaderSource {
  const sourceUrl = resolveScientificLibraryUrl(item.source_url);
  const suppliedReaderUrl = resolveScientificLibraryUrl(item.reader_url);
  const sourceType = item.source_type?.toLowerCase().trim() ?? "";

  const readerCandidate = suppliedReaderUrl || sourceUrl;
  let readerUrl: string | null = null;

  if (sourceType === "file") {
    // The backend's global frame policy intentionally blocks direct iframe
    // embedding. Keep local files private there and stream them through our
    // same-origin route, which also preserves PDF byte-range requests.
    readerUrl = `/api/scientific-library/items/${encodeURIComponent(item.slug)}/read`;
  } else if (sourceType === "embed") {
    readerUrl = suppliedReaderUrl || sourceUrl;
  } else if (readerCandidate) {
    readerUrl = googleDrivePreview(readerCandidate);
    if (!readerUrl && /\.pdf(?:$|[?#])/i.test(readerCandidate)) {
      readerUrl = readerCandidate;
    }
  }

  return {
    sourceUrl,
    readerUrl,
    downloadUrl: resolveScientificLibraryUrl(item.download_url),
  };
}
