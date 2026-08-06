"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Download,
  Expand,
  ExternalLink,
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
import { toArabicDigits } from "@/lib/arabicNumbers";
import {
  recordScientificLibraryView,
  resolveScientificLibraryReader,
  resolveScientificLibraryUrl,
  type ScientificLibraryDetail,
} from "@/lib/scientificLibraryApi";
import styles from "./LibraryItemContent.module.css";

type LibraryItemContentProps = { initialData: ScientificLibraryDetail };

const WORK_ACCENTS = ["#795238", "#556a5c", "#786449", "#6d4c45", "#596873"];

function workAccent(item: { id: string | number }) {
  const seed = String(item.id)
    .split("")
    .reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return WORK_ACCENTS[seed % WORK_ACCENTS.length];
}

export default function LibraryItemContent({
  initialData,
}: LibraryItemContentProps) {
  const { item, related_items: relatedItems } = initialData;
  const [readerOpen, setReaderOpen] = useState(false);
  const readerTriggerRef = useRef<HTMLButtonElement>(null);
  const closeReaderRef = useRef<HTMLButtonElement>(null);
  const fullReaderFrameRef = useRef<HTMLIFrameElement>(null);
  const viewedSlugsRef = useRef(new Set<string>());

  useEffect(() => {
    const slug = item.slug;
    if (viewedSlugsRef.current.has(slug)) return;

    viewedSlugsRef.current.add(slug);
    void recordScientificLibraryView(slug).catch(() => {
      // Reading the page must stay available when analytics are unavailable.
    });
  }, [item.slug]);

  useEffect(() => {
    if (!readerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeReaderRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setReaderOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      readerTriggerRef.current?.focus();
    };
  }, [readerOpen]);

  const shortTitle = item.short_title || item.title;
  const accent = workAccent(item);
  const reader = resolveScientificLibraryReader(item);
  const coverUrl = resolveScientificLibraryUrl(item.cover_url);
  const hasSidebar = Boolean(
    item.author_name ||
    item.publication_info ||
    item.edition ||
    item.keywords.length > 0 ||
    reader.downloadUrl,
  );

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch {
      // The user may cancel the native share dialog.
    }
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
            <strong>{shortTitle}</strong>
          </nav>

          <div className={styles.heroGrid}>
            <div
              className={styles.cover}
              style={{ "--work-accent": accent } as React.CSSProperties}
            >
              {coverUrl ? (
                <img
                  className={styles.coverImage}
                  src={coverUrl}
                  alt={`غلاف ${item.title}`}
                />
              ) : (
                <>
                  <span>المكتبة الرقمية</span>
                  <LibraryWorkIcon type={item.content_type} size={66} />
                  <strong>{shortTitle}</strong>
                  <i />
                  <small>{item.scientific_field}</small>
                </>
              )}
              <b className={styles.bookBottom} aria-hidden="true" />
            </div>

            <div className={styles.heroCopy}>
              <div className={styles.heroLabels}>
                <span>
                  <Library size={14} />
                  {item.content_type}
                </span>
                {item.author_name && <span>{item.author_name}</span>}
              </div>
              <h1>{item.title}</h1>
              <p>{item.description}</p>

              <div className={styles.meta}>
                {item.pages_count !== undefined && (
                  <span>
                    <FileText size={17} />
                    <small>عدد الصفحات</small>
                    <strong>{toArabicDigits(item.pages_count)} صفحة</strong>
                  </span>
                )}
                {item.edition && (
                  <span>
                    <CalendarDays size={17} />
                    <small>بيانات الإصدار</small>
                    <strong>{item.edition}</strong>
                  </span>
                )}
                <span>
                  <Tags size={17} />
                  <small>التصنيف العلمي</small>
                  <strong>{item.scientific_field}</strong>
                </span>
              </div>

              <div className={styles.actions}>
                {reader.readerUrl && (
                  <a className={styles.readButton} href="#reader">
                    <BookOpen size={17} />
                    ابدأ القراءة
                    <ArrowLeft size={17} />
                  </a>
                )}
                {reader.sourceUrl && (
                  <a
                    className={styles.sourceButton}
                    href={reader.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={17} />
                    فتح المصدر
                  </a>
                )}
                {reader.downloadUrl && (
                  <a
                    className={styles.sourceButton}
                    href={reader.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download size={17} />
                    تحميل المصنَّف
                  </a>
                )}
                <button
                  type="button"
                  aria-label="مشاركة المصنف"
                  onClick={share}
                >
                  <Share2 size={17} />
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
                ملف المصنَّف
              </span>
              <h2>
                {reader.readerUrl
                  ? "قارئ المصنَّف الرقمي"
                  : "مصدر المصنَّف الرقمي"}
              </h2>
            </div>
            {reader.readerUrl && (
              <span className={styles.readerState}>
                <i />
                تصفح دون تحميل
              </span>
            )}
          </header>

          <div className={styles.readerShell}>
            <div className={styles.readerToolbar}>
              <span>
                <BookOpen size={17} />
                {shortTitle}
              </span>
              <div>
                {reader.readerUrl && (
                  <button
                    ref={readerTriggerRef}
                    type="button"
                    aria-label="العرض الكامل للقارئ"
                    onClick={() => setReaderOpen(true)}
                  >
                    <Expand size={16} />
                  </button>
                )}
                {reader.sourceUrl && (
                  <a
                    className={styles.toolbarAction}
                    href={reader.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="فتح المصدر"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
                {reader.downloadUrl && (
                  <a
                    className={styles.toolbarAction}
                    href={reader.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="تحميل الملف"
                  >
                    <Download size={16} />
                  </a>
                )}
              </div>
            </div>

            <div
              className={`${styles.readerLayout} ${!hasSidebar ? styles.readerLayoutFull : ""}`}
            >
              <div className={styles.documentArea}>
                {reader.readerUrl ? (
                  <iframe
                    className={styles.pdfFrame}
                    src={reader.readerUrl}
                    title={item.title}
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                ) : (
                  <div className={styles.readerUnavailable}>
                    <FileText size={35} />
                    <strong>
                      {reader.sourceUrl || reader.downloadUrl
                        ? "هذا المصنَّف متاح من خلال مصدره الرقمي"
                        : "لا يتوفر ملف رقمي لهذا المصنَّف"}
                    </strong>
                    {reader.sourceUrl && (
                      <a
                        href={reader.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink size={16} />
                        فتح المصدر
                      </a>
                    )}
                    {reader.downloadUrl && (
                      <a
                        href={reader.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Download size={16} />
                        تحميل المصنَّف
                      </a>
                    )}
                  </div>
                )}
              </div>

              {hasSidebar && (
                <aside className={styles.sidebar}>
                  {(item.author_name ||
                    item.publication_info ||
                    item.edition) && (
                    <div className={styles.publication}>
                      <small>بيانات النشر</small>
                      {item.publication_info && (
                        <strong>{item.publication_info}</strong>
                      )}
                      {item.author_name && (
                        <span>المؤلف: {item.author_name}</span>
                      )}
                      {item.edition && <span>{item.edition}</span>}
                    </div>
                  )}
                  {item.keywords.length > 0 && (
                    <div className={styles.keywords}>
                      <span>
                        <Tags size={16} />
                        الكلمات المفتاحية
                      </span>
                      <div>
                        {item.keywords.map((keyword) => (
                          <small key={keyword}>{keyword}</small>
                        ))}
                      </div>
                    </div>
                  )}
                  {reader.downloadUrl && (
                    <a
                      className={styles.sidebarDownload}
                      href={reader.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span>
                        <Download size={18} />
                        <span>
                          <small>نسخة رقمية</small>
                          <strong>تحميل المصنَّف</strong>
                        </span>
                      </span>
                      <ArrowLeft size={17} />
                    </a>
                  )}
                </aside>
              )}
            </div>
          </div>

          {relatedItems.length > 0 && (
            <section className={styles.related}>
              <header>
                <span>من المكتبة</span>
                <h2>مواد ذات صلة</h2>
              </header>
              <div>
                {relatedItems.map((relatedItem) => (
                  <Link
                    href={`/library/${relatedItem.slug}`}
                    key={String(relatedItem.id)}
                    prefetch={false}
                    style={
                      {
                        "--work-accent": workAccent(relatedItem),
                      } as React.CSSProperties
                    }
                  >
                    <span className={styles.relatedIcon}>
                      <LibraryWorkIcon
                        type={relatedItem.content_type}
                        size={25}
                      />
                    </span>
                    <span>
                      <small>{relatedItem.content_type}</small>
                      <strong>{relatedItem.title}</strong>
                      <em>{relatedItem.scientific_field}</em>
                    </span>
                    <ArrowLeft size={17} />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>

      {readerOpen && reader.readerUrl && (
        <div
          className={styles.fullReaderOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={`قارئ ${item.title}`}
          onKeyDown={(event) => {
            if (event.key !== "Tab") return;
            const first = closeReaderRef.current;
            const last = fullReaderFrameRef.current;
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setReaderOpen(false);
          }}
        >
          <div className={`${styles.fullReaderModal} ${styles.pdfModal}`}>
            <header className={styles.fullReaderHeader}>
              <span className={styles.fullReaderBrand}>
                <BookOpen size={21} />
                <span>
                  <small>قارئ المكتبة الرقمية</small>
                  <strong>{item.title}</strong>
                </span>
              </span>
              <button
                ref={closeReaderRef}
                type="button"
                onClick={() => setReaderOpen(false)}
                aria-label="إغلاق العرض الكامل"
              >
                <X size={20} />
              </button>
            </header>
            <iframe
              ref={fullReaderFrameRef}
              className={styles.fullPdfFrame}
              src={reader.readerUrl}
              title={`العرض الكامل: ${item.title}`}
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
      )}
    </>
  );
}
