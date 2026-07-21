import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Files,
  Library,
  Layers3,
  BookMarked,
  Search,
  Sparkles,
} from "lucide-react";
import LibraryWorkIcon from "@/components/library/LibraryWorkIcon/LibraryWorkIcon";
import { libraryWorks } from "@/lib/libraryData";
import { toArabicDigits } from "@/lib/arabicNumbers";
import styles from "./DigitalLibrarySection.module.css";
import premium from "./DigitalLibraryPremium.module.css";

export default function DigitalLibrarySection() {
  const featured = libraryWorks[0];

  return (
    <section id="digital-library" className={`${styles.section} ${premium.section}`}>
      <span className={styles.paperArc} aria-hidden="true" />
      <span className={styles.dotField} aria-hidden="true" />

      <div className={styles.container}>
        <header className={`${styles.heading} ${premium.heading}`}>
          <div>
            <span className={styles.eyebrow}>
              <Library size={15} />
              خزانة العلم المكتوبة
            </span>
            <h2>
              المصنَّفات
              <span>والمكتبة الرقمية</span>
            </h2>
          </div>

          <div className={styles.headingCopy}>
            <p>
              مكتبة تجمع الكتب والتحقيقات والأبحاث والمواد المكتوبة، مع قراءة
              ملفات PDF داخل الموقع وتصنيفها بحسب علوم الحديث.
            </p>
            <div className={premium.headingStats}><span><strong>{toArabicDigits(libraryWorks.length)}</strong> مواد رقمية</span><i/><span><BookOpen size={16}/> قراءة داخل الموقع</span></div>
          </div>
        </header>

        <div className={`${styles.libraryShowcase} ${premium.libraryShowcase}`}>
          <Link
            className={`${styles.featured} ${premium.featured}`}
            href={`/library/${featured.slug}`}
            style={{ "--work-accent": featured.accent } as React.CSSProperties}
          >
            <div className={`${styles.featuredCover} ${premium.featuredCover}`}>
              <span>المكتبة الرقمية</span>
              <LibraryWorkIcon type={featured.contentType} size={58} />
              <strong>{featured.shortTitle}</strong>
              <i />
              <small>نسخة للقراءة</small>
              <b className={styles.bookBottom} aria-hidden="true" />
            </div>

            <div className={`${styles.featuredCopy} ${premium.featuredCopy}`}>
              <span className={styles.status}>
                <i />
                نموذج مصنَّف رقمي
              </span>
              <small>{featured.contentType}</small>
              <h3>{featured.title}</h3>
              <p>{featured.description}</p>

              <div className={`${styles.meta} ${premium.meta}`}>
                <span>
                  <Files size={15} />
                  {toArabicDigits(featured.pages)} صفحة
                </span>
                <span>
                  <BookOpen size={15} />
                  قارئ PDF مدمج
                </span>
              </div>

              <span className={styles.openAction}>
                <i>
                  <BookOpen size={17} />
                </i>
                افتح صفحة المصنَّف
                <ArrowLeft size={17} />
              </span>
            </div>
          </Link>

          <div className={`${styles.workList} ${premium.workList}`}>
            <header className={premium.shelfHeader}><div><span><Layers3 size={15}/>مختارات المكتبة</span><strong>رفّ القراءة والبحث</strong></div><Link href="/library">عرض الكل <ArrowLeft size={15}/></Link></header>
            {libraryWorks.slice(1, 4).map((work, index) => (
              <Link
                className={`${styles.workCard} ${premium.workCard}`}
                href={`/library/${work.slug}`}
                key={work.slug}
                style={{ "--work-accent": work.accent } as React.CSSProperties}
              >
                <span className={styles.workNumber}>
                  {toArabicDigits(String(index + 2).padStart(2, "0"))}
                </span>
                <span className={`${styles.workIcon} ${premium.workIcon}`}>
                  <LibraryWorkIcon type={work.contentType} size={24} />
                </span>
                <span className={`${styles.workCopy} ${premium.workCopy}`}>
                  <small>{work.contentType}</small>
                  <strong>{work.shortTitle}</strong>
                  <span>{work.field}</span>
                </span>
                <span className={styles.workArrow}>
                  <ArrowLeft size={17} />
                </span>
              </Link>
            ))}

            <div className={`${styles.libraryTools} ${premium.libraryTools}`}>
              <span>
                <Search size={18} />
                بحث وتصنيف
              </span>
              <i />
              <span>
                <BookOpen size={18} />
                قراءة مباشرة
              </span>
              <i />
              <span>
                <Sparkles size={18} />
                مواد مترابطة
              </span>
            </div>
          </div>
        </div>
        <Link className={premium.libraryCta} href="/library"><i><BookMarked size={21}/></i><span><small>المكتبة العلمية الكاملة</small><strong>استكشف جميع المصنّفات والأبحاث</strong></span><ArrowLeft size={20}/></Link>
      </div>
    </section>
  );
}
