import type { ReactNode } from "react";
import { loadFatwa } from "./detail";

export default async function DetailLayout({ children, params }: {
  children: ReactNode;
  params: Promise<{ fatwaSlug: string }>;
}) {
  await loadFatwa((await params).fatwaSlug);
  return children;
}
