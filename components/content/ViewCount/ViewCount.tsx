import { Eye } from "lucide-react";

import { toArabicDigits } from "@/lib/arabicNumbers";
import styles from "./ViewCount.module.css";

export type ViewCountTone = "inherit" | "muted" | "light";

type ViewCountProps = {
  count: number;
  className?: string;
  tone?: ViewCountTone;
};

function safeCount(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

export default function ViewCount({
  count,
  className,
  tone = "inherit",
}: ViewCountProps) {
  const normalizedCount = safeCount(count);
  const label = `${toArabicDigits(normalizedCount)} مشاهدة`;

  return (
    <span
      className={`${styles.badge} ${tone === "inherit" ? "" : styles[tone]} ${className ?? ""}`.trim()}
      aria-label={label}
      title={label}
    >
      <Eye size={14} aria-hidden="true" />
      <b>{toArabicDigits(normalizedCount)}</b>
      مشاهدة
    </span>
  );
}
