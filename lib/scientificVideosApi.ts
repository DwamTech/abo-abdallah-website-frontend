import { z } from "zod";

const configuredBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:8000";
const backendBaseUrl = configuredBaseUrl.replace(/\/+$/, "");
export const SCIENTIFIC_VIDEOS_API_BASE_URL = backendBaseUrl.endsWith("/api")
  ? backendBaseUrl
  : `${backendBaseUrl}/api`;

const identifierSchema = z.union([z.string(), z.number()]).transform(String);
const nullableText = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => value ?? null);
const apiBoolean = z
  .union([
    z.boolean(),
    z.literal(0),
    z.literal(1),
    z.literal("0"),
    z.literal("1"),
  ])
  .transform((value) => value === true || value === 1 || value === "1");

export const scientificVideoCardSchema = z.object({
  id: identifierSchema,
  slug: z.string().trim().min(1),
  category: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string(),
  duration_minutes: z.coerce.number().int().positive(),
  duration_label: z.string().trim().min(1),
  date_label: z.string().trim().min(1),
  thumbnail_url: nullableText,
});

export type ScientificVideoCard = z.infer<typeof scientificVideoCardSchema>;

export const scientificVideoItemSchema = scientificVideoCardSchema.extend({
  source_type: z.enum(["file", "link", "embed"]),
  source_url: nullableText,
  watch_url: nullableText,
  embed_url: nullableText,
  download_allowed: apiBoolean.default(false),
  download_url: nullableText,
});

export type ScientificVideoItem = z.infer<typeof scientificVideoItemSchema>;

const pageLinksSchema = z.object({
  first: nullableText,
  last: nullableText,
  prev: nullableText,
  next: nullableText,
});

const pageMetaSchema = z.object({
  current_page: z.coerce.number().int().positive(),
  last_page: z.coerce.number().int().positive(),
  per_page: z.coerce.number().int().positive(),
  total: z.coerce.number().int().nonnegative(),
  from: z.coerce.number().int().positive().nullable(),
  to: z.coerce.number().int().positive().nullable(),
});

const statsSchema = z.object({
  items_count: z.coerce.number().int().nonnegative(),
  categories_count: z.coerce.number().int().nonnegative(),
});

const homeSchema = z.object({
  data: z.array(scientificVideoCardSchema).max(6),
  stats: statsSchema,
});

const pageSchema = z.object({
  data: z.array(scientificVideoCardSchema),
  links: pageLinksSchema,
  meta: pageMetaSchema,
  filter_options: z.object({ categories: z.array(z.string()).default([]) }),
  stats: statsSchema,
});

const detailSchema = z.object({
  data: z.object({
    item: scientificVideoItemSchema,
    related_items: z.array(scientificVideoCardSchema).max(3).default([]),
  }),
});

export type ScientificVideosPage = z.infer<typeof pageSchema>;
export type ScientificVideoDetail = z.infer<typeof detailSchema>["data"];

export class ScientificVideosApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number, options?: ErrorOptions) {
    super(message, options);
    this.name = "ScientificVideosApiError";
    this.status = status;
  }
}

async function fetchAndValidate<T>(
  path: string,
  schema: z.ZodType<T>,
  options: {
    params?: Record<string, string | number | undefined>;
    signal?: AbortSignal;
  } = {},
): Promise<T> {
  const url = new URL(`${SCIENTIFIC_VIDEOS_API_BASE_URL}${path}`);
  Object.entries(options.params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "")
      url.searchParams.set(key, String(value));
  });

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw error;
    throw new ScientificVideosApiError(
      "تعذّر الاتصال بخادم المرئيات.",
      undefined,
      {
        cause: error,
      },
    );
  }

  if (!response.ok) {
    throw new ScientificVideosApiError(
      response.status === 404
        ? "المادة المرئية المطلوبة غير موجودة."
        : "تعذّر تحميل المرئيات من الخادم.",
      response.status,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    throw new ScientificVideosApiError(
      "أعاد الخادم استجابة غير صالحة.",
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
        "Scientific videos API validation failed",
        path,
        parsed.error.issues,
      );
    }
    throw new ScientificVideosApiError(
      "صيغة بيانات المرئيات غير متوافقة.",
      response.status,
      {
        cause: parsed.error,
      },
    );
  }

  return parsed.data;
}

export function getScientificVideosHome(signal?: AbortSignal) {
  return fetchAndValidate("/scientific-videos/home", homeSchema, { signal });
}

export function getScientificVideos(
  params: {
    search?: string;
    category?: string;
    page?: number;
    per_page?: number;
  } = {},
  signal?: AbortSignal,
) {
  return fetchAndValidate("/scientific-videos/items", pageSchema, {
    params,
    signal,
  });
}

export async function getScientificVideoDetail(
  slug: string,
  signal?: AbortSignal,
) {
  const result = await fetchAndValidate(
    `/scientific-videos/items/${encodeURIComponent(slug)}`,
    detailSchema,
    { signal },
  );
  return result.data;
}

export function scientificVideosErrorMessage(error: unknown) {
  return error instanceof ScientificVideosApiError
    ? error.message
    : "حدث خطأ غير متوقع أثناء تحميل المرئيات.";
}

type VideoPlayback =
  | { kind: "video"; url: string }
  | { kind: "embed"; url: string }
  | { kind: "external"; url: string }
  | { kind: "none"; url: null };

function safePlaybackUrl(value?: string | null): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? parsed.toString()
      : null;
  } catch {
    return null;
  }
}

function knownEmbedUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, "").toLowerCase();
    if (hostname === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id
        ? `https://www.youtube.com/embed/${encodeURIComponent(id)}`
        : null;
    }
    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      const id =
        url.searchParams.get("v") ||
        url.pathname.match(/\/(?:embed|shorts)\/([^/]+)/)?.[1];
      return id
        ? `https://www.youtube.com/embed/${encodeURIComponent(id)}`
        : null;
    }
    if (hostname === "vimeo.com") {
      const id = url.pathname
        .split("/")
        .filter(Boolean)
        .find((part) => /^\d+$/.test(part));
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    if (hostname === "drive.google.com") {
      const id =
        url.pathname.match(/\/file\/d\/([^/]+)/)?.[1] ||
        url.searchParams.get("id");
      return id
        ? `https://drive.google.com/file/d/${encodeURIComponent(id)}/preview`
        : null;
    }
  } catch {
    return null;
  }
  return null;
}

export function resolveScientificVideoPlayback(
  item: Pick<
    ScientificVideoItem,
    "source_type" | "source_url" | "watch_url" | "embed_url"
  >,
): VideoPlayback {
  const preferred =
    safePlaybackUrl(item.watch_url) || safePlaybackUrl(item.source_url);
  if (!preferred) return { kind: "none", url: null };
  if (item.source_type === "file") return { kind: "video", url: preferred };

  const explicitEmbed = safePlaybackUrl(item.embed_url);
  const platformEmbed = knownEmbedUrl(explicitEmbed || preferred);
  if (platformEmbed) return { kind: "embed", url: platformEmbed };
  if (item.source_type === "embed")
    return { kind: "embed", url: explicitEmbed || preferred };
  if (/\.(?:mp4|m4v|webm|ogv|mov)(?:$|[?#])/i.test(preferred)) {
    return { kind: "video", url: preferred };
  }
  return { kind: "external", url: preferred };
}
