import Link from "next/link";
import {
  AudioLines,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  Download,
  Headphones,
  Home,
  ListMusic,
  Play,
  Radio,
  Share2,
} from "lucide-react";
import { resolveReaderSource, type ListeningSeriesDetail } from "@/lib/api";
import { toArabicDigits } from "@/lib/arabicNumbers";
import { getListeningVisual } from "@/lib/listeningVisuals";
import SeriesIcon from "@/components/listening/SeriesIcon/SeriesIcon";
import SubpageBackdrop from "@/components/layout/SubpageBackdrop/SubpageBackdrop";
import styles from "./SeriesPageContent.module.css";

type SeriesPageContentProps = {
  series: ListeningSeriesDetail;
};

export default function SeriesPageContent({ series }: SeriesPageContentProps) {
  const visual = getListeningVisual(series.visual_variant);
  const firstSessionSlug =
    series.first_session_slug || series.sessions[0]?.slug;
  const bookSource = resolveReaderSource({
    source_type: series.book_source_type,
    file_url: series.book_url,
    source_link: series.book_url,
  });

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroWave} aria-hidden="true">
          {Array.from({ length: 32 }).map((_, index) => (
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
            <Link href="/listening">مجالس السماع</Link>
            <span>/</span>
            <strong>{series.short_title}</strong>
          </nav>

          <div className={styles.heroGrid}>
            <div
              className={styles.cover}
              style={
                { "--series-accent": visual.accent } as React.CSSProperties
              }
            >
              <span>أقراء وتدبر</span>
              <SeriesIcon
                className={styles.coverIcon}
                visualVariant={series.visual_variant}
                size={68}
              />
              <small>{series.short_title}</small>
              <i />
              <em>قراءة · سماع · إسناد</em>
            </div>

            <div className={styles.heroCopy}>
              <span className={styles.category}>
                <Headphones size={14} />
                {series.category}
              </span>
              <span className={styles.heroStatus}>
                <i />
                سلسلة صوتية متصلة
              </span>
              <h1>{series.title}</h1>
              <p>
                {series.description ||
                  "سلسلة علمية صوتية مرتبة للقراءة والاستماع."}
              </p>

              <div className={styles.meta}>
                <span>
                  <ListMusic size={17} />
                  <small>عدد المجالس</small>
                  <strong>{toArabicDigits(series.sessions_count)} مجالس</strong>
                </span>
                <span>
                  <CalendarDays size={17} />
                  <small>تاريخ السلسلة</small>
                  <strong>{series.period_label || "—"}</strong>
                </span>
                <span>
                  <BookOpen size={17} />
                  <small>المادة العلمية</small>
                  <strong>{bookSource ? "كتاب مرتبط" : "غير مرفق"}</strong>
                </span>
              </div>

              <div className={styles.actions}>
                {firstSessionSlug ? (
                  <Link
                    className={styles.startButton}
                    href={`/listening/${series.slug}/${firstSessionSlug}`}
                  >
                    <Play size={16} fill="currentColor" />
                    ابدأ بالمجلس الأول
                    <ArrowLeft size={17} />
                  </Link>
                ) : (
                  <span
                    className={`${styles.startButton} ${styles.disabledStart}`}
                  >
                    <Play size={16} />
                    لا توجد مجالس منشورة
                  </span>
                )}
                <button type="button" aria-label="مشاركة السلسلة">
                  <Share2 size={17} />
                </button>
                {bookSource && series.book_download_allowed ? (
                  <a
                    className={styles.iconAction}
                    href={bookSource.actionUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    aria-label="تحميل ملف السلسلة"
                  >
                    <Download size={17} />
                  </a>
                ) : (
                  <button type="button" aria-label="تحميل ملف السلسلة" disabled>
                    <Download size={17} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sessions}>
        <SubpageBackdrop />
        <div className={styles.sessionsInner}>
          <div className={styles.mainColumn}>
            <header className={styles.sectionHead}>
              <div>
                <span>
                  <AudioLines size={15} />
                  المحتوى المتسلسل
                </span>
                <h2>مجالس السلسلة</h2>
              </div>
              <div className={styles.sequenceSummary}>
                <span>
                  <strong>{toArabicDigits(series.sessions_count)}</strong>
                  مجالس علمية
                </span>
                <i />
                <span>
                  <Radio size={14} />
                  مرتبة من البداية للنهاية
                </span>
              </div>
            </header>

            <div className={styles.learningPath}>
              {series.sessions.map((session, index) => (
                <Link
                  className={styles.sessionCard}
                  href={`/listening/${series.slug}/${session.slug}`}
                  key={session.slug}
                >
                  <span className={styles.pathStep}>
                    <small>المجلس</small>
                    <strong>
                      {toArabicDigits(
                        String(session.sequence_number).padStart(2, "0"),
                      )}
                    </strong>
                    <i />
                  </span>

                  <span className={styles.sessionCopy}>
                    <span className={styles.sessionTopline}>
                      <small>
                        {index === 0
                          ? "نقطة البداية"
                          : index === series.sessions.length - 1
                            ? "ختام السلسلة"
                            : "ضمن مسار السلسلة"}
                      </small>
                    </span>
                    <strong>{session.title}</strong>
                    <p>
                      {session.description ||
                        "مجلس صوتي ضمن هذه السلسلة العلمية."}
                    </p>
                    <span>
                      <Clock3 size={13} />
                      {session.duration_label ||
                        (session.duration_minutes
                          ? `${toArabicDigits(session.duration_minutes)} دقيقة`
                          : "—")}
                      <i />
                      {session.date_label || "—"}
                    </span>
                  </span>

                  <span className={styles.miniWave} aria-hidden="true">
                    {Array.from({ length: 13 }).map((_, waveIndex) => (
                      <i key={waveIndex} />
                    ))}
                  </span>

                  <span className={styles.sessionAction}>
                    <b>
                      <Play size={16} fill="currentColor" />
                    </b>
                  </span>
                </Link>
              ))}
              {series.sessions.length === 0 && (
                <div className={styles.emptySessions}>
                  <Headphones size={24} />
                  <strong>لا توجد مجالس منشورة بعد</strong>
                  <p>ستظهر المجالس هنا فور نشرها من لوحة الإدارة.</p>
                </div>
              )}
            </div>
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.progressCard}>
              <span className={styles.progressIcon}>
                <Headphones size={20} />
              </span>
              <small>متابعة السلسلة</small>
              <strong>ابدأ رحلتك العلمية</strong>
              <p>يحفظ ترتيب المجالس مسارك من المجلس الأول حتى نهاية السلسلة.</p>
              <div className={styles.progressTrack}>
                <i />
              </div>
              <span className={styles.progressLabel}>٠٪ مكتمل</span>
            </div>

            <div className={styles.bookCard}>
              <span className={styles.bookIcon}>
                <BookOpen size={22} />
              </span>
              <div>
                <small>ملف الكتاب</small>
                <strong>{series.short_title}</strong>
                <span>
                  <Check size={13} />
                  {bookSource ? "مرتبط بكل المجالس" : "لم يرفق بعد"}
                </span>
              </div>
              {bookSource ? (
                <a href={bookSource.actionUrl} target="_blank" rel="noreferrer">
                  فتح ملف الكتاب
                </a>
              ) : (
                <button type="button" disabled>
                  يضاف الملف قريبًا
                </button>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
