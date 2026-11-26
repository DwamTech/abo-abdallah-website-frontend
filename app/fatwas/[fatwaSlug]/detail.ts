import { notFound } from "next/navigation";
import { cache } from "react";
import { ApiError } from "@/lib/api";
import { getScientificFatwaItem } from "@/lib/scientificFatwaApi";

export const loadFatwa = cache(async (identifier: string) => {
  try {
    return await getScientificFatwaItem(identifier);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
});
