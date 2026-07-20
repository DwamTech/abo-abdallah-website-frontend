"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Files,
  Filter,
  Home,
  Library,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import SubpageBackdrop from "@/components/layout/SubpageBackdrop/SubpageBackdrop";
import LibraryWorkIcon from "@/components/library/LibraryWorkIcon/LibraryWorkIcon";
import {
  hadithFields,
  libraryContentTypes,
  libraryWorks,
  type HadithField,
  type LibraryContentType,
} from "@/lib/libraryData";
import { toArabicDigits } from "@/lib/arabicNumbers";
import styles from "./LibraryIndexContent.module.css";

export default function LibraryIndexContent() {
  const heroWork = libraryWorks[0];
  const [query, setQuery] = useState("");
  const [contentType, setContentType] = useState<
    LibraryContentType | "الكل"
  >("الكل");
  const [field, setField] = useState<HadithField | "الكل">("الكل");
  const normalizedQuery = query.trim();

  const filteredWorks = libraryWorks.filter((work) => {
    const matchesType =
      contentType === "الكل" || work.contentType === contentType;
    const matchesField = field === "الكل" || work.field === field;
    const matchesQuery =
      !normalizedQuery ||
      work.title.includes(normalizedQuery) ||
      work.description.includes(normalizedQuery) ||
      work.keywords.some((keyword) => keyword.includes(normalizedQuery));

    return matchesType && matchesField && matchesQuery;
  });

  const resetFilters = () => {
    setQuery("");
    setContentType("الكل");
    setField("الكل");
  };

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
                الكتب والتحقيقات والأبحاث والمواد المكتوبة في فهرس علمي واحد،
                مع قارئ مدمج يتيح تصفح الملفات دون مغادرة الموقع.
              </p>

              <div className={styles.heroStats}>
                <span>
                  <strong>{toArabicDigits(libraryWorks.length)}</strong>
                  مواد مفهرسة
                </span>
                <i />
                <span>
                  <strong>{toArabicDigits(hadithFields.length - 1)}</strong>
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
              style={{ "--work-accent": heroWork.accent } as React.CSSProperties}
              aria-hidden="true"
            >
              <span className={styles.heroOrbit} />
              <span className={styles.heroSpark} />
              <div className={styles.heroBook}>
                <div className={styles.heroBookCover}>
                  <small>المكتبة الرقمية</small>
                  <LibraryWorkIcon type={heroWork.contentType} size={58} />
                  <strong>{heroWork.shortTitle}</strong>
                  <i />
                  <span>{heroWork.field}</span>
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
                  placeholder="العنوان أو المجال أو كلمة مفتاحية..."
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
                {toArabicDigits(filteredWorks.length)}
                <small>نتيجة</small>
              </span>
            </label>
          </header>

          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <span>
                <Files size={15} />
                نوع المحتوى
              </span>
              <div>
                {libraryContentTypes.map((type) => (
                  <button
                    className={contentType === type ? styles.active : undefined}
                    key={type}
                    onClick={() => setContentType(type)}
                    type="button"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <span>
                <Filter size={15} />
                التصنيف العلمي
              </span>
              <div>
                {hadithFields.map((item) => (
                  <button
                    className={field === item ? styles.active : undefined}
                    key={item}
                    onClick={() => setField(item)}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.grid}>
            {filteredWorks.map((work, index) => (
              <Link
                className={styles.card}
                href={`/library/${work.slug}`}
                key={work.slug}
                style={{ "--work-accent": work.accent } as React.CSSProperties}
              >
                <div className={styles.coverStage}>
                  <span className={styles.cardNumber}>
                    {toArabicDigits(String(index + 1).padStart(2, "0"))}
                  </span>
                  <div className={styles.cover}>
                    <small>المكتبة الرقمية</small>
                    <LibraryWorkIcon type={work.contentType} size={46} />
                    <strong>{work.shortTitle}</strong>
                    <i />
                    <b className={styles.bookBottom} aria-hidden="true" />
                  </div>
                  <span className={styles.readStatus}>
                    <i />
                    متاح للقراءة
                  </span>
                </div>

                <div className={styles.cardCopy}>
                  {/* <div className={styles.cardTopline}>
                    <small>{work.contentType}</small>
                    {work.isPlaceholder && <span>بيانات تجريبية</span>}
                  </div> */}
                  <h3>{work.title}</h3>
                  <p>{work.description}</p>
                  <div className={styles.cardMeta}>
                    <span>
                      <Files size={14} />
                      {toArabicDigits(work.pages)} صفحة
                    </span>
                    <span>{work.field}</span>
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
            ))}

            {filteredWorks.length === 0 && (
              <div className={styles.emptyState}>
                <Search size={25} />
                <strong>لا توجد مادة مطابقة</strong>
                <p>جرّب كلمة أقصر أو أعد ضبط التصنيفات.</p>
                <button type="button" onClick={resetFilters}>
                  عرض جميع المواد
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
