import {
  SEARCH_MODULES,
  SEARCH_QUERY_MAX_LENGTH,
  SEARCH_QUERY_MIN_LENGTH,
  searchQueryLength,
  type SearchPreviewModule,
  type SearchResultsResponse,
} from "./searchContract.ts";

const PREVIEW_MODULES = [
  "library",
  "listening",
  "dissertations",
  "fatwas",
  "videos",
  "articles",
  "hadith_cards",
] as const satisfies readonly SearchPreviewModule[];

const PREVIEW_MODULE_SET = new Set<string>(PREVIEW_MODULES);
const RESULT_MODULE_SET = new Set<string>(SEARCH_MODULES);

function positiveInteger(value: string | null, fallback: number) {
  if (value === null || value === "") return fallback;
  if (!/^\d+$/u.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function approvedQuery(searchParams: URLSearchParams) {
  const query = searchParams.get("q")?.trim() ?? "";
  const length = searchQueryLength(query);
  return length >= SEARCH_QUERY_MIN_LENGTH &&
    length <= SEARCH_QUERY_MAX_LENGTH
    ? query
    : null;
}

function approvedCsv<T extends string>(
  raw: string | null,
  allowed: ReadonlySet<string>,
): T[] | null {
  if (raw === null || raw.trim() === "") return [];
  const parts = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.some((part) => !allowed.has(part))) return null;
  return Array.from(new Set(parts)) as T[];
}

export function approvedPreviewSearchQuery(searchParams: URLSearchParams) {
  const query = approvedQuery(searchParams);
  const limit = positiveInteger(searchParams.get("limit"), 4);
  const modules = approvedCsv<SearchPreviewModule>(
    searchParams.get("modules"),
    PREVIEW_MODULE_SET,
  );

  if (query === null || limit === null || limit > 10 || modules === null) {
    return null;
  }

  const approved = new URLSearchParams({ q: query, limit: String(limit) });
  if (modules.length) approved.set("modules", modules.join(","));
  return approved;
}

export function approvedResultsSearchQuery(searchParams: URLSearchParams) {
  const query = approvedQuery(searchParams);
  const page = positiveInteger(searchParams.get("page"), 1);
  const perPage = positiveInteger(searchParams.get("per_page"), 12);
  const modules = approvedCsv<SearchPreviewModule>(
    searchParams.get("module"),
    RESULT_MODULE_SET,
  );

  if (
    query === null ||
    page === null ||
    page > 100 ||
    perPage === null ||
    perPage < 6 ||
    perPage > 24 ||
    modules === null
  ) {
    return null;
  }

  const approved = new URLSearchParams({
    q: query,
    page: String(page),
    per_page: String(perPage),
  });
  if (modules.length) approved.set("module", modules.join(","));
  return approved;
}

export function safeSearchProxyStatus(status: number) {
  if (status === 404 || status === 422 || status === 429) return status;
  return 502;
}

function browserPagePath(
  response: SearchResultsResponse,
  page: number,
) {
  const query = new URLSearchParams({
    q: response.meta.query,
    page: String(page),
    per_page: String(response.meta.per_page),
  });
  if (response.meta.selected_modules.length) {
    query.set("module", response.meta.selected_modules.join(","));
  }
  return `/api/search/results?${query.toString()}`;
}

/** Removes the Laravel/backend origin from pagination infrastructure fields. */
export function browserSafeSearchResults(
  response: SearchResultsResponse,
): SearchResultsResponse {
  const { current_page: current, last_page: last } = response.meta;
  return {
    ...response,
    links: {
      first: browserPagePath(response, 1),
      last: browserPagePath(response, last),
      prev: current > 1 ? browserPagePath(response, current - 1) : null,
      next: current < last ? browserPagePath(response, current + 1) : null,
    },
    meta: {
      ...response.meta,
      path: "/api/search/results",
    },
  };
}
