"use client";

import { useEffect, useState } from "react";
import { Check, Download, Share2 } from "lucide-react";
import styles from "./VideoEngagement.module.css";

export default function VideoEngagement({
  slug,
  title,
  downloadUrl,
}: {
  slug: string;
  title: string;
  downloadUrl?: string | null;
}) {
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void fetch(
      `/api/scientific-videos/items/${encodeURIComponent(slug)}/view`,
      {
        method: "POST",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      },
    ).catch(() => undefined);
    return () => controller.abort();
  }, [slug]);

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
      setShared(true);
      window.setTimeout(() => setShared(false), 1800);
    } catch {
      // Cancellation is an expected outcome and needs no error state.
    }
  }

  return (
    <div className={styles.actions}>
      <button type="button" aria-label="مشاركة المادة" onClick={share}>
        {shared ? <Check size={18} /> : <Share2 size={18} />}
      </button>
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
      <span className={styles.status} aria-live="polite">
        {shared ? "تم نسخ الرابط" : ""}
      </span>
    </div>
  );
}
