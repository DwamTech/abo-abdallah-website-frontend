import Link from "next/link";
import { ArrowLeft, BookOpenText, Clock3, Feather, Quote } from "lucide-react";
import { ShareButton } from "@/components/content/ShareButton/ShareButton";
import ViewCount from "@/components/content/ViewCount/ViewCount";
import { toArabicDigits } from "@/lib/arabicNumbers";
import { getSiteArticlesHome } from "@/lib/siteArticlesApi";
import styles from "./ArticlesSection.module.css";

export default async function ArticlesSection() {
  let home: Awaited<ReturnType<typeof getSiteArticlesHome>> | null = null;
  let loadFailed = false;
  try {
    home = await getSiteArticlesHome();
  } catch {
    loadFailed = true;
  }
  const [featured, ...rest] = home?.data ?? [];

  return (
    <section className={styles.section} id="articles">
      <span className={styles.paperLines} aria-hidden="true" />
      <div className={styles.container}>
        <header className={styles.heading}>
          <div>
            <span>
              <Feather size={16} /> أوراق علمية منتقاة
            </span>
            <h2>
              المقالات <em>والدراسات</em>
            </h2>
          </div>
          <p>
            قراءات علمية مؤصلة في الحديث وعلومه، صيغت لتقريب المسائل وبناء
            المعرفة بهدوء ووضوح.
          </p>
        </header>

        {featured ? (
          <div className={styles.editorial}>
            <div className={styles.featuredShell}>
              <Link
                href={`/articles/${featured.slug}`}
                className={styles.featured}
              >
                <span className={styles.featuredMark}>
                  <Quote size={34} />
                </span>
                <div className={styles.featuredBody}>
                  <small>{featured.category} · أحدث المقالات</small>
                  <h3>{featured.title}</h3>
                  <p>{featured.excerpt}</p>
                  <footer>
                    <div className={styles.featuredMeta}>
                      <span>
                        <Clock3 size={14} />
                        {featured.reading_time_label}
                      </span>
                      <ViewCount count={featured.views_count} tone="light" />
                    </div>
                    <strong>
                      اقرأ المقالة <ArrowLeft size={17} />
                    </strong>
                  </footer>
                </div>
                <span className={styles.verticalWord}>مقالة</span>
              </Link>
              <ShareButton
                className={styles.featuredShare}
                href={`/articles/${featured.slug}`}
                iconOnly
                ariaLabel={`نسخ رابط المقالة: ${featured.title}`}
              />
            </div>
            <div className={styles.stack}>
              {rest.slice(0, 5).map((article, index) => (
                <div className={styles.stackItem} key={article.slug}>
                  <Link href={`/articles/${article.slug}`}>
                    <span className={styles.number}>
                      {toArabicDigits(String(index + 2).padStart(2, "0"))}
                    </span>
                    <span className={styles.stackIcon}>
                      <BookOpenText size={19} />
                    </span>
                    <div>
                      <span className={styles.stackTopline}>
                        <small>{article.category}</small>
                        <ViewCount count={article.views_count} tone="muted" />
                      </span>
                      <h3>{article.title}</h3>
                      <p>{article.excerpt}</p>
                    </div>
                    <ArrowLeft className={styles.arrow} size={17} />
                  </Link>
                  <ShareButton
                    className={styles.stackShare}
                    href={`/articles/${article.slug}`}
                    iconOnly
                    ariaLabel={`نسخ رابط المقالة: ${article.title}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className={styles.sectionState}
            role={loadFailed ? "alert" : "status"}
          >
            {loadFailed
              ? "تعذّر تحميل المقالات والدراسات حاليًا."
              : "لا توجد مقالات أو دراسات منشورة حاليًا."}
          </div>
        )}

        <Link className={styles.archiveLink} href="/articles">
          أرشيف المقالات <ArrowLeft size={17} />
        </Link>
      </div>
    </section>
  );
}
