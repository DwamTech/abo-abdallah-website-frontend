import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Headphones,
  ListMusic,
  Play,
} from "lucide-react";
import SeriesIcon from "@/components/listening/SeriesIcon/SeriesIcon";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import {
  listeningSeries,
  totalListeningSessions,
} from "@/lib/listeningData";
import { toArabicDigits } from "@/lib/arabicNumbers";
import styles from "./ListeningSection.module.css";

export default function ListeningSection() {
  const featured = listeningSeries[0];

  return (
    <section id="listening" className={styles.section}>
      <div className={styles.sectionDivider}>
        <SectionDivider variant="audio" />
      </div>

      <div className={styles.ambientWave} aria-hidden="true">
        {Array.from({ length: 36 }).map((_, index) => (
          <i key={index} />
        ))}
      </div>

      <div className={styles.container}>
        <header className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>
              <Headphones size={14} strokeWidth={1.5} />
              السَّمّاعات العالية
            </span>
            <h2>
              مجالس السماع
              <span>والمواد الصوتية</span>
            </h2>
          </div>
          <div className={styles.headingCopy}>
            <p>
              تجربة علمية تجمع المجلس المسموع بنسخة الكتاب، ليقرأ الطالب
              ويستمع ويتابع تسلسل السلسلة في مكان واحد.
            </p>
            <Link href="/listening">
              استكشف جميع السلاسل
              <ArrowLeft size={17} />
            </Link>
          </div>
        </header>

        <div className={styles.showcase}>
          <Link
            className={styles.featured}
            href={`/listening/${featured.slug}`}
          >
            <div className={styles.cover}>
              <span className={styles.coverTop}>مجالس السماع</span>
              <SeriesIcon
                className={styles.coverIcon}
                slug={featured.slug}
                size={59}
              />
              <span className={styles.coverTitle}>{featured.shortTitle}</span>
              <i />
            </div>

            <div className={styles.featuredCopy}>
              <span className={styles.status}>
                <i />
                سلسلة مختارة
              </span>
              <small>{featured.category}</small>
              <h3>{featured.title}</h3>
              <p>{featured.description}</p>

              <div className={styles.meta}>
                <span>
                  <ListMusic size={15} />
                  {toArabicDigits(featured.sessions.length)} مجالس
                </span>
                <span>
                  <CalendarDays size={15} />
                  {featured.date}
                </span>
                <span>
                  <BookOpen size={15} />
                  قراءة واستماع
                </span>
              </div>

              <span className={styles.playAction}>
                <i>
                  <Play size={17} fill="currentColor" />
                </i>
                ابدأ متابعة السلسلة
                <ArrowLeft size={17} />
              </span>
            </div>
          </Link>

          <div className={styles.seriesList}>
            {listeningSeries.slice(1, 4).map((series, index) => (
              <Link
                key={series.slug}
                className={styles.seriesCard}
                href={`/listening/${series.slug}`}
              >
                <span className={styles.seriesIndex}>
                  {toArabicDigits(String(index + 2).padStart(2, "0"))}
                </span>
                <span
                  className={styles.miniCover}
                  style={{ "--series-accent": series.accent } as React.CSSProperties}
                >
                  <SeriesIcon slug={series.slug} size={25} />
                </span>
                <span className={styles.seriesCopy}>
                  <small>{series.category}</small>
                  <strong>{series.shortTitle}</strong>
                  <span>
                    {toArabicDigits(series.sessions.length)} مجالس مرتبة
                  </span>
                </span>
                <span className={styles.cardArrow}>
                  <ArrowLeft size={17} />
                </span>
              </Link>
            ))}

            <div className={styles.libraryStat}>
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
                <Headphones size={20} />
                تجربة متكاملة
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
