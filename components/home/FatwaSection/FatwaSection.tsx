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
import { fatwaCategories, fatwas, questionSubmissionStages } from "@/lib/fatwaData";
import { toArabicDigits } from "@/lib/arabicNumbers";
import styles from "./FatwaSection.module.css";
import premium from "./FatwaSectionPremium.module.css";

export default function FatwaSection() {
  const featured = fatwas[0];

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
            <h2>الفتاوى <span>والمسائل الحديثية</span></h2>
          </div>
          <div className={styles.intro}>
            <p>أجوبة متخصصة في الحديث وعلومه، مفهرسة في أبواب واضحة تسهّل وصول الباحث إلى المسألة ومراجعها.</p>
            <div className={premium.headingMeta}><span><strong>{toArabicDigits(fatwas.length)}</strong> جوابًا منشورًا</span><i/><span><strong>{toArabicDigits(fatwaCategories.length - 1)}</strong> أبواب علمية</span></div>
          </div>
        </header>

        <div className={`${styles.board} ${premium.board}`}>
          <Link className={`${styles.featured} ${premium.featured}`} href={`/fatwas/${featured.slug}`}>
            <span className={premium.featuredSeal}><ShieldCheck size={28}/><small>جواب موثّق</small></span>
            <div className={`${styles.featuredTop} ${premium.featuredTop}`}>
              <span><Sparkles size={14} /> مسألة مختارة</span>
              <small>{featured.date}</small>
            </div>
            <span className={styles.category}>{featured.category}</span>
            <h3>{featured.title}</h3>
            <div className={`${styles.question} ${premium.questionBox}`}>
              <MessageCircleQuestion size={25} />
              <p>{featured.question}</p>
            </div>
            <p className={styles.answer}>{featured.answer}</p>
            <footer className={premium.featuredFooter}>
              <span><BookOpenCheck size={16} /> {toArabicDigits(featured.sources.length)} مراجع</span>
              <strong>اقرأ الجواب كاملًا <ArrowLeft size={17} /></strong>
            </footer>
          </Link>

          <aside className={`${styles.sidePanel} ${premium.sidePanel}`}>
            <div className={`${styles.categories} ${premium.categories}`}>
              <header className={premium.categoriesHeader}><span>أبواب المسائل</span><strong>{toArabicDigits(fatwaCategories.length - 1)}</strong></header>
              <div>
                {fatwaCategories.slice(1, 7).map((category) => (
                  <Link className={premium.categoryLink} href={`/fatwas?category=${encodeURIComponent(category)}`} key={category}>
                    <i className={premium.categoryIcon}><MessageCircleQuestion size={15}/></i>
                    <span>{category}</span>
                    <ArrowLeft size={15} />
                  </Link>
                ))}
              </div>
            </div>

            <div className={`${styles.askCard} ${premium.askCard}`}>
              <span className={styles.askIcon}><Send size={20} /></span>
              <div><small>للباحثين وطلاب العلم</small><h3>لديك سؤال حديثي؟</h3></div>
              <p>أرسله إلى فضيلة الشيخ، وتابع انتقاله عبر مراحل المراجعة والاعتماد.</p>
              <div className={styles.stageDots}>
                {questionSubmissionStages.map((stage) => <i key={stage} title={stage} />)}
              </div>
              <Link className={premium.askLink} href="/fatwas#ask"><CheckCircle2 size={16} /> أرسل سؤالك الآن <ArrowLeft size={16} /></Link>
            </div>
          </aside>
        </div>
        <Link className={premium.explore} href="/fatwas"><span>استكشف المكتبة الحديثية</span><strong>تصفّح جميع المسائل والأجوبة</strong><ArrowLeft size={20}/></Link>
      </div>
    </section>
  );
}
