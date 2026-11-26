import type { ReactNode } from "react";
import { loadSeries } from "./detail";

export default async function DetailLayout({ children, params }: {
  children: ReactNode;
  params: Promise<{ seriesSlug: string }>;
}) {
  await loadSeries((await params).seriesSlug);
  return children;
}
