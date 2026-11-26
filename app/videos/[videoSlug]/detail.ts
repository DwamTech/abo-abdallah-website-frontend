import { notFound } from "next/navigation";
import { cache } from "react";
import { ScientificVideosApiError, getScientificVideoDetail } from "@/lib/scientificVideosApi";

export const loadVideo = cache(async (identifier: string) => {
  try {
    return await getScientificVideoDetail(identifier);
  } catch (error) {
    if (error instanceof ScientificVideosApiError && error.status === 404) notFound();
    throw error;
  }
});
