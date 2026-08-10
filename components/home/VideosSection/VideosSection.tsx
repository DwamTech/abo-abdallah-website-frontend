import Link from "next/link";
import { ArrowLeft, Play, Video } from "lucide-react";
import { toArabicDigits } from "@/lib/arabicNumbers";
import { ShareButton } from "@/components/content/ShareButton/ShareButton";
import ViewCount from "@/components/content/ViewCount/ViewCount";
import {
  getScientificVideosHome,
  scientificVideosErrorMessage,
} from "@/lib/scientificVideosApi";
import styles from "./VideosSection.module.css";
import stateStyles from "./VideosSectionState.module.css";

export default async function VideosSection() {
  let videos: Awaited<ReturnType<typeof getScientificVideosHome>>["data"] = [];
  let error: string | null = null;
  try {
    videos = (await getScientificVideosHome()).data;
  } catch (requestError) {
    error = scientificVideosErrorMessage(requestError);
  }
  const featured = videos[0];
  return (
    <section className={styles.section} id="videos">
      <div className={styles.container}>
        <header className={styles.heading}>
          <span>
            <Video size={16} /> المكتبة المرئية
          </span>
          <h2>
            المرئيات <b>واللقاءات العلمية</b>
          </h2>
          <p>
            دروس ومحاضرات ولقاءات مرئية، مرتبة لتبقى المعرفة قريبة من طالب
            العلم.
          </p>
        </header>
        {featured ? (
          <div className={styles.stage}>
            <article className={styles.featured}>
              <Link
                aria-label={`مشاهدة المادة: ${featured.title}`}
                className={styles.cardLink}
                href={`/videos/${featured.slug}`}
              />
              <span className={styles.play}>
                <Play fill="currentColor" size={28} />
              </span>
              <div>
                <small>{featured.category}</small>
                <h3>{featured.title}</h3>
                <p>{featured.description}</p>
                <strong>
                  شاهد المادة <ArrowLeft size={17} />
                </strong>
                <ViewCount count={featured.views_count} tone="light" />
              </div>
              <ShareButton
                ariaLabel={`نسخ رابط المادة المرئية: ${featured.title}`}
                className={styles.featuredShare}
                href={`/videos/${featured.slug}`}
                iconOnly
              />
              <i>{toArabicDigits(featured.duration_label)}</i>
            </article>
            <div className={styles.list}>
              {videos.slice(1, 6).map((video, index) => {
                const href = `/videos/${video.slug}`;

                return (
                <article className={styles.videoCard} key={video.slug}>
                  <Link
                    aria-label={`مشاهدة المادة: ${video.title}`}
                    className={styles.cardLink}
                    href={href}
                  />
                  <span>
                    {toArabicDigits(String(index + 2).padStart(2, "0"))}
                  </span>
                  <Play fill="currentColor" size={13} />
                  <div>
                    <small>{video.category}</small>
                    <h3>{video.title}</h3>
                    <ViewCount count={video.views_count} tone="light" />
                  </div>
                  <ShareButton
                    ariaLabel={`نسخ رابط المادة المرئية: ${video.title}`}
                    className={styles.listShare}
                    href={href}
                    iconOnly
                  />
                  <em>{toArabicDigits(video.duration_label)}</em>
                </article>
                );
              })}
            </div>
          </div>
        ) : (
          <div
            className={stateStyles.sectionState}
            role={error ? "alert" : "status"}
          >
            <Video size={30} />
            <strong>
              {error ? "تعذّر تحميل المرئيات" : "لا توجد مرئيات منشورة بعد"}
            </strong>
            <p>
              {error || "ستظهر المواد المرئية هنا فور نشرها من لوحة الإدارة."}
            </p>
            <Link href="/videos">فتح المكتبة المرئية</Link>
          </div>
        )}
        <Link className={styles.all} href="/videos">
          تصفّح جميع المرئيات <ArrowLeft size={18} />
        </Link>
      </div>
    </section>
  );
}
