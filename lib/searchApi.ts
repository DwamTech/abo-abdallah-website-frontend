import { z } from "zod";
import {
  searchResponseSchema,
  searchResultsResponseSchema,
  type SearchModule,
  type SearchPreviewModule,
} from "@/lib/searchContract";

export * from "@/lib/searchContract";

class SearchApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "SearchApiError";
  }
}

export type SearchParams = {
  q: string;
  limit?: number;
  modules?: SearchPreviewModule[];
};

export type SearchResultsParams = {
  q: string;
  page?: number;
  perPage?: number;
  modules?: SearchModule[];
};

function previewSearchPath(params: SearchParams) {
  const search = new URLSearchParams({ q: params.q });
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.modules?.length) search.set("modules", params.modules.join(","));
  return `/api/search?${search.toString()}`;
}

function resultsSearchPath(params: SearchResultsParams) {
  const search = new URLSearchParams({ q: params.q });
  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.perPage !== undefined) {
    search.set("per_page", String(params.perPage));
  }
  if (params.modules?.length) {
    search.set("module", params.modules.join(","));
  }
  return `/api/search/results?${search.toString()}`;
}

async function fetchSearchPayload<T>(
  path: string,
  schema: z.ZodType<T>,
  signal?: AbortSignal,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new SearchApiError("تعذّر الاتصال بخادم البحث.", undefined, {
      cause: error,
    });
  }

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    const upstreamMessage =
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : null;
    throw new SearchApiError(
      upstreamMessage ||
        (response.status === 422
          ? "أدخل كلمة بحث أطول."
          : "تعذّر تنفيذ البحث. حاول مرة أخرى."),
      response.status,
    );
  }

  const payload: unknown = await response.json().catch(() => null);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Search API validation failed", parsed.error.issues);
    }
    throw new SearchApiError("صيغة نتائج البحث غير متوافقة.", response.status, {
      cause: parsed.error,
    });
  }
  return parsed.data;
}

export function globalSearch(params: SearchParams, signal?: AbortSignal) {
  return fetchSearchPayload(
    previewSearchPath(params),
    searchResponseSchema,
    signal,
  );
}

export function getSearchResults(
  params: SearchResultsParams,
  signal?: AbortSignal,
) {
  return fetchSearchPayload(
    resultsSearchPath(params),
    searchResultsResponseSchema,
    signal,
  );
}
