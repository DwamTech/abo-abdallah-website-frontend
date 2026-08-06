import { API_BASE_URL } from "@/lib/api";
import {
  newsTickerResponseSchema,
  type NewsTickerItem,
} from "@/lib/newsTickerContract";

const NEWS_TICKER_REVALIDATE_SECONDS = 60;
const NEWS_TICKER_TIMEOUT_MS = 5_000;

export class NewsTickerApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number, options?: ErrorOptions) {
    super(message, options);
    this.name = "NewsTickerApiError";
    this.status = status;
  }
}

export async function getNewsTicker(): Promise<NewsTickerItem[]> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/site/news-ticker`, {
      headers: { Accept: "application/json" },
      next: { revalidate: NEWS_TICKER_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(NEWS_TICKER_TIMEOUT_MS),
    });
  } catch (error) {
    throw new NewsTickerApiError(
      "تعذّر الاتصال بخدمة جديد الموقع.",
      undefined,
      { cause: error },
    );
  }

  if (!response.ok) {
    throw new NewsTickerApiError(
      "تعذّر تحميل محتوى جديد الموقع.",
      response.status,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    throw new NewsTickerApiError(
      "أعادت خدمة جديد الموقع استجابة غير صالحة.",
      response.status,
      { cause: error },
    );
  }

  const parsed = newsTickerResponseSchema.safeParse(payload);
  if (!parsed.success) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "News ticker API response validation failed",
        parsed.error.issues,
      );
    }
    throw new NewsTickerApiError(
      "صيغة بيانات جديد الموقع غير متوافقة.",
      response.status,
      { cause: parsed.error },
    );
  }

  return parsed.data.data;
}

/**
 * Layout rendering must never depend on the availability of an optional
 * aggregate endpoint. An empty result intentionally hides the ticker while
 * leaving the rest of the page intact.
 */
export async function getNewsTickerOrEmpty(): Promise<NewsTickerItem[]> {
  try {
    return await getNewsTicker();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("News ticker is unavailable; rendering without it.", error);
    }
    return [];
  }
}
