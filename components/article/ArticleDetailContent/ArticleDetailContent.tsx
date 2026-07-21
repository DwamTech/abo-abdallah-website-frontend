import Link from "next/link";
import { ArrowLeft, Bookmark, CalendarDays, Clock3, Feather, Home, Quote, Share2 } from "lucide-react";
import type { ArticleItem } from "@/lib/articleData";
import SubpageBackdrop from "@/components/layout/SubpageBackdrop/SubpageBackdrop";
import styles from "./ArticleDetailContent.module.css";

export default function ArticleDetailContent({article,related}:{article:ArticleItem;related:ArticleItem[]}){return <>
  <section className={styles.hero}><div className={styles.heroInner}><nav><Link href="/"><Home size={13}/>الرئيسية</Link><ArrowLeft size={13}/><Link href="/articles">المقالات</Link><ArrowLeft size={13}/><span>{article.category}</span></nav><span className={styles.category}><Feather size={15}/>{article.category}</span><h1>{article.title}</h1><p>{article.excerpt}</p><div className={styles.meta}><span><Clock3 size={15}/>{article.readingTime}</span><i/><span><CalendarDays size={15}/>{article.date}</span></div></div></section>
  <section className={styles.articleSection}><SubpageBackdrop/><div className={styles.layout}><article className={styles.article}><header><span><Quote size={24}/></span><p>{article.excerpt}</p></header>{article.sections.map(section=><section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph,index)=><p key={index}>{paragraph}</p>)}</section>)}<footer><span>الكلمات المفتاحية</span><div>{article.keywords.map(keyword=><i key={keyword}>{keyword}</i>)}</div></footer></article><aside><div className={styles.actions}><button type="button"><Bookmark size={18}/>حفظ المقالة</button><button type="button"><Share2 size={18}/>مشاركة</button></div><div className={styles.readingCard}><Feather size={25}/><small>مقالة علمية</small><strong>{article.readingTime}</strong><p>قراءة هادئة ومركزة للمادة العلمية.</p></div></aside></div>
  <div className={styles.related}><header><span>من الأرشيف العلمي</span><h2>مقالات ذات صلة</h2></header><div>{related.map(item=><Link href={`/articles/${item.slug}`} key={item.slug}><small>{item.category}</small><h3>{item.title}</h3><p>{item.excerpt}</p><footer><span>{item.readingTime}</span><ArrowLeft size={16}/></footer></Link>)}</div></div>
  </section>
  </>}
