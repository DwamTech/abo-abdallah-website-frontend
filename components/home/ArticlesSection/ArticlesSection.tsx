import Link from "next/link";
import { ArrowLeft, BookOpenText, Clock3, Feather, Quote } from "lucide-react";
import articles from "@/data/articles.json";
import styles from "./ArticlesSection.module.css";

export default function ArticlesSection() {
  const [featured, ...rest] = articles;
  return <section className={styles.section} id="articles"><span className={styles.paperLines} aria-hidden="true"/><div className={styles.container}>
    <header className={styles.heading}><div><span><Feather size={16}/> أوراق علمية منتقاة</span><h2>المقالات <em>والدراسات</em></h2></div><p>قراءات علمية مؤصلة في الحديث وعلومه، صيغت لتقريب المسائل وبناء المعرفة بهدوء ووضوح.</p></header>
    <div className={styles.editorial}>
      <Link href={`/articles/${featured.slug}`} className={styles.featured}>
        <span className={styles.featuredMark}><Quote size={34}/></span><div className={styles.featuredBody}><small>{featured.category} · مقالة مختارة</small><h3>{featured.title}</h3><p>{featured.excerpt}</p><footer><span><Clock3 size={14}/>{featured.readingTime}</span><strong>اقرأ المقالة <ArrowLeft size={17}/></strong></footer></div><span className={styles.verticalWord}>مقالة</span>
      </Link>
      <div className={styles.stack}>{rest.slice(0,5).map((article,index)=><Link key={article.slug} href={`/articles/${article.slug}`}><span className={styles.number}>٠{index+2}</span><span className={styles.stackIcon}><BookOpenText size={19}/></span><div><small>{article.category}</small><h3>{article.title}</h3><p>{article.excerpt}</p></div><ArrowLeft className={styles.arrow} size={17}/></Link>)}</div>
    </div>
    <Link className={styles.archiveLink} href="/articles">أرشيف المقالات <ArrowLeft size={17}/></Link>
  </div></section>;
}
