import { notFound } from "next/navigation";
import { cache } from "react";
import { ApiError, getListeningSeriesDetail } from "@/lib/api";

export const loadSeries = cache(async (identifier: string) => {
  try {
    return await getListeningSeriesDetail(identifier);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
});
