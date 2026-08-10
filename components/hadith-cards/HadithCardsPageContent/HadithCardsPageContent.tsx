import Link from "next/link";
import { ArrowLeft, Layers3, Share2, Sparkles } from "lucide-react";
import { toArabicDigits } from "@/lib/arabicNumbers";
import {
  getHadithCardsProjects,
  hadithCardsErrorMessage,
  resolveHadithCardImageUrl,
} from "@/lib/hadithCardsApi";
import HadithCardsProjectGallery from "./HadithCardsProjectGallery";
import styles from "./HadithCardsPageContent.module.css";

function projectCountNoun(count: number) {
  if (count === 1) return "مشروع معرفي";
  if (count === 2) return "مشروعان معرفيان";
  return "مشروعات معرفية";
}

function sectionTitle(count: number) {
  if (count === 1) return "مشروع واحد، ورسالة علمية واحدة";
  if (count === 2) return "مشروعان، ورسالة علمية واحدة";
  if (count > 2) return `${toArabicDigits(count)} مشروعات، ورسالة علمية واحدة`;
  return "مشروعات البطاقات الحديثية";
}

function projectOrdinal(index: number) {
  if (index === 0) return "الأول";
  if (index === 1) return "الثاني";
  return `رقم ${toArabicDigits(index + 1)}`;
}

export default async function HadithCardsPageContent() {
  let response: Awaited<ReturnType<typeof getHadithCardsProjects>> | null =
    null;
  let error: string | null = null;

  try {
    response = await getHadithCardsProjects();
  } catch (requestError) {
    error = hadithCardsErrorMessage(requestError);
  }

  const projects = response?.data ?? [];
  const stats = response?.stats;
  const projectsCount = stats?.projects_count ?? projects.length;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.heroPattern} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}><Layers3 size={16} /> مكتبة بصرية علمية</span>
            <h1>بطاقات <em>حديثية</em></h1>
            <p>مشروعات مصوّرة تجمع صحة المادة، ووضوح العبارة، وجمال التقديم؛ لتقريب العلم وتيسير تداوله.</p>
            <div className={styles.heroMeta}>
              <span>
                <strong>{stats ? toArabicDigits(projectsCount) : "—"}</strong>
                {projectCountNoun(projectsCount)}
              </span>
              <i />
              <span><Share2 size={16} /> محتوى سهل القراءة والمشاركة</span>
            </div>
          </div>
          <div className={styles.heroStack} aria-hidden="true">
            {projects.slice(0, 2).map((project, index) => {
              const imageUrl = resolveHadithCardImageUrl(
                project.cover_image_url ??
                  project.cover_card?.image_url ??
                  project.gallery_preview[0]?.image_url ??
                  project.cards[0]?.image_url,
              );

              return imageUrl ? (
                <div
                  className={`${styles.stackCard} ${index === 1 ? styles.stackCardSecondary : ""}`.trim()}
                  key={project.id}
                >
                  <img src={imageUrl} alt="" loading={index === 0 ? "eager" : "lazy"} />
                </div>
              ) : null;
            })}
            {!projects.length && <span className={styles.stackEmpty} />}
          </div>
        </div>
      </section>

      <section className={styles.projectsSection}>
        <div className={styles.projectsInner}>
          <header className={styles.sectionHeading}>
            <span><Sparkles size={15} /> مشروعات البطاقات</span>
            <h2>{sectionTitle(projectsCount)}</h2>
            <p>كل مشروع مساحة مستقلة تُعرض داخلها بطاقاته تباعًا عند نشرها من لوحة التحكم.</p>
          </header>

          <div className={styles.projectsList}>
            {projects.map((project, index) => {
              return (
                <HadithCardsProjectGallery
                  key={project.id}
                  project={project}
                  ordinal={projectOrdinal(index)}
                />
              );
            })}
            {!projects.length && (
              <div
                className={styles.projectsState}
                role={error ? "alert" : "status"}
              >
                <Layers3 size={31} />
                <strong>
                  {error
                    ? "تعذّر تحميل البطاقات الحديثية"
                    : "لا توجد مشروعات بطاقات منشورة بعد"}
                </strong>
                <p>
                  {error || "ستظهر مشروعات البطاقات هنا فور نشرها من لوحة الإدارة."}
                </p>
              </div>
            )}
          </div>

          <Link className={styles.backHome} href="/#hadith-cards">العودة إلى سكشن البطاقات <ArrowLeft size={17} /></Link>
        </div>
      </section>
    </main>
  );
}
