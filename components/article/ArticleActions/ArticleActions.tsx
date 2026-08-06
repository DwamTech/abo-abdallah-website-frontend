"use client";

import { useEffect, useState } from "react";
import { Bookmark, Share2 } from "lucide-react";

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
  title,
  className,
  feedbackClassName,
}: {
  slug: string;
  title: string;
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

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        setFeedback("تمت مشاركة رابط المقالة.");
        return;
      }
      await navigator.clipboard.writeText(url);
      setFeedback("تم نسخ رابط المقالة.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setFeedback("تعذّرت المشاركة؛ يمكنك نسخ الرابط من شريط العنوان.");
    }
  };

  return (
    <div className={className}>
      <button type="button" onClick={toggleSaved} aria-pressed={saved}>
        <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
        {saved ? "محفوظة" : "حفظ المقالة"}
      </button>
      <button type="button" onClick={() => void share()}>
        <Share2 size={18} />
        مشاركة
      </button>
      <p className={feedbackClassName} aria-live="polite">
        {feedback}
      </p>
    </div>
  );
}
