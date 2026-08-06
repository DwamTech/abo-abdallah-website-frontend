import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Feather,
  Home,
  Quote,
} from "lucide-react";
import type { SiteArticle, SiteArticleCard } from "@/lib/siteArticlesApi";
import ArticleActions from "@/components/article/ArticleActions/ArticleActions";
import SubpageBackdrop from "@/components/layout/SubpageBackdrop/SubpageBackdrop";
import styles from "./ArticleDetailContent.module.css";

export default function ArticleDetailContent({
  article,
  related,
}: {
  article: SiteArticle;
  related: SiteArticleCard[];
}) {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <nav>
            <Link href="/">
              <Home size={13} />
              الرئيسية
            </Link>
            <ArrowLeft size={13} />
            <Link href="/articles">المقالات</Link>
            <ArrowLeft size={13} />
            <span>{article.category}</span>
          </nav>
          <span className={styles.category}>
            <Feather size={15} />
            {article.category}
          </span>
          <h1>{article.title}</h1>
          <p>{article.excerpt}</p>
          <div className={styles.meta}>
            <span>
              <Clock3 size={15} />
              {article.reading_time_label}
            </span>
            <i />
            <span>
              <CalendarDays size={15} />
              {article.date_label}
            </span>
          </div>
        </div>
      </section>

      <section className={styles.articleSection}>
        <SubpageBackdrop />
        <div className={styles.layout}>
          <article className={styles.article}>
            <header>
              <span>
                <Quote size={24} />
              </span>
              <p>{article.excerpt}</p>
            </header>
            <div
              className={styles.articleBody}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
            {article.keywords.length > 0 && (
              <footer>
                <span>الكلمات المفتاحية</span>
                <div>
                  {article.keywords.map((keyword) => (
                    <i key={keyword}>{keyword}</i>
                  ))}
                </div>
              </footer>
            )}
          </article>
          <aside>
            <ArticleActions
              slug={article.slug}
              title={article.title}
              className={styles.actions}
              feedbackClassName={styles.actionFeedback}
            />
            <div className={styles.readingCard}>
              <Feather size={25} />
              <small>مقالة علمية</small>
              <strong>{article.reading_time_label}</strong>
              <p>قراءة هادئة ومركزة للمادة العلمية.</p>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <div className={styles.related}>
            <header>
              <span>من الأرشيف العلمي</span>
              <h2>مقالات ذات صلة</h2>
            </header>
            <div>
              {related.map((item) => (
                <Link href={`/articles/${item.slug}`} key={item.slug}>
                  <small>{item.category}</small>
                  <h3>{item.title}</h3>
                  <p>{item.excerpt}</p>
                  <footer>
                    <span>{item.reading_time_label}</span>
                    <ArrowLeft size={16} />
                  </footer>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
