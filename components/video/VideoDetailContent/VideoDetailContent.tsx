import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock3, Film, Home, Play, Share2 } from "lucide-react";
import type { VideoItem } from "@/lib/videoData";
import SubpageBackdrop from "@/components/layout/SubpageBackdrop/SubpageBackdrop";
import styles from "./VideoDetailContent.module.css";

export default function VideoDetailContent({ video, related }: { video: VideoItem; related: VideoItem[] }) {
  return <>
    <section className={styles.hero}><div className={styles.heroInner}>
      <nav><Link href="/"><Home size={13}/> الرئيسية</Link><ArrowLeft size={13}/><Link href="/videos">المرئيات</Link><ArrowLeft size={13}/><span>{video.title}</span></nav>
      <span className={styles.category}><Film size={15}/>{video.category}</span><h1>{video.title}</h1><p>{video.description}</p>
      <div className={styles.meta}><span><Clock3 size={15}/>{video.duration}</span><i/><span><CalendarDays size={15}/>{video.date}</span></div>
    </div></section>

    <section className={styles.study}><SubpageBackdrop/><div className={styles.container}>
      <div className={styles.playerColumn}><header><div><span>المشاهدة الآن</span><h2>{video.title}</h2></div><button type="button" aria-label="مشاركة المادة"><Share2 size={18}/></button></header>
        <div className={styles.player}>{video.videoUrl ? <video controls preload="metadata" src={video.videoUrl}>متصفحك لا يدعم تشغيل الفيديو.</video> : <div className={styles.playerPlaceholder}><span><Play size={34} fill="currentColor"/></span><strong>مشغل الدرس المرئي</strong><small>يُربط ملف الفيديو أو رابط البث من بيانات المادة</small></div>}<span className={styles.duration}>{video.duration}</span></div>
      </div>
      <aside className={styles.description}><span>عن هذه المادة</span><h2>وصف الدرس المرئي</h2><p>{video.description}</p><dl><div><dt>نوع المادة</dt><dd>{video.category}</dd></div><div><dt>مدة المشاهدة</dt><dd>{video.duration}</dd></div><div><dt>تاريخ النشر</dt><dd>{video.date}</dd></div></dl></aside>
    </div>
    <div className={styles.related}><header><span>مختارات ذات صلة</span><h2>مرئيات قد تهمك</h2></header><div>{related.map(item=><Link href={`/videos/${item.slug}`} key={item.slug}><span className={styles.relatedPlay}><Play size={18} fill="currentColor"/></span><small>{item.category}</small><h3>{item.title}</h3><footer><span>{item.duration}</span><ArrowLeft size={16}/></footer></Link>)}</div></div>
    </section>
  </>;
}
