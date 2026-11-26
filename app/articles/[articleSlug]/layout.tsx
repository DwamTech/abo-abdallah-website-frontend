import type { ReactNode } from "react";
import { getArticleDetail } from "./detail";

export default async function DetailLayout({ children, params }: {
  children: ReactNode;
  params: Promise<{ articleSlug: string }>;
}) {
  await getArticleDetail((await params).articleSlug);
  return children;
}
