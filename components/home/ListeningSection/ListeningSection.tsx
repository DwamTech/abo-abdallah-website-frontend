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
import { apiErrorMessage, getListeningHome } from "@/lib/api";
import { toArabicDigits } from "@/lib/arabicNumbers";
import { getListeningVisual } from "@/lib/listeningVisuals";
import styles from "./ListeningSection.module.css";

export default async function ListeningSection() {
  let response: Awaited<ReturnType<typeof getListeningHome>> | null = null;
  let error: string | null = null;

  try {
    response = await getListeningHome();
  } catch (requestError) {
    error = apiErrorMessage(requestError);
  }

  const seriesItems = response?.data.slice(0, 4) ?? [];
  const featured = seriesItems[0];
  const stats = response?.stats;

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
              أقراء وتدبر
            </span>
            <h2>
              مجالس السماع
              <span>والمواد الصوتية</span>
            </h2>
          </div>
          <div className={styles.headingCopy}>
            <p>
              تجربة علمية تجمع المجلس المسموع بنسخة الكتاب، ليقرأ الطالب ويستمع
              ويتابع تسلسل السلسلة في مكان واحد.
            </p>
            <Link href="/listening">
              استكشف جميع السلاسل
              <ArrowLeft size={17} />
            </Link>
          </div>
        </header>

        <div className={styles.showcase}>
          {featured ? (
            <Link
              className={styles.featured}
              href={`/listening/${featured.slug}`}
            >
              <div className={styles.cover}>
                <span className={styles.coverTop}>مجالس السماع</span>
                <SeriesIcon
                  className={styles.coverIcon}
                  visualVariant={featured.visual_variant}
                  size={59}
                />
                <span className={styles.coverTitle}>
                  {featured.short_title}
                </span>
                <i />
              </div>

              <div className={styles.featuredCopy}>
                <span className={styles.status}>
                  <i />
                  سلسلة مختارة
                </span>
                <small>{featured.category}</small>
                <h3>{featured.title}</h3>
                <p>
                  {featured.description ||
                    "سلسلة علمية صوتية مرتبة للقراءة والاستماع."}
                </p>

                <div className={styles.meta}>
                  <span>
                    <ListMusic size={15} />
                    {toArabicDigits(featured.sessions_count)} مجالس
                  </span>
                  <span>
                    <CalendarDays size={15} />
                    {featured.period_label || "—"}
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
          ) : (
            <div
              className={styles.sectionState}
              role={error ? "alert" : "status"}
            >
              <Headphones size={28} />
              <strong>
                {error
                  ? "تعذّر تحميل مجالس السماع"
                  : "لا توجد سلاسل منشورة بعد"}
              </strong>
              <p>{error || "ستظهر السلاسل هنا فور نشرها من لوحة الإدارة."}</p>
              <Link href="/listening">فتح صفحة مجالس السماع</Link>
            </div>
          )}

          {featured && (
            <div className={styles.seriesList}>
              {seriesItems.slice(1, 4).map((series, index) => {
                const visual = getListeningVisual(series.visual_variant);

                return (
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
                      style={
                        {
                          "--series-accent": visual.accent,
                        } as React.CSSProperties
                      }
                    >
                      <SeriesIcon
                        visualVariant={series.visual_variant}
                        size={25}
                      />
                    </span>
                    <span className={styles.seriesCopy}>
                      <small>{series.category}</small>
                      <strong>{series.short_title}</strong>
                      <span>
                        {toArabicDigits(series.sessions_count)} مجالس مرتبة
                      </span>
                    </span>
                    <span className={styles.cardArrow}>
                      <ArrowLeft size={17} />
                    </span>
                  </Link>
                );
              })}

              <div className={styles.libraryStat}>
                <span>
                  <strong>
                    {stats ? toArabicDigits(stats.series_count) : "—"}
                  </strong>
                  سلاسل علمية
                </span>
                <i />
                <span>
                  <strong>
                    {stats ? toArabicDigits(stats.sessions_count) : "—"}
                  </strong>
                  مجلسًا مرتبًا
                </span>
                <i />
                <span>
                  <Headphones size={20} />
                  تجربة متكاملة
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
