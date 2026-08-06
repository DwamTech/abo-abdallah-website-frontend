import Link from "next/link";
import { ArrowLeft, BookOpenText, Clock3, Feather, Quote } from "lucide-react";
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
                  <span>
                    <Clock3 size={14} />
                    {featured.reading_time_label}
                  </span>
                  <strong>
                    اقرأ المقالة <ArrowLeft size={17} />
                  </strong>
                </footer>
              </div>
              <span className={styles.verticalWord}>مقالة</span>
            </Link>
            <div className={styles.stack}>
              {rest.slice(0, 5).map((article, index) => (
                <Link key={article.slug} href={`/articles/${article.slug}`}>
                  <span className={styles.number}>
                    {toArabicDigits(String(index + 2).padStart(2, "0"))}
                  </span>
                  <span className={styles.stackIcon}>
                    <BookOpenText size={19} />
                  </span>
                  <div>
                    <small>{article.category}</small>
                    <h3>{article.title}</h3>
                    <p>{article.excerpt}</p>
                  </div>
                  <ArrowLeft className={styles.arrow} size={17} />
                </Link>
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
