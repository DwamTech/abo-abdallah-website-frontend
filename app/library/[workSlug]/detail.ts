import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ApiError } from "@/lib/api";
import { getScientificLibraryItem } from "@/lib/scientificLibraryApi";

export const loadBook = cache(async (identifier: string) => {
  try {
    return await getScientificLibraryItem(identifier, { cookie: (await cookies()).toString() });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
});
