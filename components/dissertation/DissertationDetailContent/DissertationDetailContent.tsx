"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
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
import { resolveReaderSource, type DissertationDetail } from "@/lib/api";
import { toArabicDigits } from "@/lib/arabicNumbers";
import styles from "./DissertationDetailContent.module.css";

type DissertationDetailContentProps = { initialData: DissertationDetail };

export default function DissertationDetailContent({
  initialData,
}: DissertationDetailContentProps) {
  const { data: dissertation, related_dissertations: related } = initialData;
  const [readerOpen, setReaderOpen] = useState(false);

  useEffect(() => {
    if (!readerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setReaderOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [readerOpen]);

  const recordCode = toArabicDigits(String(dissertation.id).padStart(3, "0"));
  const readerSource = resolveReaderSource(dissertation);
  const institution = [dissertation.college, dissertation.university]
    .filter(Boolean)
    .join("، ");
  const academicLabel = [dissertation.degree, dissertation.specialization]
    .filter(Boolean)
    .join(" في ");

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
              {(dissertation.participation_type || dissertation.degree) && (
                <div className={styles.heroLabels}>
                  {dissertation.participation_type && (
                    <span>
                      <Sparkles size={14} />
                      {dissertation.participation_type}
                    </span>
                  )}
                  {dissertation.degree && <span>{dissertation.degree}</span>}
                </div>
              )}
              <h1>{dissertation.title}</h1>
              {(academicLabel || institution) && (
                <p>{[academicLabel, institution].filter(Boolean).join("، ")}</p>
              )}

              <div className={styles.heroMeta}>
                {dissertation.researcher_name && (
                  <span>
                    <UserRound size={17} />
                    <small>الباحث</small>
                    <strong>{dissertation.researcher_name}</strong>
                  </span>
                )}
                {dissertation.university && (
                  <span>
                    <Landmark size={17} />
                    <small>الجامعة</small>
                    <strong>{dissertation.university}</strong>
                  </span>
                )}
                {dissertation.year !== undefined && (
                  <span>
                    <CalendarDays size={17} />
                    <small>العام</small>
                    <strong>{toArabicDigits(dissertation.year)}هـ</strong>
                  </span>
                )}
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
              <h2>بيانات الدراسة وملفها العلمي</h2>
            </div>
            <div className={styles.sectionActions}>
              {readerSource?.embedUrl && (
                <button type="button" onClick={() => setReaderOpen(true)}>
                  <BookOpen size={17} />
                  اقرأ الرسالة
                </button>
              )}
              {readerSource && (
                <a
                  className={styles.sourceAction}
                  href={readerSource.actionUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink size={16} />
                  فتح الملف
                </a>
              )}
              <Link href="/dissertations">
                العودة إلى جميع الرسائل
                <ArrowLeft size={16} />
              </Link>
            </div>
          </header>

          <div className={styles.studyGrid}>
            {dissertation.abstract && (
              <article className={styles.summaryCard}>
                <div className={styles.summaryTopline}>
                  <span>
                    <BookOpen size={18} />
                    ملخص الرسالة
                  </span>
                  <small>الملخص العلمي</small>
                </div>
                <p>{dissertation.abstract}</p>
              </article>
            )}

            {(dissertation.participation_type ||
              dissertation.participation_description ||
              academicLabel ||
              institution) && (
              <div className={styles.detailCards}>
                {(dissertation.participation_type ||
                  dissertation.participation_description) && (
                  <div className={styles.roleCard}>
                    <span className={styles.roleIcon}>
                      <UsersRound size={24} />
                    </span>
                    <div>
                      <small>دور فضيلة الشيخ</small>
                      {dissertation.participation_type && (
                        <h3>{dissertation.participation_type}</h3>
                      )}
                      {dissertation.participation_description && (
                        <p>{dissertation.participation_description}</p>
                      )}
                    </div>
                    <CheckCircle2 size={20} />
                  </div>
                )}

                {(academicLabel ||
                  institution ||
                  dissertation.specialization) && (
                  <article className={styles.descriptionCard}>
                    <span className={styles.descriptionIcon}>
                      <FileText size={23} />
                    </span>
                    <div>
                      <small>بيانات الدراسة</small>
                      {academicLabel && <h3>{academicLabel}</h3>}
                      {institution && <p>{institution}</p>}
                    </div>
                    {dissertation.specialization && (
                      <div className={styles.subjectBand}>
                        <span>
                          <Library size={16} />
                          المجال العلمي
                        </span>
                        <strong>{dissertation.specialization}</strong>
                      </div>
                    )}
                  </article>
                )}
              </div>
            )}

            {!readerSource && (
              <div className={styles.fileUnavailable}>
                <FileText size={28} />
                <span>
                  <strong>لا يتوفر ملف رقمي لهذه الرسالة</strong>
                  <small>
                    تظل البيانات الأكاديمية المنشورة متاحة في السجل.
                  </small>
                </span>
              </div>
            )}
          </div>

          {related.length > 0 && (
            <section className={styles.related}>
              <header>
                <span>من السجل الأكاديمي</span>
                <h2>رسائل علمية ذات صلة</h2>
              </header>
              <div>
                {related.map((item) => (
                  <Link
                    href={`/dissertations/${item.slug || item.id}`}
                    key={String(item.id)}
                  >
                    <span className={styles.relatedIcon}>
                      <GraduationCap size={23} />
                    </span>
                    <span>
                      {(item.participation_type || item.degree) && (
                        <small>
                          {[item.participation_type, item.degree]
                            .filter(Boolean)
                            .join(" · ")}
                        </small>
                      )}
                      <strong>{item.title}</strong>
                      {item.specialization && <em>{item.specialization}</em>}
                    </span>
                    <ArrowLeft size={17} />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>

      {readerOpen && readerSource?.embedUrl && (
        <div
          className={styles.readerOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={`قارئ رسالة ${dissertation.title}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setReaderOpen(false);
          }}
        >
          <div className={`${styles.readerModal} ${styles.fileModal}`}>
            <header className={styles.readerHeader}>
              <span className={styles.readerBrand}>
                <BookOpen size={21} />
                <span>
                  <small>قارئ الرسائل العلمية</small>
                  <strong>{dissertation.title}</strong>
                </span>
              </span>
              <span />
              <button
                type="button"
                onClick={() => setReaderOpen(false)}
                aria-label="إغلاق القارئ"
              >
                <X size={20} />
              </button>
            </header>
            <iframe
              className={styles.fileFrame}
              src={readerSource.embedUrl}
              title={dissertation.title}
            />
          </div>
        </div>
      )}
    </>
  );
}
