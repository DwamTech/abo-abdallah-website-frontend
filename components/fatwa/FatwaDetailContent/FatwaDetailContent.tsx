import Link from "next/link";
import {
  ArrowLeft,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Home,
  MessageCircleQuestion,
  Quote,
  Tags,
} from "lucide-react";
import SubpageBackdrop from "@/components/layout/SubpageBackdrop/SubpageBackdrop";
import { ShareButton } from "@/components/content/ShareButton/ShareButton";
import TrackedViewCount from "@/components/content/ViewCount/TrackedViewCount";
import ViewCount from "@/components/content/ViewCount/ViewCount";
import type {
  ScientificFatwaCard,
  ScientificFatwaItem,
} from "@/lib/scientificFatwaApi";
import { toArabicDigits } from "@/lib/arabicNumbers";
import styles from "./FatwaDetailContent.module.css";
import relatedStyles from "./RelatedFatwas.module.css";
import panelStyles from "./FatwaAnswerPanel.module.css";

export default function FatwaDetailContent({
  fatwa,
  related,
}: {
  fatwa: ScientificFatwaItem;
  related: ScientificFatwaCard[];
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
            <span>/</span>
            <Link href="/fatwas">الفتاوى</Link>
            <span>/</span>
            <strong>{fatwa.category}</strong>
          </nav>
          <span className={styles.category}>
            <MessageCircleQuestion size={15} />
            {fatwa.category}
          </span>
          <h1>{fatwa.title}</h1>
          <div className={styles.heroMeta}>
            <span>
              <CalendarDays size={16} />
              {fatwa.date_label}
            </span>
            <i />
            <span>
              <BookOpenCheck size={16} />
              {toArabicDigits(fatwa.sources.length)} مراجع
            </span>
            <i />
            <TrackedViewCount
              endpoint={`/api/scientific-fatwas/items/${encodeURIComponent(fatwa.slug)}/view`}
              initialCount={fatwa.views_count}
              tone="light"
            />
            <i />
            <ShareButton
              ariaLabel="نسخ رابط الفتوى"
              className={styles.shareButton}
              copiedLabel="تم نسخ الرابط"
              href={`/fatwas/${fatwa.slug}`}
              label="نسخ الرابط"
            />
          </div>
        </div>
      </section>
      <section className={styles.content}>
        <SubpageBackdrop />
        <div className={styles.inner}>
          <div className={`${styles.layout} ${panelStyles.layout}`}>
            <article
              className={`${styles.answerSheet} ${panelStyles.answerSheet}`}
            >
              <header className={panelStyles.documentHead}>
                <div>
                  <span>
                    <BookOpenCheck size={17} />
                    ملف المسألة العلمية
                  </span>
                  <strong>{fatwa.category}</strong>
                </div>
                <time>
                  <CalendarDays size={15} />
                  {fatwa.date_label}
                </time>
              </header>
              <div className={`${styles.question} ${panelStyles.question}`}>
                <span>
                  <MessageCircleQuestion size={22} />
                  نص السؤال
                </span>
                <p>{fatwa.question}</p>
              </div>
              <div className={`${styles.answer} ${panelStyles.answer}`}>
                <span>
                  <Quote size={22} />
                  الجواب العلمي
                </span>
                <p>{fatwa.answer}</p>
              </div>
              {fatwa.sources.length > 0 && (
                <div className={`${styles.sources} ${panelStyles.sources}`}>
                  <span>
                    <BookOpenCheck size={18} />
                    المصادر والمراجع
                  </span>
                  <ol>
                    {fatwa.sources.map((source) => (
                      <li key={source}>{source}</li>
                    ))}
                  </ol>
                </div>
              )}
              <div className={`${styles.keywords} ${panelStyles.keywords}`}>
                <span>
                  <Tags size={16} />
                  الكلمات المفتاحية
                </span>
                <div>
                  {fatwa.keywords.map((word) => (
                    <small key={word}>{word}</small>
                  ))}
                </div>
              </div>
            </article>
            <aside className={panelStyles.aside}>
              <span className={`${styles.seal} ${panelStyles.seal}`}>
                <i>
                  <CheckCircle2 size={28} />
                </i>
                <small>جواب علمي</small>
                <strong>منشور في الموقع</strong>
                <b>ضمن الأرشيف العلمي</b>
              </span>
              <p>
                تُعرض المسألة في سياقها العلمي، ويرجع الباحث إلى المصادر
                المتخصصة عند الحاجة إلى التوسع.
              </p>
              <Link href="/fatwas#ask">
                <span>لديك سؤال مرتبط؟</span>
                <ArrowLeft size={16} />
              </Link>
            </aside>
          </div>
          <section className={`${styles.related} ${relatedStyles.section}`}>
            <header className={relatedStyles.header}>
              <div>
                <span>
                  <MessageCircleQuestion size={15} />
                  مسائل مرتبطة
                </span>
                <h2>أجوبة قد تهمك</h2>
                <p>
                  مختارات علمية قريبة من موضوع هذه المسألة، تعينك على استكمال
                  البحث.
                </p>
              </div>
              <Link href="/fatwas">
                استكشف جميع الفتاوى <ArrowLeft size={16} />
              </Link>
            </header>
            <div className={relatedStyles.grid}>
              {related.map((item) => {
                const href = `/fatwas/${item.slug}`;

                return (
                <article
                  className={relatedStyles.card}
                  key={item.slug}
                >
                  <Link
                    aria-label={`قراءة جواب: ${item.title}`}
                    className={relatedStyles.cardLink}
                    href={href}
                  />
                  <div className={relatedStyles.cardTop}>
                    <span>{item.category}</span>
                    <i>
                      <MessageCircleQuestion size={19} />
                    </i>
                  </div>
                  <strong>{item.title}</strong>
                  <p>{item.question_excerpt}</p>
                  <footer>
                    <span>
                      <CalendarDays size={14} />
                      {item.date_label}
                    </span>
                    <ViewCount count={item.views_count} tone="muted" />
                    <ShareButton
                      ariaLabel={`نسخ رابط الفتوى: ${item.title}`}
                      className={relatedStyles.cardShare}
                      href={href}
                      iconOnly
                    />
                    <b>
                      قراءة الجواب <ArrowLeft size={15} />
                    </b>
                  </footer>
                </article>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
