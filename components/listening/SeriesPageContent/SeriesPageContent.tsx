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
import type { ListeningSeries } from "@/lib/listeningData";
import { toArabicDigits } from "@/lib/arabicNumbers";
import SeriesIcon from "@/components/listening/SeriesIcon/SeriesIcon";
import SubpageBackdrop from "@/components/layout/SubpageBackdrop/SubpageBackdrop";
import styles from "./SeriesPageContent.module.css";

type SeriesPageContentProps = {
  series: ListeningSeries;
};

export default function SeriesPageContent({
  series,
}: SeriesPageContentProps) {
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
            <strong>{series.shortTitle}</strong>
          </nav>

          <div className={styles.heroGrid}>
            <div
              className={styles.cover}
              style={
                { "--series-accent": series.accent } as React.CSSProperties
              }
            >
              <span>السَّمّاعات العالية</span>
              <SeriesIcon
                className={styles.coverIcon}
                slug={series.slug}
                size={68}
              />
              <small>{series.shortTitle}</small>
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
              <p>{series.description}</p>

              <div className={styles.meta}>
                <span>
                  <ListMusic size={17} />
                  <small>عدد المجالس</small>
                  <strong>
                    {toArabicDigits(series.sessions.length)} مجالس
                  </strong>
                </span>
                <span>
                  <CalendarDays size={17} />
                  <small>تاريخ السلسلة</small>
                  <strong>{series.date}</strong>
                </span>
                <span>
                  <BookOpen size={17} />
                  <small>المادة العلمية</small>
                  <strong>كتاب مرتبط</strong>
                </span>
              </div>

              <div className={styles.actions}>
                <Link
                  className={styles.startButton}
                  href={`/listening/${series.slug}/${series.sessions[0].slug}`}
                >
                  <Play size={16} fill="currentColor" />
                  ابدأ بالمجلس الأول
                  <ArrowLeft size={17} />
                </Link>
                <button type="button" aria-label="مشاركة السلسلة">
                  <Share2 size={17} />
                </button>
                <button type="button" aria-label="تحميل ملف السلسلة" disabled>
                  <Download size={17} />
                </button>
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
                  <strong>{toArabicDigits(series.sessions.length)}</strong>
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
                        String(session.number).padStart(2, "0"),
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
                    <p>{session.description}</p>
                    <span>
                      <Clock3 size={13} />
                      {session.duration}
                      <i />
                      {session.date}
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
            </div>
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.progressCard}>
              <span className={styles.progressIcon}>
                <Headphones size={20} />
              </span>
              <small>متابعة السلسلة</small>
              <strong>ابدأ رحلتك العلمية</strong>
              <p>
                يحفظ ترتيب المجالس مسارك من المجلس الأول حتى نهاية السلسلة.
              </p>
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
                <strong>{series.shortTitle}</strong>
                <span>
                  <Check size={13} />
                  مرتبط بكل المجالس
                </span>
              </div>
              <button type="button" disabled>
                يضاف الملف قريبًا
              </button>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
