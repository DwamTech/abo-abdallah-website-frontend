"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Clock3,
  Feather,
} from "lucide-react";

import SubpageBackdrop from "@/components/layout/SubpageBackdrop/SubpageBackdrop";
import { toArabicDigits } from "@/lib/arabicNumbers";
import { getSiteArticles, type SiteArticleIndex } from "@/lib/siteArticlesApi";
import styles from "@/components/content/ContentIndex/ContentIndex.module.css";
import localStyles from "./ArticleIndexContent.module.css";

const ITEMS_PER_PAGE = 6;

function visiblePages(current: number, last: number) {
  if (last <= 5) return Array.from({ length: last }, (_, index) => index + 1);

  return Array.from(new Set([1, current - 1, current, current + 1, last]))
    .filter((page) => page >= 1 && page <= last)
    .sort((left, right) => left - right);
}

export default function ArticleIndexContent({
  initialData,
}: {
  initialData: SiteArticleIndex | null;
}) {
  const [result, setResult] = useState(initialData);
  const [currentPage, setCurrentPage] = useState(
    initialData?.meta.current_page ?? 1,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(
    initialData ? "" : "تعذّر تحميل المقالات والدراسات.",
  );

  const changePage = async (page: number) => {
    if (isLoading || page < 1 || page > (result?.meta.last_page ?? 1)) return;

    setIsLoading(true);
    setError("");
    try {
      const next = await getSiteArticles({ page, per_page: ITEMS_PER_PAGE });
      setResult(next);
      setCurrentPage(next.meta.current_page);
      document
        .getElementById("content-archive")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      setError("تعذّر تحميل هذه الصفحة. حاول مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const retry = async () => {
    setIsLoading(true);
    setError("");
    try {
      const next = await getSiteArticles({
        page: currentPage,
        per_page: ITEMS_PER_PAGE,
      });
      setResult(next);
      setCurrentPage(next.meta.current_page);
    } catch {
      setError("تعذّر تحميل المقالات والدراسات. حاول مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const pages = visiblePages(currentPage, result?.meta.last_page ?? 1);

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <span>مكتبة الباحث</span>
            <h1>المقالات والدراسات</h1>
            <p>مقالات ودراسات علمية تُعين على الفهم والتحصيل.</p>
          </div>
          <div className={styles.articleMotion} aria-hidden="true">
            <span className={styles.articleSheet}>
              <BookOpenText size={48} strokeWidth={1.25} />
              <i />
              <i />
              <i />
            </span>
            <span className={styles.articleFeather}>
              <Feather size={30} />
            </span>
          </div>
        </div>
      </section>

      <section className={styles.content} id="content-archive">
        <SubpageBackdrop />
        <div className={styles.container}>
          <header>
            <h2>أحدث المقالات</h2>
            <span>{toArabicDigits(result?.meta.total ?? 0)} مواد منشورة</span>
          </header>

          {error && (
            <div className={localStyles.state} role="alert">
              <p>{error}</p>
              <button type="button" onClick={retry} disabled={isLoading}>
                إعادة المحاولة
              </button>
            </div>
          )}

          {!error && result?.data.length === 0 && (
            <div className={localStyles.state}>
              <p>لا توجد مقالات أو دراسات منشورة حاليًا.</p>
            </div>
          )}

          {result && result.data.length > 0 && (
            <div
              className={`${styles.grid} ${styles.articleGrid} ${isLoading ? localStyles.loading : ""}`}
              aria-busy={isLoading}
            >
              {result.data.map((article, index) => {
                const itemNumber =
                  (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                return (
                  <article id={article.slug} key={article.slug}>
                    <span className={styles.number}>
                      {toArabicDigits(String(itemNumber).padStart(2, "0"))}
                    </span>
                    <small>{article.category}</small>
                    <h3>{article.title}</h3>
                    <p>{article.excerpt}</p>
                    <footer>
                      <span>
                        <Clock3 size={15} /> {article.reading_time_label}
                      </span>
                      <span>{article.date_label}</span>
                      <Link href={`/articles/${article.slug}`}>
                        التفاصيل <ArrowLeft size={15} />
                      </Link>
                    </footer>
                  </article>
                );
              })}
            </div>
          )}

          {(result?.meta.last_page ?? 1) > 1 && (
            <nav className={styles.pagination} aria-label="صفحات المقالات">
              <button
                type="button"
                disabled={currentPage === 1 || isLoading}
                onClick={() => changePage(currentPage - 1)}
              >
                <ArrowRight size={17} />
                <span>السابقة</span>
              </button>
              <div>
                {pages.map((page, index) => (
                  <span className={localStyles.pageSlot} key={page}>
                    {index > 0 && page - pages[index - 1] > 1 && (
                      <i className={localStyles.ellipsis}>…</i>
                    )}
                    <button
                      className={page === currentPage ? styles.activePage : ""}
                      type="button"
                      onClick={() => changePage(page)}
                      disabled={isLoading}
                      aria-current={page === currentPage ? "page" : undefined}
                    >
                      {toArabicDigits(page)}
                    </button>
                  </span>
                ))}
              </div>
              <button
                type="button"
                disabled={currentPage === result?.meta.last_page || isLoading}
                onClick={() => changePage(currentPage + 1)}
              >
                <span>التالية</span>
                <ArrowLeft size={17} />
              </button>
            </nav>
          )}
        </div>
      </section>
    </>
  );
}
