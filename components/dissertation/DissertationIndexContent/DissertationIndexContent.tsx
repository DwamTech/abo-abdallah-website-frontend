"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  GraduationCap,
  Home,
  Search,
  SlidersHorizontal,
  University,
  User,
  X,
} from "lucide-react";
import {
  dissertations,
  dissertationDegrees,
  dissertationSpecializations,
  dissertationUniversities,
  dissertationYears,
  participationTypes,
  type Dissertation,
} from "@/lib/dissertationData";
import { toArabicDigits } from "@/lib/arabicNumbers";
import styles from "./DissertationIndexContent.module.css";

export default function DissertationIndexContent() {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState<string>("الكل");
  const [university, setUniversity] = useState<string>("الكل");
  const [specialization, setSpecialization] = useState<string>("الكل");
  const [participation, setParticipation] = useState<string>("الكل");
  const [degree, setDegree] = useState<string>("الكل");

  const filtered = useMemo(() => {
    const q = query.trim();
    return dissertations.filter((item: Dissertation) => {
      const matchesQuery =
        !q ||
        item.title.includes(q) ||
        item.researcher.includes(q) ||
        item.university.includes(q) ||
        item.college.includes(q) ||
        item.specialization.includes(q);

      return (
        matchesQuery &&
        (year === "الكل" || String(item.year) === year) &&
        (university === "الكل" || item.university === university) &&
        (specialization === "الكل" || item.specialization === specialization) &&
        (participation === "الكل" || item.participation === participation) &&
        (degree === "الكل" || item.degree === degree)
      );
    });
  }, [query, year, university, specialization, participation, degree]);

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add(styles.highlight);
          setTimeout(() => element.classList.remove(styles.highlight), 1800);
        }, 300);
      }
    }
  }, []);

  const activeFiltersCount = [
    year,
    university,
    specialization,
    participation,
    degree,
  ].filter((v) => v !== "الكل").length;

  const resetFilters = () => {
    setYear("الكل");
    setUniversity("الكل");
    setSpecialization("الكل");
    setParticipation("الكل");
    setDegree("الكل");
    setQuery("");
  };

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb}>
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

              <div className={styles.heroStats}>
                <span>
                  <strong>{toArabicDigits(dissertations.length)}</strong>
                  رسالة علمية
                </span>
                <i />
                <span>
                  <strong>{toArabicDigits(dissertationUniversities.length)}</strong>
                  جامعة
                </span>
                <i />
                <span>
                  <strong>{toArabicDigits(dissertationSpecializations.length)}</strong>
                  تخصص
                </span>
              </div>
            </div>

            <div className={styles.heroScene}>
              <span className={styles.heroOrbit} aria-hidden="true" />
              <span className={styles.heroSpark} aria-hidden="true" />
              <div className={styles.heroBook}>
                <div className={styles.heroBookCover}>
                  <span>قاعدة بيانات</span>
                  <BookOpen size={58} />
                  <strong>الرسائل العلمية</strong>
                  <i />
                  <small>إشراف ومناقشة</small>
                </div>
                <span className={styles.heroBookShadow} aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.catalog}>
        <div className={styles.catalogInner}>
          <div className={styles.catalogHead}>
            <div>
              <span>
                <SlidersHorizontal size={14} />
                فهرس الرسائل العلمية
              </span>
              <h2>تصفّح الرسائل</h2>
            </div>

            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>
                <Search size={20} />
              </span>
              <span className={styles.searchControl}>
                <small>البحث في الرسائل</small>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث بعنوان الرسالة، اسم الباحث، الجامعة..."
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
                {toArabicDigits(filtered.length)}
                <small>نتيجة</small>
              </span>
            </div>
          </div>

          <div className={styles.filters}>
            <FilterRow
              label="السنة"
              icon={<Calendar size={14} />}
              options={["الكل", ...dissertationYears.map(String)]}
              value={year}
              onChange={setYear}
            />
            <FilterRow
              label="الجامعة"
              icon={<University size={14} />}
              options={["الكل", ...dissertationUniversities]}
              value={university}
              onChange={setUniversity}
            />
            <FilterRow
              label="التخصص"
              icon={<BookOpen size={14} />}
              options={["الكل", ...dissertationSpecializations]}
              value={specialization}
              onChange={setSpecialization}
            />
            <FilterRow
              label="نوع المشاركة"
              icon={<User size={14} />}
              options={participationTypes}
              value={participation}
              onChange={setParticipation}
            />
            <FilterRow
              label="الدرجة العلمية"
              icon={<GraduationCap size={14} />}
              options={dissertationDegrees}
              value={degree}
              onChange={setDegree}
            />
          </div>

          {activeFiltersCount > 0 && (
            <div className={styles.activeFilters}>
              <span>تم تطبيق {toArabicDigits(activeFiltersCount)} مرشح</span>
              <button type="button" onClick={resetFilters}>
                إعادة ضبط الفلاتر
                <X size={14} />
              </button>
            </div>
          )}

          <div className={styles.grid}>
            {filtered.length === 0 ? (
              <div className={styles.emptyState}>
                <Search size={48} />
                <strong>لا توجد نتائج مطابقة</strong>
                <p>جرّب تعديل كلمات البحث أو إعادة ضبط الفلاتر.</p>
                <button type="button" onClick={resetFilters}>
                  إعادة ضبط
                </button>
              </div>
            ) : (
              filtered.map((item) => (
                <article className={styles.card} key={item.id} id={item.id}>
                  <div className={styles.cardMetaTop}>
                    <span>{item.participation}</span>
                    <small>{item.degree}</small>
                  </div>

                  <h3>{item.title}</h3>

                  <div className={styles.cardMeta}>
                    <span>
                      <User size={14} />
                      {item.researcher}
                    </span>
                    <span>
                      <University size={14} />
                      {item.university}
                    </span>
                    <span>
                      <BookOpen size={14} />
                      {item.college}
                    </span>
                    <span>
                      <Calendar size={14} />
                      {toArabicDigits(item.year)}هـ
                    </span>
                    <span>
                      <GraduationCap size={14} />
                      {item.specialization}
                    </span>
                  </div>

                  {item.abstract && (
                    <p className={styles.abstract}>{item.abstract}</p>
                  )}

                  {item.link ? (
                    <a
                      className={styles.openWork}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i>
                        <BookOpen size={17} />
                      </i>
                      عرض الرسالة
                      <ArrowLeft size={17} />
                    </a>
                  ) : (
                    <span className={styles.noLink}>
                      {item.abstract
                        ? "ملخص الرسالة متاح أعلاه"
                        : "الرسالة غير متاحة للنشر"}
                    </span>
                  )}
                </article>
              ))
            )}
          </div>
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
