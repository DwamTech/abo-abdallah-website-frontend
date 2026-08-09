"use client";

import { Download } from "lucide-react";
import { ShareButton } from "@/components/content/ShareButton/ShareButton";
import styles from "./VideoEngagement.module.css";

export default function VideoEngagement({
  downloadUrl,
}: {
  downloadUrl?: string | null;
}) {
  return (
    <div className={styles.actions}>
      <ShareButton
        ariaLabel="نسخ رابط المادة المرئية"
        copiedLabel="تم نسخ الرابط"
        iconOnly
        label="نسخ الرابط"
      />
      {downloadUrl && (
        <a
          href={downloadUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="تحميل المادة المرئية"
        >
          <Download size={18} />
        </a>
      )}
    </div>
  );
}
