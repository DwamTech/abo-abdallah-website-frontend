"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  GraduationCap,
  Home,
  LoaderCircle,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  University,
  User,
  X,
} from "lucide-react";
import {
  apiErrorMessage,
  getDissertationFilterOptions,
  getDissertations,
  getDissertationStats,
  optionValues,
  statValue,
  type DissertationCard,
  type DissertationOptions,
  type DissertationStats,
  type PageMeta,
} from "@/lib/api";
import { toArabicDigits } from "@/lib/arabicNumbers";
import SubpageBackdrop from "@/components/layout/SubpageBackdrop/SubpageBackdrop";
import { ShareButton } from "@/components/content/ShareButton/ShareButton";
import ViewCount from "@/components/content/ViewCount/ViewCount";
import styles from "./DissertationIndexContent.module.css";

function visiblePages(current: number, last: number) {
  const start = Math.max(1, Math.min(current - 2, last - 4));
  const end = Math.min(last, Math.max(current + 2, 5));
  return Array.from(
    { length: Math.max(0, end - start + 1) },
    (_, index) => start + index,
  );
}

function hasValues(record: Record<string, unknown>) {
  return Object.keys(record).length > 0;
}

export default function DissertationIndexContent() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [year, setYear] = useState("");
  const [university, setUniversity] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [participation, setParticipation] = useState("");
  const [degree, setDegree] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<DissertationCard[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [options, setOptions] = useState<DissertationOptions>({});
  const [stats, setStats] = useState<DissertationStats>({});
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
    Promise.allSettled([
      getDissertationFilterOptions(controller.signal),
      getDissertationStats(controller.signal),
    ]).then(([optionsResult, statsResult]) => {
      if (controller.signal.aborted) return;
      if (optionsResult.status === "fulfilled") setOptions(optionsResult.value);
      if (statsResult.status === "fulfilled") setStats(statsResult.value);
    });
    return () => controller.abort();
  }, [retryKey]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getDissertations(
      {
        search: debouncedQuery || undefined,
        year: year || undefined,
        university: university || undefined,
        specialization: specialization || undefined,
        participation_type: participation || undefined,
        degree: degree || undefined,
        page,
        per_page: 12,
      },
      controller.signal,
    )
      .then((result) => {
        setItems(result.data);
        setMeta(result.meta);
        if (hasValues(result.filterOptions)) setOptions(result.filterOptions);
        if (hasValues(result.stats)) setStats(result.stats);
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
  }, [
    debouncedQuery,
    year,
    university,
    specialization,
    participation,
    degree,
    page,
    retryKey,
  ]);

  const years = optionValues(options, "years", "available_years");
  const universities = optionValues(
    options,
    "universities",
    "available_universities",
  );
  const specializations = optionValues(
    options,
    "specializations",
    "available_specializations",
  );
  const participationTypes = optionValues(
    options,
    "participation_types",
    "participations",
    "participation_type",
  );
  const degrees = optionValues(options, "degrees", "academic_degrees");

  const totalDissertations =
    statValue(
      stats,
      "dissertations_count",
      "total_dissertations",
      "total",
      "count",
    ) ?? meta?.total;
  const universitiesCount = statValue(
    stats,
    "universities_count",
    "university_count",
    "total_universities",
  );
  const specializationsCount = statValue(
    stats,
    "specializations_count",
    "specialization_count",
    "total_specializations",
  );

  const activeFiltersCount = [
    year,
    university,
    specialization,
    participation,
    degree,
  ].filter(Boolean).length;
  const pages = useMemo(
    () => (meta ? visiblePages(meta.currentPage, meta.lastPage) : []),
    [meta],
  );

  const resetFilters = () => {
    setYear("");
    setUniversity("");
    setSpecialization("");
    setParticipation("");
    setDegree("");
    setQuery("");
    setPage(1);
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
            <strong>الإنتاج الأكاديمي والإشراف العلمي</strong>
          </nav>

          <div className={styles.heroLayout}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>
                <GraduationCap size={15} />
                قاعدة بيانات الرسائل العلمية
              </span>
              <h1>
                الإنتاج الأكاديمي
                <span>والإشراف العلمي</span>
              </h1>
              <p>
                رسائل الماجستير والدكتوراه التي أشرف عليها فضيلة الشيخ أو ناقشها
                أو شارك في لجانها، مفهرسة للباحثين في علوم الحديث والسنة.
              </p>

              <div className={styles.heroStats} aria-live="polite">
                <span>
                  <strong>
                    {totalDissertations === undefined
                      ? "—"
                      : toArabicDigits(totalDissertations)}
                  </strong>
                  رسالة علمية
                </span>
                <i />
                <span>
                  <strong>
                    {universitiesCount === undefined
                      ? "—"
                      : toArabicDigits(universitiesCount)}
                  </strong>
                  جامعة
                </span>
                <i />
                <span>
                  <strong>
                    {specializationsCount === undefined
                      ? "—"
                      : toArabicDigits(specializationsCount)}
                  </strong>
                  تخصص
                </span>
              </div>
            </div>

            <div className={styles.heroScene} aria-hidden="true">
              <span className={styles.heroOrbit} />
              <span className={styles.heroSpark} />
              <div className={styles.heroBook}>
                <div className={styles.heroBookCover}>
                  <span>قاعدة بيانات</span>
                  <BookOpen size={58} />
                  <strong>الرسائل العلمية</strong>
                  <i />
                  <small>إشراف ومناقشة</small>
                  <b className={styles.heroBookBottom} />
                </div>
                <span className={styles.heroBookShadow} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.catalog}>
        <SubpageBackdrop />
        <div className={styles.catalogInner}>
          <div className={styles.controlPanel}>
            <div className={styles.catalogHead}>
              <div>
                <span>
                  <SlidersHorizontal size={14} />
                  فهرس الرسائل العلمية
                </span>
                <h2>ابحث وحدّد نطاق الدراسة</h2>
                <p>
                  ابحث في السجل ثم خصّص النتائج بحسب الجهة والتخصص والدور
                  العلمي.
                </p>
              </div>

              <label className={styles.searchBox}>
                <span className={styles.searchIcon}>
                  <Search size={21} />
                </span>
                <span className={styles.searchControl}>
                  <small>بحث في السجل</small>
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="عنوان الرسالة، الباحث، الجامعة أو التخصص..."
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
            </div>

            <div className={styles.filtersHeader}>
              <span>
                <SlidersHorizontal size={15} />
                تصفية النتائج
              </span>
              <small>{toArabicDigits(activeFiltersCount)} فلاتر مفعّلة</small>
            </div>

            <div className={styles.filters}>
              <FilterRow
                label="السنة"
                icon={<Calendar size={14} />}
                options={years}
                value={year}
                onChange={(value) => {
                  setYear(value);
                  setPage(1);
                }}
              />
              <FilterRow
                label="الجامعة"
                icon={<University size={14} />}
                options={universities}
                value={university}
                onChange={(value) => {
                  setUniversity(value);
                  setPage(1);
                }}
              />
              <FilterRow
                label="التخصص"
                icon={<BookOpen size={14} />}
                options={specializations}
                value={specialization}
                onChange={(value) => {
                  setSpecialization(value);
                  setPage(1);
                }}
              />
              <FilterRow
                label="نوع المشاركة"
                icon={<User size={14} />}
                options={participationTypes}
                value={participation}
                onChange={(value) => {
                  setParticipation(value);
                  setPage(1);
                }}
              />
              <FilterRow
                label="الدرجة العلمية"
                icon={<GraduationCap size={14} />}
                options={degrees}
                value={degree}
                onChange={(value) => {
                  setDegree(value);
                  setPage(1);
                }}
              />
            </div>

            {activeFiltersCount > 0 && (
              <div className={styles.activeFilters}>
                <span>تم تطبيق {toArabicDigits(activeFiltersCount)} مرشح</span>
                <button type="button" onClick={resetFilters}>
                  إعادة ضبط الفلاتر <X size={14} />
                </button>
              </div>
            )}
          </div>

          <div className={styles.grid} aria-busy={loading}>
            {loading ? (
              <div className={styles.state}>
                <LoaderCircle size={31} className={styles.spinner} />
                <strong>جارٍ تحميل الرسائل العلمية</strong>
                <p>نستدعي السجل الأكاديمي من الخادم.</p>
              </div>
            ) : error ? (
              <div className={styles.state} role="alert">
                <RefreshCcw size={29} />
                <strong>تعذّر تحميل السجل</strong>
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => setRetryKey((value) => value + 1)}
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className={styles.emptyState}>
                <Search size={48} />
                <strong>لا توجد نتائج مطابقة</strong>
                <p>جرّب تعديل كلمات البحث أو إعادة ضبط الفلاتر.</p>
                {(query || activeFiltersCount > 0) && (
                  <button type="button" onClick={resetFilters}>
                    إعادة ضبط
                  </button>
                )}
              </div>
            ) : (
              items.map((item) => (
                <article
                  className={styles.cardShell}
                  key={String(item.id)}
                >
                  <Link
                    className={styles.card}
                    href={`/dissertations/${item.slug || item.id}`}
                  >
                    <div className={styles.cardMetaTop}>
                      {item.participation_type && (
                        <span>{item.participation_type}</span>
                      )}
                      {item.degree && <small>{item.degree}</small>}
                    </div>

                    <h3>{item.title}</h3>

                    <div className={styles.cardMeta}>
                      {item.researcher_name && (
                        <span>
                          <User size={14} />
                          {item.researcher_name}
                        </span>
                      )}
                      {item.university && (
                        <span>
                          <University size={14} />
                          {item.university}
                        </span>
                      )}
                      {item.college && (
                        <span>
                          <BookOpen size={14} />
                          {item.college}
                        </span>
                      )}
                      {item.year !== undefined && (
                        <span>
                          <Calendar size={14} />
                          {toArabicDigits(item.year)}هـ
                        </span>
                      )}
                      {item.specialization && (
                        <span>
                          <GraduationCap size={14} />
                          {item.specialization}
                        </span>
                      )}
                      <ViewCount count={item.views_count} tone="muted" />
                    </div>

                    {item.abstract && (
                      <p className={styles.abstract}>{item.abstract}</p>
                    )}

                    <span className={styles.openWork}>
                      <i>
                        <BookOpen size={17} />
                      </i>
                      عرض ملف الرسالة
                      <ArrowLeft size={17} />
                    </span>
                  </Link>
                  <ShareButton
                    className={styles.cardShare}
                    href={`/dissertations/${item.slug || item.id}`}
                    iconOnly
                    ariaLabel={`نسخ رابط الرسالة: ${item.title}`}
                  />
                </article>
              ))
            )}
          </div>

          {!loading && !error && meta && meta.lastPage > 1 && (
            <nav
              className={styles.pagination}
              aria-label="صفحات الرسائل العلمية"
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

function FilterRow({
  label,
  icon,
  options,
  value,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={styles.filterGroup}>
      <span>
        {icon}
        {label}
      </span>
      <div>
        <button
          type="button"
          className={!value ? styles.active : undefined}
          onClick={() => onChange("")}
        >
          الكل
        </button>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={value === option ? styles.active : undefined}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
