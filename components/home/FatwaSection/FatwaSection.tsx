import Link from "next/link";
import {
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  MessageCircleQuestion,
  Send,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import { toArabicDigits } from "@/lib/arabicNumbers";
import { ShareButton } from "@/components/content/ShareButton/ShareButton";
import ViewCount from "@/components/content/ViewCount/ViewCount";
import { scientificFatwaSubmissionStages } from "@/lib/scientificFatwaPresentation";
import {
  getScientificFatwaHome,
  type ScientificFatwaHome,
} from "@/lib/scientificFatwaApi";

import styles from "./FatwaSection.module.css";
import premium from "./FatwaSectionPremium.module.css";

export default async function FatwaSection() {
  let home: ScientificFatwaHome | null = null;

  try {
    home = await getScientificFatwaHome();
  } catch {
    // The section keeps its visual structure while the backend is temporarily unavailable.
  }

  const featured = home?.featured ?? null;
  const categories = home?.categories ?? [];
  const publishedItems = home?.stats.published_items ?? 0;
  const categoryCount = home?.stats.categories ?? 0;

  return (
    <section id="fatwas" className={`${styles.section} ${premium.section}`}>
      <span className={styles.rings} aria-hidden="true" />
      <div className={styles.container}>
        <header className={`${styles.heading} ${premium.heading}`}>
          <div>
            <span className={styles.eyebrow}>
              <MessageCircleQuestion size={16} />
              أجوبة علمية موثقة
            </span>
            <h2>
              الفتاوى <span>والمسائل الحديثية</span>
            </h2>
          </div>
          <div className={styles.intro}>
            <p>
              أجوبة متخصصة في الحديث وعلومه، ضمن تصنيفات علمية واضحة تسهّل
              وصول الباحث إلى المسألة ومراجعها.
            </p>
            <div className={premium.headingMeta}>
              <span>
                <strong>{toArabicDigits(publishedItems)}</strong> جوابًا منشورًا
              </span>
              <i />
              <span>
                <strong>{toArabicDigits(categoryCount)}</strong> تصنيفات علمية
              </span>
            </div>
          </div>
        </header>

        <div className={`${styles.board} ${premium.board}`}>
          {featured ? (
            <article
              className={`${styles.featured} ${premium.featured}`}
            >
              <Link
                aria-label={`قراءة جواب: ${featured.title}`}
                className={premium.featuredLink}
                href={`/fatwas/${featured.slug}`}
              />
              <span className={premium.featuredSeal}>
                <ShieldCheck size={28} />
                <small>جواب موثّق</small>
              </span>
              <div className={`${styles.featuredTop} ${premium.featuredTop}`}>
                <span>
                  <Sparkles size={14} /> مسألة مختارة
                </span>
                <small>{featured.date_label}</small>
              </div>
              <span className={styles.category}>{featured.category}</span>
              <h3>{featured.title}</h3>
              <div className={`${styles.question} ${premium.questionBox}`}>
                <MessageCircleQuestion size={25} />
                <p>{featured.question_excerpt}</p>
              </div>
              <p className={styles.answer}>{featured.answer_excerpt}</p>
              <footer className={premium.featuredFooter}>
                <span>
                  <BookOpenCheck size={16} />{" "}
                  {toArabicDigits(featured.sources_count)} مراجع
                </span>
                <ViewCount count={featured.views_count} tone="muted" />
                <ShareButton
                  ariaLabel={`نسخ رابط الفتوى: ${featured.title}`}
                  className={premium.featuredShare}
                  href={`/fatwas/${featured.slug}`}
                  iconOnly
                />
                <strong>
                  اقرأ الجواب كاملًا <ArrowLeft size={17} />
                </strong>
              </footer>
            </article>
          ) : (
            <div
              className={`${styles.featured} ${premium.featured} ${premium.emptyFeatured}`}
              role="status"
            >
              <span className={premium.featuredSeal}>
                <ShieldCheck size={28} />
                <small>جواب موثّق</small>
              </span>
              <div>
                <MessageCircleQuestion size={34} />
                <h3>تُجهّز المسائل العلمية للنشر</h3>
                <p>ستظهر هنا أحدث مسألة معتمدة فور نشرها من لوحة الإدارة.</p>
              </div>
            </div>
          )}

          <aside className={`${styles.sidePanel} ${premium.sidePanel}`}>
            <div className={`${styles.categories} ${premium.categories}`}>
              <header className={premium.categoriesHeader}>
                <span>التصنيفات العلمية</span>
                <strong>{toArabicDigits(categoryCount)}</strong>
              </header>
              <div>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <Link
                      className={premium.categoryLink}
                      href={`/fatwas?category=${encodeURIComponent(category)}`}
                      key={category}
                    >
                      <i className={premium.categoryIcon}>
                        <MessageCircleQuestion size={15} />
                      </i>
                      <span>{category}</span>
                      <ArrowLeft size={15} />
                    </Link>
                  ))
                ) : (
                  <p className={premium.emptyCategories}>
                    ستظهر التصنيفات العلمية بعد نشر أولى المسائل.
                  </p>
                )}
              </div>
            </div>

            <div className={`${styles.askCard} ${premium.askCard}`}>
              <span className={styles.askIcon}>
                <Send size={20} />
              </span>
              <div>
                <small>للباحثين وطلاب العلم</small>
                <h3>لديك سؤال حديثي؟</h3>
              </div>
              <p>
                أرسله إلى فضيلة الشيخ، وتابع انتقاله عبر مراحل المراجعة
                والاعتماد.
              </p>
              <div className={styles.stageDots}>
                {scientificFatwaSubmissionStages.map((stage) => (
                  <i key={stage} title={stage} />
                ))}
              </div>
              <Link className={premium.askLink} href="/fatwas#ask">
                <CheckCircle2 size={16} /> أرسل سؤالك الآن{" "}
                <ArrowLeft size={16} />
              </Link>
            </div>
          </aside>
        </div>
        <Link className={premium.explore} href="/fatwas">
          <span>استكشف المكتبة الحديثية</span>
          <strong>تصفّح جميع المسائل والأجوبة</strong>
          <ArrowLeft size={20} />
        </Link>
      </div>
    </section>
  );
}
