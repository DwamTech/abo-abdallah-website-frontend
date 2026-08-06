"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookMarked,
  BookOpen,
  Files,
  Layers3,
  Library,
  LoaderCircle,
  RefreshCcw,
  Search,
  Sparkles,
} from "lucide-react";
import LibraryWorkIcon from "@/components/library/LibraryWorkIcon/LibraryWorkIcon";
import { apiErrorMessage } from "@/lib/api";
import { toArabicDigits } from "@/lib/arabicNumbers";
import {
  getScientificLibraryHome,
  resolveScientificLibraryUrl,
  type ScientificLibraryCard,
  type ScientificLibraryHome,
} from "@/lib/scientificLibraryApi";
import styles from "./DigitalLibrarySection.module.css";
import premium from "./DigitalLibraryPremium.module.css";

const WORK_ACCENTS = ["#795238", "#556a5c", "#786449", "#6d4c45", "#596873"];

function workAccent(item: ScientificLibraryCard) {
  const seed = String(item.id)
    .split("")
    .reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return WORK_ACCENTS[seed % WORK_ACCENTS.length];
}

export default function DigitalLibrarySection() {
  const [home, setHome] = useState<ScientificLibraryHome | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getScientificLibraryHome(controller.signal)
      .then(setHome)
      .catch((requestError: unknown) => {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        )
          return;
        setHome(null);
        setError(apiErrorMessage(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [retryKey]);

  const featured = home?.featured ?? null;
  const items = home?.items.slice(0, 3) ?? [];
  const noMaterials = !loading && !error && !featured && items.length === 0;

  return (
    <section
      id="digital-library"
      className={`${styles.section} ${premium.section}`}
    >
      <span className={styles.paperArc} aria-hidden="true" />
      <span className={styles.dotField} aria-hidden="true" />

      <div className={styles.container}>
        <header className={`${styles.heading} ${premium.heading}`}>
          <div>
            <span className={styles.eyebrow}>
              <Library size={15} />
              خزانة العلم المكتوبة
            </span>
            <h2>
              المصنَّفات
              <span>والمكتبة الرقمية</span>
            </h2>
          </div>

          <div className={styles.headingCopy}>
            <p>
              مكتبة تجمع الكتب والتحقيقات والأبحاث والمواد المكتوبة، مع قراءة
              ملفات PDF داخل الموقع وتصنيفها بحسب علوم الحديث.
            </p>
            <div className={premium.headingStats} aria-live="polite">
              <span>
                <strong>
                  {home ? toArabicDigits(home.stats.materials_count) : "—"}
                </strong>{" "}
                مواد رقمية
              </span>
              <i />
              <span>
                <BookOpen size={16} /> قراءة داخل الموقع
              </span>
            </div>
          </div>
        </header>

        {loading || error || noMaterials ? (
          <div
            className={`${styles.libraryShowcase} ${premium.libraryShowcase}`}
            aria-busy={loading}
          >
            <div
              className={styles.libraryState}
              role={error ? "alert" : "status"}
            >
              {loading ? (
                <LoaderCircle className={styles.stateSpinner} size={31} />
              ) : error ? (
                <RefreshCcw size={29} />
              ) : (
                <Library size={31} />
              )}
              <strong>
                {loading
                  ? "جارٍ تجهيز مختارات المكتبة"
                  : error
                    ? "تعذّر تحميل المكتبة العلمية"
                    : "ستظهر المصنَّفات هنا قريبًا"}
              </strong>
              <p>
                {loading
                  ? "نستدعي أحدث المواد المنشورة من الخادم."
                  : error || "لم تُنشر مواد في المكتبة العلمية بعد."}
              </p>
              {error && (
                <button
                  type="button"
                  onClick={() => setRetryKey((value) => value + 1)}
                >
                  إعادة المحاولة
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            className={`${styles.libraryShowcase} ${premium.libraryShowcase}`}
          >
            {featured ? (
              <FeaturedWork item={featured} />
            ) : (
              <div
                className={`${styles.featured} ${premium.featured} ${styles.featuredEmpty}`}
              >
                <Library size={34} />
                <strong>لم تُحدَّد مادة مميزة بعد</strong>
                <p>يمكنك استعراض أحدث مواد المكتبة من القائمة المجاورة.</p>
              </div>
            )}

            <div className={`${styles.workList} ${premium.workList}`}>
              <header className={premium.shelfHeader}>
                <div>
                  <span>
                    <Layers3 size={15} />
                    مختارات المكتبة
                  </span>
                  <strong>رفّ القراءة والبحث</strong>
                </div>
                <Link href="/library">
                  عرض الكل <ArrowLeft size={15} />
                </Link>
              </header>

              {items.map((item, index) => {
                const coverUrl = resolveScientificLibraryUrl(item.cover_url);
                return (
                  <Link
                    className={`${styles.workCard} ${premium.workCard}`}
                    href={`/library/${item.slug}`}
                    key={String(item.id)}
                    prefetch={false}
                    style={
                      {
                        "--work-accent": workAccent(item),
                      } as React.CSSProperties
                    }
                  >
                    <span className={styles.workNumber}>
                      {toArabicDigits(String(index + 2).padStart(2, "0"))}
                    </span>
                    <span className={`${styles.workIcon} ${premium.workIcon}`}>
                      {coverUrl ? (
                        <img
                          className={styles.workCoverImage}
                          src={coverUrl}
                          alt=""
                        />
                      ) : (
                        <LibraryWorkIcon type={item.content_type} size={24} />
                      )}
                    </span>
                    <span className={`${styles.workCopy} ${premium.workCopy}`}>
                      <small>{item.content_type}</small>
                      <strong>{item.short_title || item.title}</strong>
                      <span>{item.scientific_field}</span>
                    </span>
                    <span className={styles.workArrow}>
                      <ArrowLeft size={17} />
                    </span>
                  </Link>
                );
              })}

              {items.length === 0 && (
                <div className={styles.shelfEmpty}>
                  لا توجد مختارات إضافية منشورة.
                </div>
              )}

              <div className={`${styles.libraryTools} ${premium.libraryTools}`}>
                <span>
                  <Search size={18} />
                  بحث وتصنيف
                </span>
                <i />
                <span>
                  <BookOpen size={18} />
                  قراءة مباشرة
                </span>
                <i />
                <span>
                  <Sparkles size={18} />
                  مواد مترابطة
                </span>
              </div>
            </div>
          </div>
        )}

        <Link className={premium.libraryCta} href="/library">
          <i>
            <BookMarked size={21} />
          </i>
          <span>
            <small>المكتبة العلمية الكاملة</small>
            <strong>استكشف جميع المصنّفات والأبحاث</strong>
          </span>
          <ArrowLeft size={20} />
        </Link>
      </div>
    </section>
  );
}

function FeaturedWork({ item }: { item: ScientificLibraryCard }) {
  const coverUrl = resolveScientificLibraryUrl(item.cover_url);

  return (
    <Link
      className={`${styles.featured} ${premium.featured}`}
      href={`/library/${item.slug}`}
      prefetch={false}
      style={{ "--work-accent": workAccent(item) } as React.CSSProperties}
    >
      <div className={`${styles.featuredCover} ${premium.featuredCover}`}>
        {coverUrl ? (
          <img
            className={styles.featuredCoverImage}
            src={coverUrl}
            alt={`غلاف ${item.title}`}
          />
        ) : (
          <>
            <span>المكتبة الرقمية</span>
            <LibraryWorkIcon type={item.content_type} size={58} />
            <strong>{item.short_title || item.title}</strong>
            <i />
            <small>نسخة للقراءة</small>
          </>
        )}
        <b className={styles.bookBottom} aria-hidden="true" />
      </div>

      <div className={`${styles.featuredCopy} ${premium.featuredCopy}`}>
        <span className={styles.status}>
          <i />
          مصنَّف رقمي مميز
        </span>
        <small>{item.content_type}</small>
        <h3>{item.title}</h3>
        <p>{item.description}</p>

        <div className={`${styles.meta} ${premium.meta}`}>
          {item.pages_count !== undefined && (
            <span>
              <Files size={15} />
              {toArabicDigits(item.pages_count)} صفحة
            </span>
          )}
          <span>
            <BookOpen size={15} />
            {item.reader_available ? "قارئ رقمي مدمج" : "صفحة المصنَّف"}
          </span>
        </div>

        <span className={styles.openAction}>
          <i>
            <BookOpen size={17} />
          </i>
          افتح صفحة المصنَّف
          <ArrowLeft size={17} />
        </span>
      </div>
    </Link>
  );
}
