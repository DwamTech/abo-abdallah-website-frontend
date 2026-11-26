import { notFound } from "next/navigation";
import { cache } from "react";
import { ApiError } from "@/lib/api";
import { getSiteArticle } from "@/lib/siteArticlesApi";

export const getArticleDetail = cache(async (identifier: string) => {
  try {
    return await getSiteArticle(identifier);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
});
