"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Headphones,
  Home,
  ListMusic,
  LoaderCircle,
  Play,
  RefreshCcw,
  Search,
  X,
} from "lucide-react";
import {
  apiErrorMessage,
  getListeningSeries,
  type ListeningSeriesCard,
  type ListeningStats,
  type PageMeta,
} from "@/lib/api";
import { toArabicDigits } from "@/lib/arabicNumbers";
import { getListeningVisual } from "@/lib/listeningVisuals";
import SubpageBackdrop from "@/components/layout/SubpageBackdrop/SubpageBackdrop";
import SeriesIcon from "@/components/listening/SeriesIcon/SeriesIcon";
import ViewCount from "@/components/content/ViewCount/ViewCount";
import { ShareButton } from "@/components/content/ShareButton/ShareButton";
import styles from "./ListeningIndexContent.module.css";

function visiblePages(current: number, last: number) {
  const start = Math.max(1, Math.min(current - 2, last - 4));
  const end = Math.min(last, Math.max(current + 2, 5));
  return Array.from(
    { length: Math.max(0, end - start + 1) },
    (_, index) => start + index,
  );
}

export default function ListeningIndexContent() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [seriesItems, setSeriesItems] = useState<ListeningSeriesCard[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [stats, setStats] = useState<ListeningStats | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setDebouncedQuery(query.trim());
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getListeningSeries(
      {
        search: debouncedQuery || undefined,
        category: activeCategory === "all" ? undefined : activeCategory,
        page,
        per_page: 12,
      },
      controller.signal,
    )
      .then((result) => {
        setSeriesItems(result.data);
        setMeta(result.meta);
        setStats(result.stats);
        setCategories(result.filterOptions.categories);
      })
      .catch((requestError: unknown) => {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        )
          return;
        setSeriesItems([]);
        setMeta(null);
        setStats(null);
        setError(apiErrorMessage(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [activeCategory, debouncedQuery, page, retryKey]);

  const pages = meta ? visiblePages(meta.currentPage, meta.lastPage) : [];

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroWave} aria-hidden="true">
          {Array.from({ length: 42 }).map((_, index) => (
            <i key={index} />
          ))}
        </div>

        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="مسار الصفحة">
            <Link href="/">
              <Home size={13} />
              الرئيسية
            </Link>
            <span>/</span>
            <strong>مجالس السماع</strong>
          </nav>

          <span className={styles.eyebrow}>
            <Headphones size={14} />
            أقراء وتدبر
          </span>
          <h1>
            مجالس السماع
            <span>والمواد الصوتية</span>
          </h1>
          <p>
            مكتبة صوتية علمية مرتبة في سلاسل متصلة، تجمع التسجيل والكتاب وتساعد
            طالب العلم على المتابعة من أول مجلس إلى آخره.
          </p>

          <div className={styles.heroStats}>
            <span>
              <strong>
                {stats ? toArabicDigits(stats.series_count) : "—"}
              </strong>
              سلاسل علمية
            </span>
            <i />
            <span>
              <strong>
                {stats ? toArabicDigits(stats.sessions_count) : "—"}
              </strong>
              مجلسًا مرتبًا
            </span>
            <i />
            <span>
              <BookOpen size={20} />
              استماع وقراءة
            </span>
          </div>
        </div>
      </section>

      <section className={styles.library}>
        <SubpageBackdrop />
        <div className={styles.libraryInner}>
          <header className={styles.libraryHead}>
            <div>
              <span>
                <BookOpen size={15} />
                فهرس السلاسل
              </span>
              <h2>اختر الكتاب وابدأ السماع</h2>
            </div>
            <label className={styles.searchField}>
              <span className={styles.searchIcon}>
                <Search size={19} />
              </span>
              <span className={styles.searchControl}>
                <small>البحث في المكتبة الصوتية</small>
                <input
                  aria-label="البحث في مجالس السماع"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="اسم الكتاب أو السلسلة أو التصنيف..."
                  value={query}
                />
              </span>
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="مسح البحث"
                >
                  <X size={15} />
                </button>
              )}
              <span className={styles.searchCount}>
                {meta ? toArabicDigits(meta.total) : "—"}
                <small>نتيجة</small>
              </span>
            </label>
          </header>

          <div className={styles.categoryRail}>
            {[
              { label: "جميع السلاسل", value: "all" },
              ...categories.map((category) => ({
                label: category,
                value: category,
              })),
            ].map((category) => (
              <button
                className={
                  activeCategory === category.value
                    ? styles.activeCategory
                    : undefined
                }
                key={category.value}
                onClick={() => {
                  setPage(1);
                  setActiveCategory(category.value);
                }}
                type="button"
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className={styles.grid} aria-busy={loading}>
            {loading ? (
              <div className={styles.emptyState}>
                <LoaderCircle size={25} className={styles.spinner} />
                <strong>جارٍ تحميل مجالس السماع</strong>
                <p>نستدعي السلاسل المنشورة من الخادم.</p>
              </div>
            ) : error ? (
              <div className={styles.emptyState} role="alert">
                <RefreshCcw size={25} />
                <strong>تعذّر تحميل مجالس السماع</strong>
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => setRetryKey((value) => value + 1)}
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : seriesItems.length > 0 ? (
              seriesItems.map((series, index) => {
                const visual = getListeningVisual(series.visual_variant);

                return (
                  <article
                    className={styles.card}
                    key={series.slug}
                    style={
                      {
                        "--series-accent": visual.accent,
                      } as React.CSSProperties
                    }
                  >
                    <Link
                      aria-label={`فتح السلسلة: ${series.title}`}
                      className={styles.cardLink}
                      href={`/listening/${series.slug}`}
                    />
                    <div className={styles.cover}>
                      <span className={styles.coverIndex}>
                        {toArabicDigits(
                          String((meta?.from ?? 1) + index).padStart(2, "0"),
                        )}
                      </span>
                      <span>مجالس السماع</span>
                      <SeriesIcon
                        className={styles.coverIcon}
                        visualVariant={series.visual_variant}
                        size={49}
                      />
                      <small>{series.short_title}</small>
                      <i />
                    </div>

                    <div className={styles.cardCopy}>
                      <div className={styles.cardTopline}>
                        <small>{series.category}</small>
                        <span>
                          <i />
                          سلسلة صوتية مرتبة
                        </span>
                      </div>
                      <h3>{series.title}</h3>
                      <p>{series.description || "سلسلة علمية صوتية مرتبة."}</p>

                      <div className={styles.cardWave} aria-hidden="true">
                        {Array.from({ length: 21 }).map((_, waveIndex) => (
                          <i key={waveIndex} />
                        ))}
                      </div>

                      <div className={styles.cardFooter}>
                        <div className={styles.meta}>
                          <span>
                            <ListMusic size={14} />
                            {toArabicDigits(series.sessions_count)} مجالس
                          </span>
                          <span>
                            <CalendarDays size={14} />
                            {series.period_label || "—"}
                          </span>
                          <ViewCount count={series.views_count} tone="muted" />
                        </div>
                        <ShareButton
                          ariaLabel={`نسخ رابط السلسلة: ${series.title}`}
                          className={styles.cardShare}
                          href={`/listening/${series.slug}`}
                          iconOnly
                        />
                        <span className={styles.openSeries}>
                          <i>
                            <Play size={14} fill="currentColor" />
                          </i>
                          عرض السلسلة
                          <ArrowLeft size={16} />
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className={styles.emptyState}>
                <Search size={24} />
                <strong>لا توجد سلسلة مطابقة</strong>
                <p>جرّب عبارة أقصر أو اختر تصنيفًا آخر.</p>
                <button
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setQuery("");
                    setActiveCategory("all");
                  }}
                >
                  عرض جميع السلاسل
                </button>
              </div>
            )}
          </div>

          {!loading && !error && meta && meta.lastPage > 1 && (
            <nav
              className={styles.pagination}
              aria-label="صفحات مجالس السماع والمواد الصوتية"
            >
              <button
                type="button"
                disabled={meta.currentPage === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                السابق
              </button>
              {pages.map((pageNumber) => (
                <button
                  type="button"
                  aria-current={
                    pageNumber === meta.currentPage ? "page" : undefined
                  }
                  className={
                    pageNumber === meta.currentPage
                      ? styles.currentPage
                      : undefined
                  }
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                >
                  {toArabicDigits(pageNumber)}
                </button>
              ))}
              <button
                type="button"
                disabled={meta.currentPage === meta.lastPage}
                onClick={() =>
                  setPage((value) => Math.min(meta.lastPage, value + 1))
                }
              >
                التالي
              </button>
            </nav>
          )}
        </div>
      </section>
    </>
  );
}
