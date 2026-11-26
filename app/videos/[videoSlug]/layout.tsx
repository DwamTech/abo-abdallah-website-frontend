import type { ReactNode } from "react";
import { loadVideo } from "./detail";

export default async function DetailLayout({ children, params }: {
  children: ReactNode;
  params: Promise<{ videoSlug: string }>;
}) {
  await loadVideo((await params).videoSlug);
  return children;
}
