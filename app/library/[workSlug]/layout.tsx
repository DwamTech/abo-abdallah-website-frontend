import type { ReactNode } from "react";
import { loadBook } from "./detail";

export default async function DetailLayout({ children, params }: {
  children: ReactNode;
  params: Promise<{ workSlug: string }>;
}) {
  await loadBook((await params).workSlug);
  return children;
}
