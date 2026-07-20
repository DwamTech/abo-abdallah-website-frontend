"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Headphones,
  Home,
  ListMusic,
  Play,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import {
  listeningSeries,
  totalListeningSessions,
} from "@/lib/listeningData";
import { toArabicDigits } from "@/lib/arabicNumbers";
import SubpageBackdrop from "@/components/layout/SubpageBackdrop/SubpageBackdrop";
import SeriesIcon from "@/components/listening/SeriesIcon/SeriesIcon";
import styles from "./ListeningIndexContent.module.css";

export default function ListeningIndexContent() {
  const categories = [
    { label: "جميع السلاسل", value: "all" },
    { label: "كتب الصحاح", value: "كتب الصحاح" },
    { label: "السنن والمسانيد", value: "دواوين السنة" },
    { label: "علوم الحديث", value: "علوم الحديث" },
    { label: "الدروس والشروح", value: "دروس علمية" },
  ];
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim();
  const filteredSeries = listeningSeries.filter((series) => {
    const matchesCategory =
      activeCategory === "all" || series.category === activeCategory;
    const matchesQuery =
      !normalizedQuery ||
      series.title.includes(normalizedQuery) ||
      series.description.includes(normalizedQuery) ||
      series.category.includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });

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
            السَّمّاعات العالية
          </span>
          <h1>
            مجالس السماع
            <span>والمواد الصوتية</span>
          </h1>
          <p>
            مكتبة صوتية علمية مرتبة في سلاسل متصلة، تجمع التسجيل والكتاب
            وتساعد طالب العلم على المتابعة من أول مجلس إلى آخره.
          </p>

          <div className={styles.heroStats}>
            <span>
              <strong>{toArabicDigits(listeningSeries.length)}</strong>
              سلاسل علمية
            </span>
            <i />
            <span>
              <strong>{toArabicDigits(totalListeningSessions)}</strong>
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
                {toArabicDigits(filteredSeries.length)}
                <small>نتيجة</small>
              </span>
            </label>
          </header>

          <div className={styles.categoryRail}>
            {categories.map((category) => (
              <button
                className={
                  activeCategory === category.value
                    ? styles.activeCategory
                    : undefined
                }
                key={category.value}
                onClick={() => setActiveCategory(category.value)}
                type="button"
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className={styles.grid}>
            {filteredSeries.map((series) => {
              const index = listeningSeries.findIndex(
                (item) => item.slug === series.slug,
              );

              return (
              <Link
                className={styles.card}
                href={`/listening/${series.slug}`}
                key={series.slug}
                style={
                  { "--series-accent": series.accent } as React.CSSProperties
                }
              >
                <div
                  className={styles.cover}
                >
                  <span className={styles.coverIndex}>
                    {toArabicDigits(String(index + 1).padStart(2, "0"))}
                  </span>
                  <span>مجالس السماع</span>
                  <SeriesIcon
                    className={styles.coverIcon}
                    slug={series.slug}
                    size={49}
                  />
                  <small>{series.shortTitle}</small>
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
                  <p>{series.description}</p>

                  <div className={styles.cardWave} aria-hidden="true">
                    {Array.from({ length: 21 }).map((_, waveIndex) => (
                      <i key={waveIndex} />
                    ))}
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.meta}>
                      <span>
                        <ListMusic size={14} />
                        {toArabicDigits(series.sessions.length)} مجالس
                      </span>
                      <span>
                        <CalendarDays size={14} />
                        {series.date}
                      </span>
                    </div>
                    <span className={styles.openSeries}>
                      <i>
                        <Play size={14} fill="currentColor" />
                      </i>
                      عرض السلسلة
                      <ArrowLeft size={16} />
                    </span>
                  </div>
                </div>
              </Link>
              );
            })}
            {filteredSeries.length === 0 && (
              <div className={styles.emptyState}>
                <Search size={24} />
                <strong>لا توجد سلسلة مطابقة</strong>
                <p>جرّب عبارة أقصر أو اختر تصنيفًا آخر.</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setActiveCategory("all");
                  }}
                >
                  عرض جميع السلاسل
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
