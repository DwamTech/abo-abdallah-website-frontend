import { API_BASE_URL } from "@/lib/api";
import {
  siteStatisticsResponseSchema,
  type SiteStatistic,
} from "@/lib/siteStatisticsContract";

const SITE_STATISTICS_REVALIDATE_SECONDS = 300;
const SITE_STATISTICS_TIMEOUT_MS = 5_000;

export async function getSiteStatistics(): Promise<SiteStatistic[]> {
  const response = await fetch(`${API_BASE_URL}/site/statistics`, {
    headers: { Accept: "application/json" },
    next: { revalidate: SITE_STATISTICS_REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(SITE_STATISTICS_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Site statistics request failed with status ${response.status}.`);
  }

  const parsed = siteStatisticsResponseSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error("Site statistics response validation failed.", { cause: parsed.error });
  }

  return parsed.data.data;
}

export async function getSiteStatisticsOrEmpty(): Promise<SiteStatistic[]> {
  try {
    return await getSiteStatistics();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Site statistics are unavailable; rendering without the statistics ticker.", error);
    }
    return [];
  }
}
