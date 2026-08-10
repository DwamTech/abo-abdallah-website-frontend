import { z } from "zod";

import { API_BASE_URL, ApiError } from "@/lib/api";
import {
  scientificFatwaOptionsResponseSchema,
  type ScientificFatwaCategoryOption,
  type ScientificFatwaOptions,
} from "@/lib/scientificFatwaOptions";

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

export const scientificFatwaItemSchema = z.object({
  id: z.union([z.number(), z.string()]),
  slug: z.string().min(1),
  title: z.string().min(1),
  category: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
  date_label: z.string().min(1),
  sources: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  is_featured: apiBoolean,
  published_at: z.string().nullable().optional(),
  views_count: viewCount,
});

export type ScientificFatwaItem = z.infer<typeof scientificFatwaItemSchema>;

export const scientificFatwaCardSchema = z.object({
  id: z.union([z.number(), z.string()]),
  slug: z.string().min(1),
  title: z.string().min(1),
  category: z.string().min(1),
  question_excerpt: z.string(),
  answer_excerpt: z.string(),
  date_label: z.string().min(1),
  sources_count: apiNumber,
  is_featured: apiBoolean,
  published_at: z.string().nullable().optional(),
  views_count: viewCount,
});

export type ScientificFatwaCard = z.infer<typeof scientificFatwaCardSchema>;

const statsSchema = z.object({
  published_items: apiNumber,
  categories: apiNumber,
});

const homeSchema = z.object({
  data: z.object({
    featured: scientificFatwaCardSchema.nullable(),
    categories: z.array(z.string()).max(6),
    stats: statsSchema,
  }),
});

const linkSchema = z.string().nullable();
const indexSchema = z.object({
  data: z.array(scientificFatwaCardSchema),
  links: z.object({
    first: linkSchema,
    last: linkSchema,
    prev: linkSchema,
    next: linkSchema,
  }),
  meta: z.object({
    current_page: apiNumber,
    last_page: apiNumber,
    per_page: apiNumber,
    total: apiNumber,
    from: nullableApiNumber,
    to: nullableApiNumber,
  }),
  stats: statsSchema,
});

const detailSchema = z.object({
  data: scientificFatwaItemSchema,
  related: z.array(scientificFatwaCardSchema).max(3),
});

export const scientificFatwaQuestionSchema = z.strictObject({
  name: z.string().trim().min(3).max(150),
  email: z.email().max(190),
  category_id: z.string().trim().regex(/^[1-9]\d*$/).max(20),
  title: z.string().trim().min(3).max(255),
  question: z.string().trim().min(20).max(9500),
  consent: z.literal(true),
});

export type ScientificFatwaQuestion = z.infer<
  typeof scientificFatwaQuestionSchema
>;

export const scientificFatwaSubmissionResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({
    reference_number: z.string(),
    status: z.string(),
    status_label: z.string(),
  }),
});

export type ScientificFatwaHome = z.infer<typeof homeSchema>["data"];
export type ScientificFatwaIndex = z.infer<typeof indexSchema>;
export type ScientificFatwaDetail = z.infer<typeof detailSchema>;
export type { ScientificFatwaCategoryOption, ScientificFatwaOptions };

function apiUrl(
  path: string,
  params?: Record<string, string | number | undefined>,
) {
  const url = new URL(
    `${API_BASE_URL}/scientific-fatwas${path.startsWith("/") ? path : `/${path}`}`,
  );
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
  } = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(apiUrl(path, options.params), {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw error;
    throw new ApiError(
      "تعذّر الاتصال بخدمة الفتاوى والمسائل الحديثية.",
      undefined,
      { cause: error },
    );
  }
  if (!response.ok) {
    throw new ApiError(
      response.status === 404
        ? "المسألة المطلوبة غير موجودة."
        : "تعذّر تحميل بيانات الفتاوى.",
      response.status,
    );
  }
  const payload: unknown = await response.json().catch(() => null);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    if (process.env.NODE_ENV !== "production")
      console.error(
        "Scientific fatwa API validation failed",
        path,
        parsed.error.issues,
      );
    throw new ApiError("صيغة بيانات الفتاوى غير متوافقة.", response.status, {
      cause: parsed.error,
    });
  }
  return parsed.data;
}

export async function getScientificFatwaHome(signal?: AbortSignal) {
  const result = await fetchAndParse("/home", homeSchema, { signal });
  return result.data;
}

export function getScientificFatwaItems(
  params: {
    search?: string;
    category?: string;
    page?: number;
    per_page?: number;
  } = {},
  signal?: AbortSignal,
) {
  return fetchAndParse("/items", indexSchema, { params, signal });
}

export async function getScientificFatwaOptions(
  signal?: AbortSignal,
): Promise<ScientificFatwaOptions> {
  const result = await fetchAndParse(
    "/options",
    scientificFatwaOptionsResponseSchema,
    { signal },
  );

  return result.data;
}

export function getScientificFatwaItem(slug: string, signal?: AbortSignal) {
  return fetchAndParse(`/items/${encodeURIComponent(slug)}`, detailSchema, {
    signal,
  });
}

export async function submitScientificFatwaQuestion(
  values: ScientificFatwaQuestion,
): Promise<z.infer<typeof scientificFatwaSubmissionResponseSchema>> {
  const parsed = scientificFatwaQuestionSchema.safeParse(values);
  if (!parsed.success)
    throw new ApiError("راجع بيانات السؤال قبل الإرسال.", 422);
  const response = await fetch("/api/scientific-fatwas/questions", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
    cache: "no-store",
    credentials: "same-origin",
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      response.status === 429
        ? "تم إرسال عدد كبير من الأسئلة. حاول مرة أخرى لاحقًا."
        : response.status === 422
          ? "راجع بيانات السؤال قبل الإرسال."
          : "تعذّر إرسال السؤال الآن.",
      response.status,
    );
  }
  const result = scientificFatwaSubmissionResponseSchema.safeParse(payload);
  if (!result.success)
    throw new ApiError("أعاد الخادم استجابة غير متوافقة.", response.status);
  return result.data;
}
