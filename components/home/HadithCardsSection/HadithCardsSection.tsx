import Link from "next/link";
import { ArrowLeft, BookOpenCheck, Layers3 } from "lucide-react";
import ViewCount from "@/components/content/ViewCount/ViewCount";
import {
  getHadithCardsHome,
  hadithCardsErrorMessage,
  resolveHadithCardImageUrl,
} from "@/lib/hadithCardsApi";
import { toArabicDigits } from "@/lib/arabicNumbers";
import styles from "./HadithCardsSection.module.css";

function projectOrdinal(index: number) {
  if (index === 0) return "الأول";
  if (index === 1) return "الثاني";
  return `رقم ${toArabicDigits(index + 1)}`;
}

export default async function HadithCardsSection() {
  let response: Awaited<ReturnType<typeof getHadithCardsHome>> | null = null;
  let error: string | null = null;

  try {
    response = await getHadithCardsHome();
  } catch (requestError) {
    error = hadithCardsErrorMessage(requestError);
  }

  const projects = response?.data ?? [];

  return (
    <section className={styles.section} id="hadith-cards">
      <div className={styles.container}>
        <header className={styles.heading}>
          <div>
            <span><Layers3 size={16} /> مشاريع معرفية مصوّرة</span>
            <h2>بطاقات <em>حديثية</em></h2>
          </div>
          <div>
            <p>مختارات علمية مصممة بعناية لتقريب الحديث النبوي ومعاني القرآن في صورة واضحة قابلة للقراءة والمشاركة.</p>
            <Link href="/hadith-cards">استعرض جميع البطاقات <ArrowLeft size={17} /></Link>
          </div>
        </header>

        <div className={styles.projects}>
          {projects.map((project, index) => {
            const cover =
              project.cover_card ??
              project.gallery_preview[0] ??
              project.cards[0] ??
              null;
            const imageUrl = resolveHadithCardImageUrl(
              project.cover_image_url ?? cover?.image_url,
            );

            return (
              <Link
                className={`${styles.project} ${styles[project.accent]}`}
                href={`/hadith-cards#${encodeURIComponent(project.slug)}`}
                key={project.id}
              >
                <div className={styles.imageWrap}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={project.cover_alt_text || cover?.alt_text || project.title}
                      loading="lazy"
                    />
                  ) : (
                    <span className={styles.imageMissing}>
                      <Layers3 size={30} />
                      لا توجد صورة مرفقة
                    </span>
                  )}
                </div>
                <div className={styles.projectCopy}>
                  <span><BookOpenCheck size={14} /> المشروع {projectOrdinal(index)}</span>
                  <h3>{project.title}</h3>
                  {project.description && <p>{project.description}</p>}
                  <div className={styles.projectMeta}>
                    <ViewCount count={project.views_count} tone="muted" />
                  </div>
                  <strong>فتح المشروع <ArrowLeft size={16} /></strong>
                </div>
              </Link>
            );
          })}
          {!projects.length && (
            <div
              className={styles.sectionState}
              role={error ? "alert" : "status"}
            >
              <Layers3 size={31} />
              <strong>
                {error
                  ? "تعذّر تحميل البطاقات الحديثية"
                  : "لا توجد مشروعات بطاقات منشورة بعد"}
              </strong>
              <p>
                {error || "ستظهر مختارات البطاقات هنا فور نشرها من لوحة الإدارة."}
              </p>
              <Link href="/hadith-cards">
                فتح صفحة البطاقات <ArrowLeft size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
