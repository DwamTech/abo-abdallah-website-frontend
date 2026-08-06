import { z } from "zod";

const configuredBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:8000";

const backendBaseUrl = configuredBaseUrl.replace(/\/+$/, "");

export const API_BASE_URL = backendBaseUrl.endsWith("/api")
  ? backendBaseUrl
  : `${backendBaseUrl}/api`;

export const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const nullableText = z.string().nullable().optional();
const apiNumber = z.coerce.number();
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

export const sectionSchema = z
  .object({ name: z.string() })
  .passthrough()
  .nullable()
  .optional();

export const bookSchema = z
  .object({
    id: z.union([z.number(), z.string()]),
    slug: z.string().nullable().optional(),
    title: z.string(),
    short_title: nullableText,
    description: nullableText,
    pages_count: nullableApiNumber,
    edition: nullableText,
    publication_info: nullableText,
    source_type: nullableText,
    file_path: nullableText,
    source_link: nullableText,
    download_allowed: apiBoolean.optional().default(false),
    is_published: apiBoolean.optional().default(true),
    published_at: nullableText,
    keywords: stringList,
    section: sectionSchema,
    cover_path: nullableText,
    cover_type: nullableText,
    type: nullableText,
  })
  .passthrough();

export type Book = z.infer<typeof bookSchema>;

const rawPaginatorSchema = z
  .object({
    current_page: apiNumber,
    data: z.array(bookSchema),
    from: nullableApiNumber,
    last_page: apiNumber,
    next_page_url: nullableText,
    per_page: apiNumber,
    prev_page_url: nullableText,
    to: nullableApiNumber,
    total: apiNumber,
  })
  .passthrough();

const libraryStatsSchema = z.object({
  data: z.object({
    materials_count: apiNumber,
    scientific_fields_count: apiNumber,
  }),
});

const bookDetailSchema = z
  .object({
    book: bookSchema,
    related_books: z.array(bookSchema).optional().default([]),
    related_parts: z.array(z.unknown()).optional(),
  })
  .passthrough();

export type BookDetail = z.infer<typeof bookDetailSchema>;

export const dissertationSchema = z
  .object({
    id: z.union([z.number(), z.string()]),
    slug: z.string(),
    title: z.string(),
    researcher_name: z.string(),
    university: z.string(),
    college: nullableText,
    year: apiNumber,
    specialization: z.string(),
    participation_type: z.string(),
    degree: z.string(),
    abstract: nullableText,
    participation_description: nullableText,
    source_type: z.enum(["file", "link", "embed"]).nullable(),
    file_path: nullableText,
    has_file: apiBoolean.optional().default(false),
    file_url: nullableText,
    source_link: nullableText,
    keywords: stringList,
    is_published: apiBoolean.optional().default(true),
    status: z.enum(["draft", "scheduled", "published"]).optional(),
    published_at: nullableText,
  })
  .passthrough();

export type Dissertation = z.infer<typeof dissertationSchema>;

export const dissertationCardSchema = dissertationSchema
  .pick({
    id: true,
    slug: true,
    title: true,
    researcher_name: true,
    university: true,
    college: true,
    year: true,
    specialization: true,
    participation_type: true,
    degree: true,
    abstract: true,
  })
  .strip();

export type DissertationCard = z.infer<typeof dissertationCardSchema>;

const unknownRecordSchema = z.record(z.string(), z.unknown());

const resourceLinksSchema = z
  .object({
    first: nullableText,
    last: nullableText,
    prev: nullableText,
    next: nullableText,
  })
  .passthrough();

const resourceMetaSchema = z
  .object({
    current_page: apiNumber,
    from: nullableApiNumber,
    last_page: apiNumber,
    per_page: apiNumber,
    to: nullableApiNumber,
    total: apiNumber,
  })
  .passthrough();

const dissertationPaginatorSchema = z
  .object({
    data: z.array(dissertationCardSchema),
    links: resourceLinksSchema,
    meta: resourceMetaSchema,
    filter_options: unknownRecordSchema.optional().default({}),
    stats: unknownRecordSchema.optional().default({}),
  })
  .passthrough();

const dissertationDetailSchema = z
  .object({
    data: dissertationSchema,
    related_dissertations: z
      .array(dissertationCardSchema)
      .max(3)
      .optional()
      .default([]),
  })
  .passthrough();

export type DissertationDetail = z.infer<typeof dissertationDetailSchema>;

const dissertationHomeSchema = z
  .object({
    data: z.array(dissertationCardSchema).max(4),
    stats: z
      .object({
        total_dissertations: apiNumber,
        universities_count: apiNumber,
        specializations_count: apiNumber,
        supervised_count: apiNumber,
      })
      .passthrough(),
    specializations: z.array(z.string()).max(6),
  })
  .passthrough();

export type DissertationHome = z.infer<typeof dissertationHomeSchema>;

export const listeningSessionSchema = z
  .object({
    id: z.union([z.number(), z.string()]),
    listening_series_id: z.union([z.number(), z.string()]).optional(),
    series_id: z.union([z.number(), z.string()]).optional(),
    slug: z.string(),
    sequence_number: apiNumber,
    title: z.string(),
    date_label: nullableText,
    duration_minutes: nullableApiNumber,
    duration_label: nullableText,
    description: nullableText,
    audio_source_type: nullableText,
    audio_url: nullableText,
    audio_download_allowed: apiBoolean.optional().default(false),
    published_at: nullableText,
  })
  .passthrough();

export type ListeningSession = z.infer<typeof listeningSessionSchema>;

export const listeningSeriesCardSchema = z.object({
  id: z.union([z.number(), z.string()]),
  slug: z.string(),
  title: z.string(),
  short_title: z.string(),
  category: z.string(),
  description: nullableText,
  period_label: nullableText,
  visual_variant: nullableText,
  sessions_count: apiNumber.optional().default(0),
  first_session_slug: nullableText,
});

export type ListeningSeriesCard = z.infer<typeof listeningSeriesCardSchema>;

export const listeningSeriesSchema = listeningSeriesCardSchema
  .extend({
    book_source_type: nullableText,
    book_url: nullableText,
    book_download_allowed: apiBoolean.optional().default(false),
    published_at: nullableText,
  })
  .passthrough();

export type ListeningSeries = z.infer<typeof listeningSeriesSchema>;

export type ListeningSeriesDetail = ListeningSeries & {
  sessions: ListeningSession[];
};

const listeningStatsSchema = z
  .object({
    series_count: apiNumber.optional(),
    sessions_count: apiNumber.optional(),
    total_series: apiNumber.optional(),
    total_sessions: apiNumber.optional(),
  })
  .passthrough()
  .transform((value) => ({
    series_count: value.series_count ?? value.total_series ?? 0,
    sessions_count: value.sessions_count ?? value.total_sessions ?? 0,
  }));

export type ListeningStats = z.infer<typeof listeningStatsSchema>;

const listeningHomeSchema = z
  .object({
    data: z.array(listeningSeriesCardSchema).max(4),
    stats: listeningStatsSchema,
  })
  .passthrough();

const listeningFilterOptionsSchema = z
  .object({
    categories: z.array(z.string()).optional().default([]),
  })
  .passthrough();

const listeningPaginatorSchema = z
  .object({
    data: z.array(listeningSeriesCardSchema),
    links: resourceLinksSchema,
    meta: resourceMetaSchema,
    filter_options: listeningFilterOptionsSchema
      .optional()
      .default({ categories: [] }),
    stats: listeningStatsSchema,
  })
  .passthrough();

const listeningSeriesDetailSchema = z
  .object({
    data: listeningSeriesSchema.extend({
      sessions: z.array(listeningSessionSchema).optional().default([]),
    }),
  })
  .passthrough();

const listeningNavigationSessionSchema = listeningSessionSchema
  .pick({
    id: true,
    listening_series_id: true,
    series_id: true,
    slug: true,
    sequence_number: true,
    title: true,
  })
  .passthrough();

const listeningSessionDetailSchema = z
  .object({
    data: z
      .object({
        series: listeningSeriesSchema,
        session: listeningSessionSchema,
        previous_session: listeningNavigationSessionSchema
          .nullable()
          .optional(),
        next_session: listeningNavigationSessionSchema.nullable().optional(),
      })
      .passthrough(),
  })
  .passthrough();

export type ListeningSessionDetail = z.infer<
  typeof listeningSessionDetailSchema
>["data"];

export type PageMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from?: number;
  to?: number;
};

export type LibraryStats = z.infer<typeof libraryStatsSchema>["data"];
export type DissertationOptions = Record<string, unknown>;
export type DissertationStats = Record<string, unknown>;

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number, options?: ErrorOptions) {
    super(message, options);
    this.name = "ApiError";
    this.status = status;
  }
}

function apiUrl(
  path: string,
  params?: Record<string, string | number | undefined>,
) {
  const url = new URL(
    `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`,
  );

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "")
      url.searchParams.set(key, String(value));
  });

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
    response = await fetch(apiUrl(path, options.params), {
      headers: { Accept: "application/json" },
      cache: "no-store",
      credentials: "include",
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw error;
    throw new ApiError("تعذّر الاتصال بخادم البيانات.", undefined, {
      cause: error,
    });
  }

  if (!response.ok) {
    throw new ApiError(
      response.status === 404
        ? "السجل المطلوب غير موجود."
        : "تعذّر تحميل البيانات من الخادم.",
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

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "API response validation failed",
        path,
        parsed.error.issues,
      );
    }
    throw new ApiError(
      "صيغة البيانات الواردة من الخادم غير متوافقة.",
      response.status,
      {
        cause: parsed.error,
      },
    );
  }

  return parsed.data;
}

export async function getLibraryBooks(
  params: { search?: string; page?: number; per_page?: number } = {},
  signal?: AbortSignal,
) {
  const result = await fetchAndParse("/library/books", rawPaginatorSchema, {
    params,
    signal,
  });

  return {
    data: result.data,
    meta: {
      currentPage: result.current_page,
      lastPage: result.last_page,
      perPage: result.per_page,
      total: result.total,
      from: result.from,
      to: result.to,
    } satisfies PageMeta,
  };
}

export function getListeningHome(signal?: AbortSignal) {
  return fetchAndParse("/listening/home", listeningHomeSchema, { signal });
}

export async function getListeningSeries(
  params: {
    search?: string;
    category?: string;
    page?: number;
    per_page?: number;
  } = {},
  signal?: AbortSignal,
) {
  const result = await fetchAndParse(
    "/listening/series",
    listeningPaginatorSchema,
    {
      params,
      signal,
    },
  );

  return {
    data: result.data,
    links: result.links,
    filterOptions: result.filter_options,
    stats: result.stats,
    meta: {
      currentPage: result.meta.current_page,
      lastPage: result.meta.last_page,
      perPage: result.meta.per_page,
      total: result.meta.total,
      from: result.meta.from,
      to: result.meta.to,
    } satisfies PageMeta,
  };
}

export async function getListeningSeriesDetail(
  slug: string,
  signal?: AbortSignal,
) {
  const result = await fetchAndParse(
    `/listening/series/${encodeURIComponent(slug)}`,
    listeningSeriesDetailSchema,
    { signal },
  );
  return result.data;
}

export async function getListeningSessionDetail(
  seriesSlug: string,
  sessionSlug: string,
  signal?: AbortSignal,
) {
  const result = await fetchAndParse(
    `/listening/series/${encodeURIComponent(seriesSlug)}/sessions/${encodeURIComponent(sessionSlug)}`,
    listeningSessionDetailSchema,
    { signal },
  );
  return result.data;
}

export async function getLibraryStats(signal?: AbortSignal) {
  const result = await fetchAndParse("/library/stats", libraryStatsSchema, {
    signal,
  });
  return result.data;
}

export async function getLibraryBook(idOrSlug: string, signal?: AbortSignal) {
  return fetchAndParse(
    `/library/books/${encodeURIComponent(idOrSlug)}`,
    bookDetailSchema,
    { signal },
  );
}

export async function getDissertations(
  params: {
    search?: string;
    year?: string;
    university?: string;
    specialization?: string;
    participation_type?: string;
    degree?: string;
    page?: number;
    per_page?: number;
  } = {},
  signal?: AbortSignal,
) {
  const result = await fetchAndParse(
    "/dissertations",
    dissertationPaginatorSchema,
    {
      params,
      signal,
    },
  );

  return {
    data: result.data,
    links: result.links,
    filterOptions: result.filter_options,
    stats: result.stats,
    meta: {
      currentPage: result.meta.current_page,
      lastPage: result.meta.last_page,
      perPage: result.meta.per_page,
      total: result.meta.total,
      from: result.meta.from,
      to: result.meta.to,
    } satisfies PageMeta,
  };
}

const recordEnvelopeSchema = z.union([
  z.object({ data: unknownRecordSchema }).transform((value) => value.data),
  unknownRecordSchema,
]);

export function getDissertationFilterOptions(signal?: AbortSignal) {
  return fetchAndParse("/dissertations/filter-options", recordEnvelopeSchema, {
    signal,
  });
}

export function getDissertationHome(signal?: AbortSignal) {
  return fetchAndParse("/dissertations/home", dissertationHomeSchema, {
    signal,
  });
}

export function getDissertationStats(signal?: AbortSignal) {
  return fetchAndParse("/dissertations/stats", recordEnvelopeSchema, {
    signal,
  });
}

export function getDissertation(idOrSlug: string, signal?: AbortSignal) {
  return fetchAndParse(
    `/dissertations/${encodeURIComponent(idOrSlug)}`,
    dissertationDetailSchema,
    { signal },
  );
}

export function resolveMediaUrl(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;

  const normalized = trimmed.replace(/^\/+/, "");
  if (normalized.startsWith("storage/"))
    return `${BACKEND_ORIGIN}/${normalized}`;
  return `${BACKEND_ORIGIN}/storage/${normalized}`;
}

function googleDrivePreview(url: string) {
  try {
    const parsed = new URL(url);
    if (!/(^|\.)drive\.google\.com$/i.test(parsed.hostname)) return null;

    const pathMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
    const id = pathMatch?.[1] || parsed.searchParams.get("id");
    return id ? `https://drive.google.com/file/d/${id}/preview` : url;
  } catch {
    return null;
  }
}

export type ReaderSource = {
  actionUrl: string;
  embedUrl: string | null;
  isGoogleDrive: boolean;
};

export function resolveReaderSource(source: {
  slug?: string | null;
  source_type?: string | null;
  has_file?: boolean;
  file_path?: string | null;
  file_url?: string | null;
  source_link?: string | null;
}): ReaderSource | null {
  const sourceType = source.source_type?.toLowerCase().trim() ?? "";
  const fileUrl =
    resolveMediaUrl(source.file_url) || resolveMediaUrl(source.file_path);
  const externalUrl = source.source_link?.trim() || null;
  const privateFileUrl =
    sourceType === "file" && source.slug && (source.has_file || fileUrl)
      ? `/api/dissertations/${encodeURIComponent(source.slug)}/read`
      : fileUrl;

  // Updates can leave the previous file_path in legacy records. The selected
  // source type is authoritative so a link/embed never reopens that stale file.
  const actionUrl =
    sourceType === "file"
      ? privateFileUrl
      : ["link", "external", "url", "source_link", "embed", "iframe"].includes(
            sourceType,
          )
        ? externalUrl
        : externalUrl || fileUrl;
  if (!actionUrl) return null;

  if (sourceType === "file") {
    return { actionUrl, embedUrl: actionUrl, isGoogleDrive: false };
  }

  const driveUrl = googleDrivePreview(actionUrl);
  if (driveUrl) {
    return { actionUrl, embedUrl: driveUrl, isGoogleDrive: true };
  }

  const explicitlyLinked = ["link", "external", "url", "source_link"].includes(
    sourceType,
  );
  const explicitlyEmbedded = ["embed", "iframe"].includes(sourceType);
  const looksEmbeddable = /\.pdf(?:$|[?#])/i.test(actionUrl);

  return {
    actionUrl,
    embedUrl:
      looksEmbeddable || (!explicitlyLinked && explicitlyEmbedded)
        ? actionUrl
        : null,
    isGoogleDrive: false,
  };
}

export function optionValues(
  options: DissertationOptions,
  ...keys: string[]
): string[] {
  for (const key of keys) {
    const raw = options[key];
    if (!Array.isArray(raw)) continue;

    const values = raw
      .map((item) => {
        if (typeof item === "string" || typeof item === "number")
          return String(item);
        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          const candidate =
            record.value ?? record.name ?? record.label ?? record.year;
          if (typeof candidate === "string" || typeof candidate === "number") {
            return String(candidate);
          }
        }
        return null;
      })
      .filter((item): item is string => Boolean(item));

    if (values.length) return Array.from(new Set(values));
  }
  return [];
}

export function statValue(stats: DissertationStats, ...keys: string[]) {
  for (const key of keys) {
    const raw = stats[key];
    const value =
      typeof raw === "number"
        ? raw
        : typeof raw === "string"
          ? Number(raw)
          : NaN;
    if (Number.isFinite(value)) return value;
  }
  return undefined;
}

export function apiErrorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "حدث خطأ غير متوقع أثناء تحميل البيانات.";
}
