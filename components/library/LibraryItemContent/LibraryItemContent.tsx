import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Check,
  Download,
  Expand,
  FileText,
  Home,
  Library,
  ListTree,
  Share2,
  Sparkles,
  Tags,
} from "lucide-react";
import SubpageBackdrop from "@/components/layout/SubpageBackdrop/SubpageBackdrop";
import LibraryWorkIcon from "@/components/library/LibraryWorkIcon/LibraryWorkIcon";
import type { LibraryWork } from "@/lib/libraryData";
import { toArabicDigits } from "@/lib/arabicNumbers";
import styles from "./LibraryItemContent.module.css";

type LibraryItemContentProps = {
  work: LibraryWork;
  relatedWorks: LibraryWork[];
};

export default function LibraryItemContent({
  work,
  relatedWorks,
}: LibraryItemContentProps) {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="مسار الصفحة">
            <Link href="/">
              <Home size={13} />
              الرئيسية
            </Link>
            <span>/</span>
            <Link href="/library">المكتبة الرقمية</Link>
            <span>/</span>
            <strong>{work.shortTitle}</strong>
          </nav>

          <div className={styles.heroGrid}>
            <div
              className={styles.cover}
              style={{ "--work-accent": work.accent } as React.CSSProperties}
            >
              <span>المكتبة الرقمية</span>
              <LibraryWorkIcon type={work.contentType} size={66} />
              <strong>{work.shortTitle}</strong>
              <i />
              <small>{work.field}</small>
              <b className={styles.bookBottom} aria-hidden="true" />
            </div>

            <div className={styles.heroCopy}>
              <div className={styles.heroLabels}>
                <span>
                  <Library size={14} />
                  {work.contentType}
                </span>
                {work.isPlaceholder && (
                  <span className={styles.placeholderLabel}>
                    <i />
                    بيانات نموذجية قيد التوثيق
                  </span>
                )}
              </div>
              <h1>{work.title}</h1>
              <p>{work.description}</p>

              <div className={styles.meta}>
                <span>
                  <FileText size={17} />
                  <small>عدد الصفحات</small>
                  <strong>{toArabicDigits(work.pages)} صفحة</strong>
                </span>
                <span>
                  <CalendarDays size={17} />
                  <small>بيانات الإصدار</small>
                  <strong>{work.edition}</strong>
                </span>
                <span>
                  <Tags size={17} />
                  <small>التصنيف العلمي</small>
                  <strong>{work.field}</strong>
                </span>
              </div>

              <div className={styles.actions}>
                <a className={styles.readButton} href="#reader">
                  <BookOpen size={17} />
                  ابدأ القراءة
                  <ArrowLeft size={17} />
                </a>
                <button type="button" aria-label="مشاركة المصنف">
                  <Share2 size={17} />
                </button>
                <button
                  type="button"
                  aria-label="تحميل المصنف"
                  disabled={!work.downloadAllowed || !work.pdfUrl}
                >
                  <Download size={17} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="reader" className={styles.content}>
        <SubpageBackdrop />
        <div className={styles.contentInner}>
          <header className={styles.sectionHead}>
            <div>
              <span>
                <Sparkles size={14} />
                القراءة داخل الموقع
              </span>
              <h2>قارئ المصنَّف الرقمي</h2>
            </div>
            <span className={styles.readerState}>
              <i />
              تصفح دون تحميل
            </span>
          </header>

          <div className={styles.readerShell}>
            <div className={styles.readerToolbar}>
              <span>
                <BookOpen size={17} />
                {work.shortTitle}
              </span>
              <div>
                <button type="button" aria-label="تكبير القارئ">
                  <Expand size={16} />
                </button>
                <button
                  type="button"
                  aria-label="تحميل الملف"
                  disabled={!work.downloadAllowed || !work.pdfUrl}
                >
                  <Download size={16} />
                </button>
              </div>
            </div>

            <div className={styles.readerLayout}>
              <div className={styles.documentArea}>
                {work.pdfUrl ? (
                  <iframe
                    className={styles.pdfFrame}
                    src={work.pdfUrl}
                    title={work.title}
                  />
                ) : (
                  <div className={styles.documentPreview}>
                    <article className={styles.paper}>
                      <span>بسم الله الرحمن الرحيم</span>
                      <LibraryWorkIcon type={work.contentType} size={35} />
                      <h3>{work.title}</h3>
                      <i />
                      <p>{work.description}</p>
                      <small>صفحة تجريبية لمعاينة تصميم القارئ المدمج</small>
                      <b>١</b>
                    </article>
                    <span className={styles.fileNotice}>
                      <Check size={14} />
                      القارئ جاهز عند إضافة ملف PDF الرسمي
                    </span>
                  </div>
                )}
              </div>

              <aside className={styles.sidebar}>
                <div className={styles.toc}>
                  <span>
                    <ListTree size={18} />
                    فهرس المحتويات
                  </span>
                  <ol>
                    {work.contents.map((item, index) => (
                      <li key={item}>
                        <span>
                          {toArabicDigits(String(index + 1).padStart(2, "0"))}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className={styles.publication}>
                  <small>بيانات النشر</small>
                  <strong>{work.publication}</strong>
                  <span>{work.edition}</span>
                </div>

                <div className={styles.keywords}>
                  <span>
                    <Tags size={16} />
                    الكلمات المفتاحية
                  </span>
                  <div>
                    {work.keywords.map((keyword) => (
                      <small key={keyword}>{keyword}</small>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>

          {relatedWorks.length > 0 && (
            <section className={styles.related}>
              <header>
                <span>من المكتبة</span>
                <h2>مواد ذات صلة</h2>
              </header>
              <div>
                {relatedWorks.map((item) => (
                  <Link
                    href={`/library/${item.slug}`}
                    key={item.slug}
                    style={
                      { "--work-accent": item.accent } as React.CSSProperties
                    }
                  >
                    <span className={styles.relatedIcon}>
                      <LibraryWorkIcon type={item.contentType} size={25} />
                    </span>
                    <span>
                      <small>{item.contentType}</small>
                      <strong>{item.title}</strong>
                      <em>{item.field}</em>
                    </span>
                    <ArrowLeft size={17} />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </>
  );
}
