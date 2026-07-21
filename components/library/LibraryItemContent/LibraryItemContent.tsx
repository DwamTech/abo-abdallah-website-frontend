"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Expand,
  FileText,
  Home,
  Library,
  Share2,
  Sparkles,
  Tags,
  X,
} from "lucide-react";
import SubpageBackdrop from "@/components/layout/SubpageBackdrop/SubpageBackdrop";
import LibraryWorkIcon from "@/components/library/LibraryWorkIcon/LibraryWorkIcon";
import type { LibraryWork } from "@/lib/libraryData";
import { toArabicDigits } from "@/lib/arabicNumbers";
import styles from "./LibraryItemContent.module.css";
import readerStyles from "./ReaderWithoutIndex.module.css";

type LibraryItemContentProps = {
  work: LibraryWork;
  relatedWorks: LibraryWork[];
};

export default function LibraryItemContent({
  work,
  relatedWorks,
}: LibraryItemContentProps) {
  const [readerOpen, setReaderOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageDirection, setPageDirection] = useState<"next" | "previous">(
    "next",
  );
  const readerPages = useMemo(
    () => [
      {
        title: "صفحة العنوان",
        heading: work.title,
        paragraphs: [work.description, `${work.contentType} في ${work.field}.`],
      },
      {
        title: "عن المصنَّف",
        heading: "نبذة علمية",
        paragraphs: [work.description, work.publication],
      },
      {
        title: "بيانات النشر",
        heading: "البيانات الببليوجرافية",
        paragraphs: [
          `الإصدار: ${work.edition}.`,
          `عدد الصفحات: ${toArabicDigits(work.pages)} صفحة.`,
          `التصنيف العلمي: ${work.field}.`,
          `نوع المحتوى: ${work.contentType}.`,
        ],
      },
      {
        title: "فهرس المحتويات",
        heading: "محتويات المصنَّف",
        paragraphs: work.contents.map(
          (item, index) => `${toArabicDigits(index + 1)}. ${item}`,
        ),
      },
    ].slice(0, 3),
    [work],
  );

  useEffect(() => {
    if (!readerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") setReaderOpen(false);
      if (!work.pdfUrl && event.key === "ArrowLeft") {
        setPageDirection("next");
        setCurrentPage((page) => Math.min(page + 1, readerPages.length - 1));
      }
      if (!work.pdfUrl && event.key === "ArrowRight") {
        setPageDirection("previous");
        setCurrentPage((page) => Math.max(page - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKeyboard);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [readerOpen, readerPages.length, work.pdfUrl]);

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
            <Link href="/library">المكتبة الرقمية</Link>
            <span>/</span>
            <strong>{work.shortTitle}</strong>
          </nav>

          <div className={styles.heroGrid}>
            <div
              className={styles.cover}
              style={{ "--work-accent": work.accent } as React.CSSProperties}
            >
              <span>المكتبة الرقمية</span>
              <LibraryWorkIcon type={work.contentType} size={66} />
              <strong>{work.shortTitle}</strong>
              <i />
              <small>{work.field}</small>
              <b className={styles.bookBottom} aria-hidden="true" />
            </div>

            <div className={styles.heroCopy}>
              <div className={styles.heroLabels}>
                <span>
                  <Library size={14} />
                  {work.contentType}
                </span>
                {work.isPlaceholder && (
                  <span className={styles.placeholderLabel}>
                    <i />
                    بيانات نموذجية قيد التوثيق
                  </span>
                )}
              </div>
              <h1>{work.title}</h1>
              <p>{work.description}</p>

              <div className={styles.meta}>
                <span>
                  <FileText size={17} />
                  <small>عدد الصفحات</small>
                  <strong>{toArabicDigits(work.pages)} صفحة</strong>
                </span>
                <span>
                  <CalendarDays size={17} />
                  <small>بيانات الإصدار</small>
                  <strong>{work.edition}</strong>
                </span>
                <span>
                  <Tags size={17} />
                  <small>التصنيف العلمي</small>
                  <strong>{work.field}</strong>
                </span>
              </div>

              <div className={styles.actions}>
                <a className={styles.readButton} href="#reader">
                  <BookOpen size={17} />
                  ابدأ القراءة
                  <ArrowLeft size={17} />
                </a>
                <button type="button" aria-label="مشاركة المصنف">
                  <Share2 size={17} />
                </button>
                <button
                  type="button"
                  aria-label="تحميل المصنف"
                  disabled={!work.downloadAllowed || !work.pdfUrl}
                >
                  <Download size={17} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="reader" className={styles.content}>
        <SubpageBackdrop />
        <div className={styles.contentInner}>
          <header className={styles.sectionHead}>
            <div>
              <span>
                <Sparkles size={14} />
                القراءة داخل الموقع
              </span>
              <h2>قارئ المصنَّف الرقمي</h2>
            </div>
            <span className={styles.readerState}>
              <i />
              تصفح دون تحميل
            </span>
          </header>

          <div className={styles.readerShell}>
            <div className={styles.readerToolbar}>
              <span>
                <BookOpen size={17} />
                {work.shortTitle}
              </span>
              <div>
                <button
                  type="button"
                  aria-label="العرض الكامل للقارئ"
                  onClick={() => setReaderOpen(true)}
                >
                  <Expand size={16} />
                </button>
                <button
                  type="button"
                  aria-label="تحميل الملف"
                  disabled={!work.downloadAllowed || !work.pdfUrl}
                >
                  <Download size={16} />
                </button>
              </div>
            </div>

            <div className={styles.readerLayout}>
              <div className={styles.documentArea}>
                {work.pdfUrl ? (
                  <iframe
                    className={styles.pdfFrame}
                    src={work.pdfUrl}
                    title={work.title}
                  />
                ) : (
                  <div className={styles.documentPreview}>
                    <article className={styles.paper}>
                      <span>بسم الله الرحمن الرحيم</span>
                      <LibraryWorkIcon type={work.contentType} size={35} />
                      <h3>{work.title}</h3>
                      <i />
                      <p>{work.description}</p>
                      <small>صفحة تجريبية لمعاينة تصميم القارئ المدمج</small>
                      <b>١</b>
                    </article>
                    <span className={styles.fileNotice}>
                      <Check size={14} />
                      القارئ جاهز عند إضافة ملف PDF الرسمي
                    </span>
                  </div>
                )}
              </div>

              <aside className={styles.sidebar}>
                <div className={styles.publication}>
                  <small>بيانات النشر</small>
                  <strong>{work.publication}</strong>
                  <span>{work.edition}</span>
                </div>

                <div className={styles.keywords}>
                  <span>
                    <Tags size={16} />
                    الكلمات المفتاحية
                  </span>
                  <div>
                    {work.keywords.map((keyword) => (
                      <small key={keyword}>{keyword}</small>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>

          {relatedWorks.length > 0 && (
            <section className={styles.related}>
              <header>
                <span>من المكتبة</span>
                <h2>مواد ذات صلة</h2>
              </header>
              <div>
                {relatedWorks.map((item) => (
                  <Link
                    href={`/library/${item.slug}`}
                    key={item.slug}
                    style={
                      { "--work-accent": item.accent } as React.CSSProperties
                    }
                  >
                    <span className={styles.relatedIcon}>
                      <LibraryWorkIcon type={item.contentType} size={25} />
                    </span>
                    <span>
                      <small>{item.contentType}</small>
                      <strong>{item.title}</strong>
                      <em>{item.field}</em>
                    </span>
                    <ArrowLeft size={17} />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>

      {readerOpen && (
        <div
          className={styles.fullReaderOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={`قارئ ${work.title}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setReaderOpen(false);
          }}
        >
          <div
            className={`${styles.fullReaderModal} ${
              work.pdfUrl ? styles.pdfModal : ""
            }`}
          >
            <header className={styles.fullReaderHeader}>
              <span className={styles.fullReaderBrand}>
                <BookOpen size={21} />
                <span>
                  <small>قارئ المكتبة الرقمية</small>
                  <strong>{work.title}</strong>
                </span>
              </span>
              {!work.pdfUrl && (
                <span className={styles.fullReaderProgress}>
                  الصفحة {toArabicDigits(currentPage + 1)} من {toArabicDigits(readerPages.length)}
                </span>
              )}
              <button
                type="button"
                onClick={() => setReaderOpen(false)}
                aria-label="إغلاق العرض الكامل"
              >
                <X size={20} />
              </button>
            </header>

            {work.pdfUrl ? (
              <iframe
                className={styles.fullPdfFrame}
                src={work.pdfUrl}
                title={`العرض الكامل: ${work.title}`}
              />
            ) : (
              <div className={`${styles.fullReaderBody} ${readerStyles.readerBody}`}>

                <div className={styles.fullPageStage}>
                  <article
                    key={`${currentPage}-${pageDirection}`}
                    className={`${styles.fullReaderPage} ${
                      pageDirection === "next"
                        ? styles.turnNext
                        : styles.turnPrevious
                    }`}
                  >
                    <span className={styles.fullPageEyebrow}>
                      {readerPages[currentPage].title}
                    </span>
                    <h2>{readerPages[currentPage].heading}</h2>
                    <i className={styles.fullPageRule} />
                    {readerPages[currentPage].paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                    <footer>
                      <span>{work.shortTitle}</span>
                      <strong>{toArabicDigits(currentPage + 1)}</strong>
                    </footer>
                  </article>
                </div>
              </div>
            )}

            {!work.pdfUrl && (
              <footer className={styles.fullReaderControls}>
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
            )}
          </div>
        </div>
      )}
    </>
  );
}
