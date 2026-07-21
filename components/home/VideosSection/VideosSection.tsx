import Link from "next/link";
import { ArrowLeft, Play, Video } from "lucide-react";
import videos from "@/data/videos.json";
import styles from "./VideosSection.module.css";

export default function VideosSection() {
  const featured = videos[0];
  return <section className={styles.section} id="videos"><div className={styles.container}>
    <header className={styles.heading}><span><Video size={16}/> المكتبة المرئية</span><h2>المرئيات <b>واللقاءات العلمية</b></h2><p>دروس ومحاضرات ولقاءات مرئية، مرتبة لتبقى المعرفة قريبة من طالب العلم.</p></header>
    <div className={styles.stage}><Link href={`/videos/${featured.slug}`} className={styles.featured}><span className={styles.play}><Play fill="currentColor" size={28}/></span><div><small>{featured.category}</small><h3>{featured.title}</h3><p>{featured.description}</p><strong>شاهد المادة <ArrowLeft size={17}/></strong></div><i>{featured.duration}</i></Link><div className={styles.list}>{videos.slice(1,6).map((video,index)=><Link key={video.slug} href={`/videos/${video.slug}`}><span>٠{index+2}</span><Play fill="currentColor" size={13}/><div><small>{video.category}</small><h3>{video.title}</h3></div><em>{video.duration}</em></Link>)}</div></div>
    <Link className={styles.all} href="/videos">تصفّح جميع المرئيات <ArrowLeft size={18}/></Link>
  </div></section>;
}
