"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { ShareButton } from "@/components/content/ShareButton/ShareButton";

const STORAGE_KEY = "saved-site-articles";

function readSavedArticles(): string[] {
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "[]",
    );
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

export default function ArticleActions({
  slug,
  className,
  feedbackClassName,
}: {
  slug: string;
  className: string;
  feedbackClassName: string;
}) {
  const [saved, setSaved] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    setSaved(readSavedArticles().includes(slug));
  }, [slug]);

  const toggleSaved = () => {
    const savedArticles = readSavedArticles();
    const nextSaved = !savedArticles.includes(slug);
    const next = nextSaved
      ? [...savedArticles, slug]
      : savedArticles.filter((item) => item !== slug);

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSaved(nextSaved);
      setFeedback(
        nextSaved
          ? "تم حفظ المقالة على هذا الجهاز."
          : "تمت إزالة المقالة من المحفوظات.",
      );
    } catch {
      setFeedback("تعذّر تحديث المحفوظات على هذا الجهاز.");
    }
  };

  return (
    <div className={className}>
      <button type="button" onClick={toggleSaved} aria-pressed={saved}>
        <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
        {saved ? "محفوظة" : "حفظ المقالة"}
      </button>
      <ShareButton
        label="نسخ الرابط"
        copiedLabel="تم نسخ الرابط"
        ariaLabel="نسخ رابط المقالة"
      />
      <p className={feedbackClassName} aria-live="polite">
        {feedback}
      </p>
    </div>
  );
}
