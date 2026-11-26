import type { ReactNode } from "react";
import { loadDissertation } from "./detail";

export default async function DetailLayout({ children, params }: {
  children: ReactNode;
  params: Promise<{ dissertationId: string }>;
}) {
  await loadDissertation((await params).dissertationId);
  return children;
}
