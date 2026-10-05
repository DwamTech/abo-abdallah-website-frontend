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
import { ShareButton } from "@/components/content/ShareButton/ShareButton";
import ViewCount from "@/components/content/ViewCount/ViewCount";
import { apiErrorMessage } from "@/lib/api";
import { toArabicDigits } from "@/lib/arabicNumbers";
import {
  getScientificLibraryHome,
  getScientificLibraryCatalog,
  resolveScientificLibraryUrl,
  type ScientificLibraryCard,
  type ScientificLibraryStats,
} from "@/lib/scientificLibraryApi";
import styles from "./LibraryIndexContent.module.css";

const WORK_ACCENTS = ["#795238", "#556a5c", "#786449", "#6d4c45", "#596873"];
const ARABIC_COLLATOR = new Intl.Collator("ar", {
  sensitivity: "base",
  numeric: true,
});

function workAccent(item: ScientificLibraryCard) {
  const seed = String(item.id)
    .split("")
    .reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return WORK_ACCENTS[seed % WORK_ACCENTS.length];
}

export default function LibraryIndexContent() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [items, setItems] = useState<ScientificLibraryCard[]>([]);
  const [stats, setStats] = useState<ScientificLibraryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
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

    getScientificLibraryCatalog(
      { search: debouncedQuery || undefined },
      controller.signal,
    )
      .then((result) => {
        setItems(result.data);
      })
      .catch((requestError: unknown) => {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        )
          return;
        setItems([]);
        setError(apiErrorMessage(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedQuery, retryKey]);

  const groupedItems = useMemo(() => {
    const groups = new Map<string, ScientificLibraryCard[]>();

    for (const item of items) {
      const field = item.scientific_field.trim();
      const group = groups.get(field) ?? [];
      group.push(item);
      groups.set(field, group);
    }

    return Array.from(groups, ([field, books]) => ({ field, books })).sort(
      (left, right) => ARABIC_COLLATOR.compare(left.field, right.field),
    );
  }, [items]);

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
            <Link href="/library-indexes">المكتبة البكرية</Link>
            <span>/</span>
            <strong>مؤلفات الشيخ</strong>
          </nav>

          <div className={styles.heroLayout}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>
                <Library size={15} />
                خزانة العلم المكتوبة
              </span>
              <h1>
                مؤلفات الشيخ
                <span>ومصنَّفاته العلمية</span>
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
                  <small>المكتبة البكرية</small>
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
                  aria-label="البحث في المكتبة البكرية"
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
                {loading ? "—" : toArabicDigits(items.length)}
                <small>نتيجة</small>
              </span>
            </label>
          </header>

          <div className={styles.fieldGroups} aria-busy={loading}>
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
              groupedItems.map(({ field, books }) => (
                <section className={styles.fieldSection} key={field}>
                  <header className={styles.fieldSectionHead}>
                    <div>
                      <span aria-hidden="true"><BookOpen size={18} /></span>
                      <h3>{field}</h3>
                    </div>
                    <small>{toArabicDigits(books.length)} {books.length === 1 ? "كتاب" : "كتب"}</small>
                  </header>
                  <div className={styles.grid}>
                    {books.map((item, index) => {
                const accent = workAccent(item);
                const shortTitle = item.short_title || item.title;
                const coverUrl = resolveScientificLibraryUrl(item.cover_url);

                return (
                  <article
                    className={styles.cardShell}
                    key={String(item.id)}
                    style={{ "--work-accent": accent } as React.CSSProperties}
                  >
                    <Link
                      className={styles.card}
                      href={`/library/${item.slug}`}
                      prefetch={false}
                    >
                      <div className={styles.coverStage}>
                        <span className={styles.cardNumber}>
                          {toArabicDigits(
                            String(index + 1).padStart(2, "0"),
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
                              <small>المكتبة البكرية</small>
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
                          <ViewCount count={item.views_count} tone="muted" />
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
                    <ShareButton
                      className={styles.cardShare}
                      href={`/library/${item.slug}`}
                      iconOnly
                      ariaLabel={`نسخ رابط المصنَّف: ${item.title}`}
                    />
                  </article>
                      );
                    })}
                  </div>
                </section>
              ))
            )}
          </div>

        </div>
      </section>
    </>
  );
}
