import { z } from "zod";

export const SEARCH_QUERY_MIN_LENGTH = 2;
export const SEARCH_QUERY_MAX_LENGTH = 160;

export function searchQueryLength(value: string) {
  return Array.from(value).length;
}

export function boundSearchQuery(value: string) {
  return Array.from(value).slice(0, SEARCH_QUERY_MAX_LENGTH).join("");
}

// Stable public keys deliberately avoid framework model class names.
export const SEARCH_RESULT_TYPES = [
  "site_article",
  "scientific_library_item",
  "dissertation",
  "listening_series",
  "listening_session",
  "scientific_fatwa",
  "scientific_video",
  "hadith_card_project",
] as const;

export type SearchResultType = (typeof SEARCH_RESULT_TYPES)[number];
export const searchResultTypeSchema = z.enum(SEARCH_RESULT_TYPES);

export const SEARCH_MODULES = [
  "articles",
  "library",
  "dissertations",
  "listening",
  "fatwas",
  "videos",
  "hadith_cards",
] as const;

export type SearchModule = (typeof SEARCH_MODULES)[number];
export type SearchPreviewModule = SearchModule;
export const searchModuleSchema = z.enum(SEARCH_MODULES);

const MAX_PUBLIC_PATH_LENGTH = 8_192;

const ROUTE_SEGMENT = "[^/?#\\\\]+";
const RESULT_PATHS: Record<SearchResultType, RegExp> = {
  site_article: new RegExp(`^/articles/${ROUTE_SEGMENT}/?$`, "u"),
  scientific_library_item: new RegExp(`^/library/${ROUTE_SEGMENT}/?$`, "u"),
  dissertation: new RegExp(`^/dissertations/${ROUTE_SEGMENT}/?$`, "u"),
  listening_series: new RegExp(`^/listening/${ROUTE_SEGMENT}/?$`, "u"),
  listening_session: new RegExp(
    `^/listening/${ROUTE_SEGMENT}/${ROUTE_SEGMENT}/?$`,
    "u",
  ),
  scientific_fatwa: new RegExp(`^/fatwas/${ROUTE_SEGMENT}/?$`, "u"),
  scientific_video: new RegExp(`^/videos/${ROUTE_SEGMENT}/?$`, "u"),
  hadith_card_project: new RegExp(`^/hadith-cards#[^/?#\\\\]+$`, "u"),
};

const PREVIEW_TYPE_TO_RESULT_TYPE: Record<string, SearchResultType> = {
  article: "site_article",
  site_article: "site_article",
  library: "scientific_library_item",
  scientific_library_item: "scientific_library_item",
  dissertation: "dissertation",
  listening: "listening_series",
  listening_series: "listening_series",
  listening_session: "listening_session",
  fatwa: "scientific_fatwa",
  scientific_fatwa: "scientific_fatwa",
  video: "scientific_video",
  scientific_video: "scientific_video",
  hadith_card_project: "hadith_card_project",
};

const RESULT_TYPE_MODULE: Record<SearchResultType, SearchModule> = {
  site_article: "articles",
  scientific_library_item: "library",
  dissertation: "dissertations",
  listening_series: "listening",
  listening_session: "listening",
  scientific_fatwa: "fatwas",
  scientific_video: "videos",
  hadith_card_project: "hadith_cards",
};

function hasUnsafeEncodedOctet(path: string) {
  return /%(?:0[0-9a-f]|1[0-9a-f]|7f|2f|5c)/i.test(path);
}

/** Keeps every result link same-origin and inside its expected detail route. */
export function isSafeSearchResultPath(
  type: SearchResultType,
  path: string,
) {
  if (
    path.length > MAX_PUBLIC_PATH_LENGTH ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("?") ||
    (type !== "hadith_card_project" && path.includes("#")) ||
    path.includes("\\") ||
    /[\u0000-\u001f\u007f]/u.test(path) ||
    hasUnsafeEncodedOctet(path)
  ) {
    return false;
  }

  const segments = path.split("/").filter(Boolean);
  if (segments.some((segment) => segment === "." || segment === "..")) {
    return false;
  }
  return RESULT_PATHS[type].test(path);
}

function isSafeModulePath(path: string) {
  if (
    path.length > MAX_PUBLIC_PATH_LENGTH ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\") ||
    /[\u0000-\u001f\u007f]/u.test(path)
  ) {
    return false;
  }

  try {
    const url = new URL(path, "https://search.invalid");
    return (
      url.origin === "https://search.invalid" &&
      [
        "/articles",
        "/library",
        "/dissertations",
        "/listening",
        "/fatwas",
        "/videos",
        "/hadith-cards",
      ].includes(url.pathname.replace(/\/$/, ""))
    );
  } catch {
    return false;
  }
}

export const searchResultItemSchema = z
  .object({
    id: z.union([z.number().int().nonnegative(), z.string().min(1).max(255)]),
    slug: z.string().min(1).max(255),
    title: z.string().trim().min(1).max(600),
    description: z.string().nullable().transform((value) => value ?? ""),
    type: z.string().min(1).max(80),
    url: z.string().min(1).max(MAX_PUBLIC_PATH_LENGTH),
    meta: z.record(z.string(), z.unknown()).optional().default({}),
  })
  .superRefine((item, context) => {
    const resultType = PREVIEW_TYPE_TO_RESULT_TYPE[item.type];
    if (!resultType || !isSafeSearchResultPath(resultType, item.url)) {
      context.addIssue({
        code: "custom",
        path: ["url"],
        message: "Unsafe public search result path",
      });
    }
  });

export const searchModuleResultSchema = z.object({
  label: z.string().trim().min(1).max(160),
  items: z.array(searchResultItemSchema),
  total: z.coerce.number().int().nonnegative(),
  more_url: z
    .string()
    .min(1)
    .max(MAX_PUBLIC_PATH_LENGTH)
    .refine(isSafeModulePath, "Unsafe search module path"),
});

export const searchResponseSchema = z.object({
  query: z.string(),
  results: z.partialRecord(searchModuleSchema, searchModuleResultSchema),
  total_results: z.coerce.number().int().nonnegative(),
});

const availableModuleSchema = z.object({
  value: searchModuleSchema,
  label: z.string().trim().min(1).max(160),
  count: z.coerce.number().int().nonnegative(),
});

export const searchPageResultSchema = z
  .object({
    module: searchModuleSchema,
    module_label: z.string().trim().min(1).max(160),
    type: searchResultTypeSchema,
    type_label: z.string().trim().min(1).max(160),
    id: z.union([z.number().int().nonnegative(), z.string().min(1).max(255)]),
    slug: z.string().min(1).max(255),
    title: z.string().trim().min(1).max(600),
    excerpt: z.string().nullable().transform((value) => value ?? ""),
    public_path: z.string().min(1).max(MAX_PUBLIC_PATH_LENGTH),
    published_at: z.string().nullable(),
    metadata: z.record(z.string(), z.unknown()).optional().default({}),
  })
  .superRefine((item, context) => {
    if (RESULT_TYPE_MODULE[item.type] !== item.module) {
      context.addIssue({
        code: "custom",
        path: ["module"],
        message: "Search result type does not belong to its module",
      });
    }
    if (!isSafeSearchResultPath(item.type, item.public_path)) {
      context.addIssue({
        code: "custom",
        path: ["public_path"],
        message: "Unsafe public search result path",
      });
    }
  });

export const searchResultsResponseSchema = z.object({
  data: z.array(searchPageResultSchema),
  links: z.object({
    first: z.string().nullable(),
    last: z.string().nullable(),
    prev: z.string().nullable(),
    next: z.string().nullable(),
  }),
  meta: z.object({
    current_page: z.coerce.number().int().positive(),
    from: z.coerce.number().int().nonnegative().nullable(),
    last_page: z.coerce.number().int().positive(),
    path: z.string(),
    per_page: z.coerce.number().int().min(6).max(24),
    to: z.coerce.number().int().nonnegative().nullable(),
    total: z.coerce.number().int().nonnegative(),
    query: z.string(),
    selected_modules: z.array(searchModuleSchema),
    available_modules: z.array(availableModuleSchema),
  }),
});

export type SearchResultItem = z.infer<typeof searchResultItemSchema>;
export type SearchModuleResult = z.infer<typeof searchModuleResultSchema>;
export type SearchResponse = z.infer<typeof searchResponseSchema>;
export type SearchPageResult = z.infer<typeof searchPageResultSchema>;
export type SearchResultsResponse = z.infer<
  typeof searchResultsResponseSchema
>;

export function parseSearchModules(value: string | null) {
  if (!value) return [];
  const requested = new Set(value.split(",").map((part) => part.trim()));
  return SEARCH_MODULES.filter((module) => requested.has(module));
}

export const SEARCH_MODULE_ORDER = [
  "library",
  "listening",
  "fatwas",
  "dissertations",
  "videos",
  "articles",
  "hadith_cards",
] as const satisfies readonly SearchPreviewModule[];
