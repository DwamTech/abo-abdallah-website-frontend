"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  GraduationCap,
  Home,
  Landmark,
  Library,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import SubpageBackdrop from "@/components/layout/SubpageBackdrop/SubpageBackdrop";
import type { Dissertation } from "@/lib/dissertationData";
import { toArabicDigits } from "@/lib/arabicNumbers";
import styles from "./DissertationDetailContent.module.css";
import readerStyles from "./ReaderWithoutIndex.module.css";

type DissertationDetailContentProps = {
  dissertation: Dissertation;
  recordNumber: number;
  related: Dissertation[];
};

function participationDescription(participation: Dissertation["participation"]) {
  if (participation === "مشرف") {
    return "إشراف علمي ومتابعة منهجية لمسار البحث حتى اكتمال الرسالة ومناقشتها.";
  }

  if (participation === "مناقش") {
    return "مشاركة في مناقشة الرسالة وتقويم بنائها العلمي ومنهجها ونتائجها.";
  }

  return "مشاركة علمية ضمن لجنة الرسالة والإسهام في تقويمها واعتمادها الأكاديمي.";
}

export default function DissertationDetailContent({
  dissertation,
  recordNumber,
  related,
}: DissertationDetailContentProps) {
  const recordCode = toArabicDigits(String(recordNumber).padStart(3, "0"));
  const [readerOpen, setReaderOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageDirection, setPageDirection] = useState<"next" | "previous">(
    "next",
  );
  const readerPages = useMemo(
    () => [
      {
        title: "صفحة العنوان",
        heading: dissertation.title,
        paragraphs: [
          `رسالة ${dissertation.degree} في ${dissertation.specialization}.`,
          `إعداد الباحث: ${dissertation.researcher}.`,
          `${dissertation.college}، ${dissertation.university}، عام ${toArabicDigits(dissertation.year)}هـ.`,
        ],
      },
      {
        title: "ملخص الرسالة",
        heading: "الملخص العلمي",
        paragraphs: [
          dissertation.abstract ??
            "لم يُضف الملخص العلمي الكامل لهذه الرسالة إلى قاعدة البيانات بعد.",
        ],
      },
      {
        title: "البيانات الأكاديمية",
        heading: "بطاقة الدراسة",
        paragraphs: [
          `الدرجة العلمية: ${dissertation.degree}.`,
          `التخصص: ${dissertation.specialization}.`,
          `الجهة العلمية: ${dissertation.college} بجامعة ${dissertation.university}.`,
          `سنة الإجازة: ${toArabicDigits(dissertation.year)}هـ.`,
        ],
      },
      {
        title: "الإشراف العلمي",
        heading: `دور فضيلة الشيخ: ${dissertation.participation}`,
        paragraphs: [participationDescription(dissertation.participation)],
      },
    ],
    [dissertation],
  );

  useEffect(() => {
    if (!readerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setReaderOpen(false);
      if (event.key === "ArrowLeft") {
        setPageDirection("next");
        setCurrentPage((page) => Math.min(page + 1, readerPages.length - 1));
      }
      if (event.key === "ArrowRight") {
        setPageDirection("previous");
        setCurrentPage((page) => Math.max(page - 1, 0));
      }
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [readerOpen, readerPages.length]);

  const goToPage = (page: number) => {
    setPageDirection(page > currentPage ? "next" : "previous");
    setCurrentPage(page);
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
            <Link href="/dissertations">الرسائل العلمية</Link>
            <span>/</span>
            <strong>السجل {recordCode}</strong>
          </nav>

          <div className={styles.heroGrid}>
            <span className={styles.recordSeal}>
              <GraduationCap size={38} strokeWidth={1.45} />
              <small>السجل الأكاديمي</small>
              <strong>RS · {recordCode}</strong>
            </span>

            <div className={styles.heroCopy}>
              <div className={styles.heroLabels}>
                <span>
                  <Sparkles size={14} />
                  {dissertation.participation}
                </span>
                <span>{dissertation.degree}</span>
              </div>
              <h1>{dissertation.title}</h1>
              <p>
                رسالة في {dissertation.specialization}، مقدمة إلى {dissertation.college}
                بجامعة {dissertation.university}.
              </p>

              <div className={styles.heroMeta}>
                <span>
                  <UserRound size={17} />
                  <small>الباحث</small>
                  <strong>{dissertation.researcher}</strong>
                </span>
                <span>
                  <Landmark size={17} />
                  <small>الجامعة</small>
                  <strong>{dissertation.university}</strong>
                </span>
                <span>
                  <CalendarDays size={17} />
                  <small>العام</small>
                  <strong>{toArabicDigits(dissertation.year)}هـ</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.content}>
        <SubpageBackdrop />
        <div className={styles.contentInner}>
          <header className={styles.sectionHead}>
            <div>
              <span>
                <FileText size={15} />
                ملف الرسالة
              </span>
              <h2>بيانات الدراسة وملخصها العلمي</h2>
            </div>
            <div className={styles.sectionActions}>
              <button type="button" onClick={() => setReaderOpen(true)}>
                <BookOpen size={17} />
                اقرأ الرسالة
              </button>
              <Link href="/dissertations">
                العودة إلى جميع الرسائل
                <ArrowLeft size={16} />
              </Link>
            </div>
          </header>

          <div className={styles.studyGrid}>
            <article className={styles.summaryCard}>
              <div className={styles.summaryTopline}>
                <span>
                  <BookOpen size={18} />
                  ملخص الرسالة
                </span>
                <small>وثيقة تعريفية</small>
              </div>
              <p>
                {dissertation.abstract ??
                  "تتناول هذه الرسالة موضوعًا متخصصًا في علوم الحديث، وتعرض مادته وفق منهج أكاديمي يجمع بين التأصيل والتحليل والدراسة التطبيقية."}
              </p>

            </article>

            <div className={styles.detailCards}>
              <div className={styles.roleCard}>
                <span className={styles.roleIcon}>
                  <UsersRound size={24} />
                </span>
                <div>
                  <small>دور فضيلة الشيخ</small>
                  <h3>{dissertation.participation}</h3>
                  <p>{participationDescription(dissertation.participation)}</p>
                </div>
                <CheckCircle2 size={20} />
              </div>

              <article className={styles.descriptionCard}>
                <span className={styles.descriptionIcon}>
                  <FileText size={23} />
                </span>
                <div>
                  <small>وصف الرسالة</small>
                  <h3>{dissertation.degree} في {dissertation.specialization}</h3>
                  <p>رسالة علمية مرتبطة بمجال {dissertation.specialization}، أُنجزت في {dissertation.university} ضمن إطار أكاديمي موثق.</p>
                </div>
              <div className={styles.subjectBand}>
                <span>
                  <Library size={16} />
                  المجال العلمي
                </span>
                <strong>{dissertation.specialization}</strong>
              </div>
              </article>
            </div>

            {/* <aside className={styles.recordCard}>
              <header>
                <span>
                  <GraduationCap size={20} />
                </span>
                <div>
                  <small>بطاقة البيانات</small>
                  <h3>السجل الأكاديمي</h3>
                </div>
                <strong>{recordCode}</strong>
              </header>

              <dl>
                <div>
                  <dt><UserRound size={15} /> الباحث</dt>
                  <dd>{dissertation.researcher}</dd>
                </div>
                <div>
                  <dt><GraduationCap size={15} /> الدرجة</dt>
                  <dd>{dissertation.degree}</dd>
                </div>
                <div>
                  <dt><Building2 size={15} /> الجامعة</dt>
                  <dd>{dissertation.university}</dd>
                </div>
                <div>
                  <dt><Landmark size={15} /> الكلية</dt>
                  <dd>{dissertation.college}</dd>
                </div>
                <div>
                  <dt><BookOpen size={15} /> التخصص</dt>
                  <dd>{dissertation.specialization}</dd>
                </div>
                <div>
                  <dt><CalendarDays size={15} /> العام</dt>
                  <dd>{toArabicDigits(dissertation.year)}هـ</dd>
                </div>
              </dl>
            </aside> */}
          </div>

          <section className={styles.related}>
            <header>
              <span>من السجل الأكاديمي</span>
              <h2>رسائل علمية ذات صلة</h2>
            </header>
            <div>
              {related.map((item) => (
                <Link href={`/dissertations/${item.id}`} key={item.id}>
                  <span className={styles.relatedIcon}>
                    <GraduationCap size={23} />
                  </span>
                  <span>
                    <small>{item.participation} · {item.degree}</small>
                    <strong>{item.title}</strong>
                    <em>{item.specialization}</em>
                  </span>
                  <ArrowLeft size={17} />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>

      {readerOpen && (
        <div
          className={styles.readerOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={`قارئ رسالة ${dissertation.title}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setReaderOpen(false);
          }}
        >
          <div className={styles.readerModal}>
            <header className={styles.readerHeader}>
              <span className={styles.readerBrand}>
                <BookOpen size={21} />
                <span>
                  <small>قارئ الرسائل العلمية</small>
                  <strong>{dissertation.title}</strong>
                </span>
              </span>
              <span className={styles.readerProgress}>
                الصفحة {toArabicDigits(currentPage + 1)} من {toArabicDigits(readerPages.length)}
              </span>
              <button
                type="button"
                onClick={() => setReaderOpen(false)}
                aria-label="إغلاق القارئ"
              >
                <X size={20} />
              </button>
            </header>

            <div className={`${styles.readerBody} ${readerStyles.readerBody}`}>
              <aside className={`${styles.readerIndex} ${readerStyles.hidden}`}>
                <span>فهرس القراءة</span>
                <nav>
                  {readerPages.map((page, index) => (
                    <button
                      type="button"
                      className={currentPage === index ? styles.current : undefined}
                      key={page.title}
                      onClick={() => goToPage(index)}
                    >
                      <i>{toArabicDigits(String(index + 1).padStart(2, "0"))}</i>
                      <span>{page.title}</span>
                    </button>
                  ))}
                </nav>
                <p>
                  يعرض القارئ النص المتاح في السجل، ويستوعب صفحات النص الكامل
                  عند إضافتها إلى قاعدة البيانات.
                </p>
              </aside>

              <div className={styles.pageStage}>
                <article
                  key={`${currentPage}-${pageDirection}`}
                  className={`${styles.readerPage} ${
                    pageDirection === "next"
                      ? styles.turnNext
                      : styles.turnPrevious
                  }`}
                >
                  <span className={styles.pageEyebrow}>
                    {readerPages[currentPage].title}
                  </span>
                  <h2>{readerPages[currentPage].heading}</h2>
                  <i className={styles.pageRule} />
                  {readerPages[currentPage].paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  <footer>
                    <span>RS · {recordCode}</span>
                    <strong>{toArabicDigits(currentPage + 1)}</strong>
                  </footer>
                </article>
              </div>
            </div>

            <footer className={styles.readerControls}>
              <button
                type="button"
                disabled={currentPage === 0}
                onClick={() => goToPage(currentPage - 1)}
              >
                <ChevronRight size={18} />
                الصفحة السابقة
              </button>
              <span>
                {readerPages.map((page, index) => (
                  <button
                    type="button"
                    aria-label={`الانتقال إلى ${page.title}`}
                    className={currentPage === index ? styles.currentDot : undefined}
                    key={page.title}
                    onClick={() => goToPage(index)}
                  />
                ))}
              </span>
              <button
                type="button"
                disabled={currentPage === readerPages.length - 1}
                onClick={() => goToPage(currentPage + 1)}
              >
                الصفحة التالية
                <ChevronLeft size={18} />
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
