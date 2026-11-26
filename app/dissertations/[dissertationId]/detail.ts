import { notFound } from "next/navigation";
import { cache } from "react";
import { ApiError, getDissertation } from "@/lib/api";

export const loadDissertation = cache(async (identifier: string) => {
  try {
    return await getDissertation(identifier);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
});
