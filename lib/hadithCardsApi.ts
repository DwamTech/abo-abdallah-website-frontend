import { z } from "zod";

import { API_BASE_URL, BACKEND_ORIGIN, ApiError } from "@/lib/api";

const identifierSchema = z.union([z.string(), z.number()]).transform(String);
const nonNegativeInteger = z.coerce.number().int().nonnegative().catch(0);
const positiveInteger = z.coerce.number().int().positive().catch(1);
const nullableText = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (typeof value !== "string") return null;
    const normalized = value.trim();
    return normalized || null;
  });

export const hadithCardSchema = z.object({
  id: identifierSchema,
  slug: z.string().trim().min(1),
  title: nullableText,
  // Older seeded records predate the optional alt-text input in the dashboard.
  // A safe fallback keeps one incomplete gallery card from hiding its project.
  alt_text: nullableText.transform((value) => value ?? "بطاقة حديثية"),
  image_url: nullableText,
  sort_order: nonNegativeInteger,
  views_count: nonNegativeInteger,
}).passthrough();

export type HadithCard = z.infer<typeof hadithCardSchema>;

export const hadithCardProjectSchema = z.object({
  id: identifierSchema,
  slug: z.string().trim().min(1),
  title: z.string().trim().min(1),
  eyebrow: nullableText,
  description: nullableText,
  accent: z.enum(["brown", "blue"]).catch("brown"),
  sort_order: nonNegativeInteger,
  cards_count: nonNegativeInteger,
  /** A dedicated portrait image for the project; cards remain its gallery. */
  cover_image_url: nullableText,
  cover_alt_text: nullableText,
  cover_card: hadithCardSchema
    .nullable()
    .optional()
    .transform((value) => value ?? null),
  /**
   * The compact public response contains at most three gallery cards. The
   * legacy endpoint may still send every card through `cards`, so both fields
   * are deliberately supported during the additive migration.
   */
  gallery_preview: z.array(hadithCardSchema).optional().default([]),
  gallery_count: nonNegativeInteger.optional(),
  gallery_has_more: z
    .union([z.boolean(), z.literal(0), z.literal(1), z.literal("0"), z.literal("1")])
    .optional()
    .transform((value) => value === true || value === 1 || value === "1"),
  cards: z.array(hadithCardSchema).optional().default([]),
  views_count: nonNegativeInteger,
}).passthrough();

export type HadithCardProject = z.infer<typeof hadithCardProjectSchema>;

const hadithCardsStatsSchema = z.object({
  projects_count: nonNegativeInteger,
  cards_count: nonNegativeInteger,
});

const hadithCardsHomeSchema = z.object({
  data: z.array(hadithCardProjectSchema).max(2),
  stats: hadithCardsStatsSchema,
});

const hadithCardsProjectsSchema = z.object({
  data: z.array(hadithCardProjectSchema),
  stats: hadithCardsStatsSchema,
});

export type HadithCardsHome = z.infer<typeof hadithCardsHomeSchema>;
export type HadithCardsProjects = z.infer<typeof hadithCardsProjectsSchema>;

const hadithCardsGalleryMetaSchema = z
  .object({
    current_page: positiveInteger,
    last_page: positiveInteger,
    total: nonNegativeInteger,
    per_page: positiveInteger,
  })
  .partial()
  .passthrough();

/** The same paginator shape returned by Laravel's public gallery endpoint. */
export const hadithCardsGalleryPageSchema = z
  .object({
    data: z.array(hadithCardSchema),
    meta: hadithCardsGalleryMetaSchema.optional(),
  })
  .passthrough();

export type HadithCardsGalleryPage = z.infer<typeof hadithCardsGalleryPageSchema>;

// The modal batches images in sensible pages after showing the three-image
// preview immediately, avoiding hundreds of requests for a large project.
export const HADITH_CARDS_GALLERY_PAGE_SIZE = 24;

export class HadithCardsApiError extends ApiError {
  constructor(message: string, status?: number, options?: ErrorOptions) {
    super(message, status, options);
    this.name = "HadithCardsApiError";
  }
}

function hadithCardsApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(`${API_BASE_URL}/hadith-cards${normalizedPath}`).toString();
}

async function fetchAndValidate<T>(
  path: string,
  schema: z.ZodType<T>,
  signal?: AbortSignal,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(hadithCardsApiUrl(path), {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new HadithCardsApiError(
      "تعذّر الاتصال بخادم البطاقات الحديثية.",
      undefined,
      { cause: error },
    );
  }

  if (!response.ok) {
    throw new HadithCardsApiError(
      response.status === 404
        ? "مشروع البطاقات المطلوب غير موجود."
        : "تعذّر تحميل البطاقات الحديثية من الخادم.",
      response.status,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    throw new HadithCardsApiError(
      "أعاد خادم البطاقات الحديثية استجابة غير صالحة.",
      response.status,
      { cause: error },
    );
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "Hadith cards API validation failed",
        path,
        parsed.error.issues,
      );
    }

    throw new HadithCardsApiError(
      "صيغة بيانات البطاقات الحديثية غير متوافقة.",
      response.status,
      { cause: parsed.error },
    );
  }

  return parsed.data;
}

/** Returns the two featured projects needed by the home-page composition. */
export function getHadithCardsHome(signal?: AbortSignal) {
  return fetchAndValidate("/home", hadithCardsHomeSchema, signal);
}

/**
 * Returns published projects with a compact gallery preview. Older backends
 * simply ignore `gallery=preview` and keep returning `cards`, which remains a
 * supported fallback while deployments catch up.
 */
export function getHadithCardsProjects(signal?: AbortSignal) {
  return fetchAndValidate("/projects?gallery=preview", hadithCardsProjectsSchema, signal);
}

/**
 * Reads another gallery page through the public site's same-origin BFF.
 * The page itself always remains useful with its initial preview/cards when
 * this optional progressive enhancement is temporarily unavailable.
 */
export async function getHadithCardsProjectGalleryPage(
  slug: string,
  page: number,
  signal?: AbortSignal,
): Promise<HadithCardsGalleryPage> {
  const normalizedPage = Number.isInteger(page) && page > 0 ? page : 1;
  const query = new URLSearchParams({
    page: String(normalizedPage),
    per_page: String(HADITH_CARDS_GALLERY_PAGE_SIZE),
  });

  let response: Response;
  try {
    response = await fetch(
      `/api/hadith-cards/projects/${encodeURIComponent(slug)}/gallery?${query}`,
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal,
      },
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new HadithCardsApiError(
      "تعذّر تحميل المزيد من بطاقات المشروع.",
      undefined,
      { cause: error },
    );
  }

  if (!response.ok) {
    throw new HadithCardsApiError(
      response.status === 404
        ? "تعذّر العثور على معرض هذا المشروع."
        : "تعذّر تحميل المزيد من بطاقات المشروع.",
      response.status,
    );
  }

  const payload: unknown = await response.json().catch(() => null);
  const parsed = hadithCardsGalleryPageSchema.safeParse(payload);
  if (!parsed.success) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Hadith cards gallery validation failed", parsed.error.issues);
    }

    throw new HadithCardsApiError(
      "صيغة معرض البطاقات الحديثية غير متوافقة.",
      response.status,
      { cause: parsed.error },
    );
  }

  return parsed.data;
}

/**
 * The seed intentionally keeps the current public-site images under /media.
 * Dashboard uploads, on the other hand, are returned by Laravel as /storage.
 * This resolver supports both shapes without requiring a remote next/image host.
 */
export function resolveHadithCardImageUrl(value?: string | null) {
  if (!value) return null;

  const normalized = value.trim();
  if (!normalized) return null;
  if (/^(?:https?:|data:|blob:)/i.test(normalized)) return normalized;
  if (normalized.startsWith("/media/")) return normalized;
  if (normalized.startsWith("/")) return `${BACKEND_ORIGIN}${normalized}`;
  if (normalized.startsWith("storage/")) return `${BACKEND_ORIGIN}/${normalized}`;

  return `${BACKEND_ORIGIN}/storage/${normalized.replace(/^\/+/, "")}`;
}

export function hadithCardsErrorMessage(error: unknown) {
  return error instanceof HadithCardsApiError
    ? error.message
    : "حدث خطأ غير متوقع أثناء تحميل البطاقات الحديثية.";
}
