"use client";

import { RefreshCcw } from "lucide-react";

import ArticleRouteState from "@/components/article/ArticleRouteState/ArticleRouteState";

export default function ArticlesError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <ArticleRouteState
      title="تعذّر تحميل المقالات والدراسات"
      description="يمكنك إعادة المحاولة دون مغادرة الصفحة."
      stateTitle="تعذّر الاتصال بخادم المقالات"
      stateDescription="تحقق من الاتصال ثم أعد المحاولة."
      icon={<RefreshCcw size={30} />}
      action={
        <button type="button" onClick={reset}>
          إعادة المحاولة
        </button>
      }
      alert
    />
  );
}
