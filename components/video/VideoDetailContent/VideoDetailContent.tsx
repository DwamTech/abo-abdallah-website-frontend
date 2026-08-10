import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  ExternalLink,
  Film,
  Home,
  Play,
} from "lucide-react";
import { toArabicDigits } from "@/lib/arabicNumbers";
import {
  resolveScientificVideoPlayback,
  type ScientificVideoCard,
  type ScientificVideoItem,
} from "@/lib/scientificVideosApi";
import SubpageBackdrop from "@/components/layout/SubpageBackdrop/SubpageBackdrop";
import { ShareButton } from "@/components/content/ShareButton/ShareButton";
import TrackedViewCount from "@/components/content/ViewCount/TrackedViewCount";
import ViewCount from "@/components/content/ViewCount/ViewCount";
import VideoEngagement from "./VideoEngagement";
import AdaptiveVideoPlayer from "@/components/video/AdaptiveVideoPlayer/AdaptiveVideoPlayer";
import styles from "./VideoDetailContent.module.css";
import playerStyles from "./VideoPlayerState.module.css";

export default function VideoDetailContent({
  video,
  related,
}: {
  video: ScientificVideoItem;
  related: ScientificVideoCard[];
}) {
  const playback = resolveScientificVideoPlayback(video);
  const duration = toArabicDigits(video.duration_label);
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <nav>
            <Link href="/">
              <Home size={13} /> الرئيسية
            </Link>
            <ArrowLeft size={13} />
            <Link href="/videos">المرئيات</Link>
            <ArrowLeft size={13} />
            <span>{video.title}</span>
          </nav>
          <span className={styles.category}>
            <Film size={15} />
            {video.category}
          </span>
          <h1>{video.title}</h1>
          <p>{video.description}</p>
          <div className={styles.meta}>
            <span>
              <Clock3 size={15} />
              {duration}
            </span>
            <i />
            <span>
              <CalendarDays size={15} />
              {video.date_label}
            </span>
            <i />
            <TrackedViewCount
              endpoint={`/api/scientific-videos/items/${encodeURIComponent(video.slug)}/view`}
              initialCount={video.views_count}
              tone="light"
            />
          </div>
        </div>
      </section>

      <section className={styles.study}>
        <SubpageBackdrop />
        <div className={styles.container}>
          <div className={styles.playerColumn}>
            <header>
              <div>
                <span>المشاهدة الآن</span>
                <h2>{video.title}</h2>
              </div>
              <VideoEngagement downloadUrl={video.download_url} />
            </header>
            {playback.kind === "video" ? (
              <AdaptiveVideoPlayer
                src={playback.url}
                poster={video.thumbnail_url}
                duration={duration}
              />
            ) : (
              <div className={styles.player}>
                {playback.kind === "embed" ? (
                  <iframe
                    className={playerStyles.frame}
                    src={playback.url}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : playback.kind === "external" ? (
                  <div className={playerStyles.external}>
                    <span>
                      <ExternalLink size={31} />
                    </span>
                    <strong>المادة متاحة على منصة خارجية</strong>
                    <small>
                      يُفتح الرابط الأصلي في نافذة جديدة مع الحفاظ على هذه
                      الصفحة.
                    </small>
                    <a href={playback.url} target="_blank" rel="noreferrer">
                      مشاهدة المادة
                    </a>
                  </div>
                ) : (
                  <div className={styles.playerPlaceholder}>
                    <span>
                      <Play size={34} fill="currentColor" />
                    </span>
                    <strong>مشغل الدرس المرئي</strong>
                    <small>
                      يُفعّل فور إضافة ملف الفيديو أو رابط المشاهدة من لوحة
                      الإدارة
                    </small>
                  </div>
                )}
                <span className={styles.duration}>{duration}</span>
              </div>
            )}
          </div>
          <aside className={styles.description}>
            <span>عن هذه المادة</span>
            <h2>وصف الدرس المرئي</h2>
            <p>{video.description}</p>
            <dl>
              <div>
                <dt>نوع المادة</dt>
                <dd>{video.category}</dd>
              </div>
              <div>
                <dt>مدة المشاهدة</dt>
                <dd>{duration}</dd>
              </div>
              <div>
                <dt>تاريخ النشر</dt>
                <dd>{video.date_label}</dd>
              </div>
            </dl>
          </aside>
        </div>
        {related.length > 0 && (
          <div className={styles.related}>
            <header>
              <span>مختارات ذات صلة</span>
              <h2>مرئيات قد تهمك</h2>
            </header>
            <div>
              {related.map((item) => {
                const href = `/videos/${item.slug}`;

                return (
                  <article className={styles.relatedCard} key={item.slug}>
                    <Link
                      aria-label={`مشاهدة المادة: ${item.title}`}
                      className={styles.relatedLink}
                      href={href}
                    />
                    <span className={styles.relatedPlay}>
                      <Play size={18} fill="currentColor" />
                    </span>
                    <small>{item.category}</small>
                    <h3>{item.title}</h3>
                    <footer>
                      <span>{toArabicDigits(item.duration_label)}</span>
                      <ViewCount count={item.views_count} tone="light" />
                      <ShareButton
                        ariaLabel={`نسخ رابط المادة المرئية: ${item.title}`}
                        className={styles.relatedShare}
                        href={href}
                        iconOnly
                      />
                      <ArrowLeft size={16} />
                    </footer>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
