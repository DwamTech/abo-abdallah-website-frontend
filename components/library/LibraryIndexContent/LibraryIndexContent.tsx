"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Files,
  Home,
  Library,
  LoaderCircle,
  RefreshCcw,
  Search,
  X,
} from "lucide-react";
import SubpageBackdrop from "@/components/layout/SubpageBackdrop/SubpageBackdrop";
import LibraryWorkIcon from "@/components/library/LibraryWorkIcon/LibraryWorkIcon";
import { apiErrorMessage } from "@/lib/api";
import { toArabicDigits } from "@/lib/arabicNumbers";
import {
  getScientificLibraryHome,
  getScientificLibraryItems,
  resolveScientificLibraryUrl,
  type ScientificLibraryCard,
  type ScientificLibraryStats,
} from "@/lib/scientificLibraryApi";
import styles from "./LibraryIndexContent.module.css";

const WORK_ACCENTS = ["#795238", "#556a5c", "#786449", "#6d4c45", "#596873"];

function workAccent(item: ScientificLibraryCard) {
  const seed = String(item.id)
    .split("")
    .reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return WORK_ACCENTS[seed % WORK_ACCENTS.length];
}

function visiblePages(current: number, last: number) {
  const start = Math.max(1, Math.min(current - 2, last - 4));
  const end = Math.min(last, Math.max(current + 2, 5));
  return Array.from(
    { length: Math.max(0, end - start + 1) },
    (_, index) => start + index,
  );
}

export default function LibraryIndexContent() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ScientificLibraryCard[]>([]);
  const [meta, setMeta] = useState<{
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number;
    to?: number;
  } | null>(null);
  const [stats, setStats] = useState<ScientificLibraryStats | null>(null);
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

    getScientificLibraryHome(controller.signal)
      .then((result) => setStats(result.stats))
      .catch((requestError: unknown) => {
        if (!(
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        )) {
          setStats(null);
        }
      });

    return () => controller.abort();
  }, [retryKey]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getScientificLibraryItems(
      { search: debouncedQuery || undefined, page, per_page: 12 },
      controller.signal,
    )
      .then((result) => {
        setItems(result.data);
        setMeta(result.meta);
      })
      .catch((requestError: unknown) => {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        )
          return;
        setItems([]);
        setMeta(null);
        setError(apiErrorMessage(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedQuery, page, retryKey]);

  const pages = useMemo(
    () => (meta ? visiblePages(meta.current_page, meta.last_page) : []),
    [meta],
  );

  const retry = () => setRetryKey((value) => value + 1);

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="مسار الصفحة">
            <Link href="/">
              <Home size={13} />
              الرئيسية
            </Link>
            <span>/</span>
            <strong>المكتبة الرقمية</strong>
          </nav>

          <div className={styles.heroLayout}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>
                <Library size={15} />
                خزانة العلم المكتوبة
              </span>
              <h1>
                المصنَّفات
                <span>والمكتبة الرقمية</span>
              </h1>
              <p>
                الكتب والتحقيقات والأبحاث والمواد المكتوبة في فهرس علمي واحد، مع
                قارئ مدمج يتيح تصفح الملفات دون مغادرة الموقع.
              </p>

              <div className={styles.heroStats} aria-live="polite">
                <span>
                  <strong>
                    {stats ? toArabicDigits(stats.materials_count) : "—"}
                  </strong>
                  مواد مفهرسة
                </span>
                <i />
                <span>
                  <strong>
                    {stats
                      ? toArabicDigits(stats.scientific_fields_count)
                      : "—"}
                  </strong>
                  مجالات علمية
                </span>
                <i />
                <span>
                  <BookOpen size={20} />
                  قراءة داخلية
                </span>
              </div>
            </div>

            <div
              className={styles.heroBookScene}
              style={{ "--work-accent": "#795238" } as React.CSSProperties}
              aria-hidden="true"
            >
              <span className={styles.heroOrbit} />
              <span className={styles.heroSpark} />
              <div className={styles.heroBook}>
                <div className={styles.heroBookCover}>
                  <small>المكتبة الرقمية</small>
                  <LibraryWorkIcon type="كتاب" size={58} />
                  <strong>خزانة العلم</strong>
                  <i />
                  <span>المصنَّفات العلمية</span>
                  <b className={styles.heroBookBottom} />
                </div>
              </div>
              <span className={styles.heroBookShadow} />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.catalog}>
        <SubpageBackdrop />
        <div className={styles.catalogInner}>
          <header className={styles.catalogHead}>
            <div>
              <span>
                <BookOpen size={15} />
                فهرس المكتبة
              </span>
              <h2>ابحث في المادة المكتوبة</h2>
            </div>

            <label className={styles.searchBox}>
              <span className={styles.searchIcon}>
                <Search size={20} />
              </span>
              <span className={styles.searchControl}>
                <small>البحث في المصنَّفات</small>
                <input
                  aria-label="البحث في المكتبة الرقمية"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="العنوان أو كلمة مفتاحية..."
                  value={query}
                />
              </span>
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="مسح البحث"
                >
                  <X size={16} />
                </button>
              )}
              <span className={styles.resultCount}>
                {meta ? toArabicDigits(meta.total) : "—"}
                <small>نتيجة</small>
              </span>
            </label>
          </header>

          <div className={styles.grid} aria-busy={loading}>
            {loading ? (
              <div className={styles.state}>
                <LoaderCircle size={30} className={styles.spinner} />
                <strong>جارٍ تحميل فهرس المكتبة</strong>
                <p>نستدعي المواد المنشورة من الخادم.</p>
              </div>
            ) : error ? (
              <div className={styles.state} role="alert">
                <RefreshCcw size={28} />
                <strong>تعذّر تحميل المكتبة</strong>
                <p>{error}</p>
                <button type="button" onClick={retry}>
                  إعادة المحاولة
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className={styles.emptyState}>
                <Search size={25} />
                <strong>لا توجد مادة مطابقة</strong>
                <p>جرّب كلمة بحث أقصر أو اعرض جميع المواد.</p>
                {query && (
                  <button type="button" onClick={() => setQuery("")}>
                    عرض جميع المواد
                  </button>
                )}
              </div>
            ) : (
              items.map((item, index) => {
                const accent = workAccent(item);
                const shortTitle = item.short_title || item.title;
                const coverUrl = resolveScientificLibraryUrl(item.cover_url);

                return (
                  <Link
                    className={styles.card}
                    href={`/library/${item.slug}`}
                    key={String(item.id)}
                    prefetch={false}
                    style={{ "--work-accent": accent } as React.CSSProperties}
                  >
                    <div className={styles.coverStage}>
                      <span className={styles.cardNumber}>
                        {toArabicDigits(
                          String((meta?.from ?? 1) + index).padStart(2, "0"),
                        )}
                      </span>
                      <div className={styles.cover}>
                        {coverUrl && (
                          <img
                            className={styles.coverImage}
                            src={coverUrl}
                            alt=""
                          />
                        )}
                        {!coverUrl && (
                          <>
                            <small>المكتبة الرقمية</small>
                            <LibraryWorkIcon
                              type={item.content_type}
                              size={46}
                            />
                            <strong>{shortTitle}</strong>
                            <i />
                          </>
                        )}
                        <b className={styles.bookBottom} aria-hidden="true" />
                      </div>
                      <span className={styles.readStatus}>
                        <i />
                        {item.reader_available
                          ? "قراءة داخلية متاحة"
                          : "صفحة المصنَّف متاحة"}
                      </span>
                    </div>

                    <div className={styles.cardCopy}>
                      <h3>{item.title}</h3>
                      {item.description && <p>{item.description}</p>}
                      <div className={styles.cardMeta}>
                        {item.pages_count !== undefined && (
                          <span>
                            <Files size={14} />
                            {toArabicDigits(item.pages_count)} صفحة
                          </span>
                        )}
                        <span>{item.scientific_field}</span>
                      </div>
                      <span className={styles.openWork}>
                        <i>
                          <BookOpen size={15} />
                        </i>
                        صفحة المصنَّف
                        <ArrowLeft size={16} />
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {!loading && !error && meta && meta.last_page > 1 && (
            <nav className={styles.pagination} aria-label="صفحات فهرس المكتبة">
              <button
                type="button"
                disabled={meta.current_page === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                السابق
              </button>
              {pages.map((pageNumber) => (
                <button
                  type="button"
                  aria-current={
                    pageNumber === meta.current_page ? "page" : undefined
                  }
                  className={
                    pageNumber === meta.current_page
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
                disabled={meta.current_page === meta.last_page}
                onClick={() =>
                  setPage((value) => Math.min(meta.last_page, value + 1))
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
