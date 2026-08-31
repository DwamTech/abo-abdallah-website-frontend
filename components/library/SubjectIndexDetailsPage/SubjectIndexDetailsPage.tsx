"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  FileArchive,
  FolderSearch2,
  Home,
  LibraryBig,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toArabicDigits } from "@/lib/arabicNumbers";
import type { SubjectIndexDetails } from "@/data/subject-index-details";
import styles from "./SubjectIndexDetailsPage.module.css";

function normalizeArabic(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ـ/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function SubjectIndexDetailsPage({
  entry,
}: {
  entry: SubjectIndexDetails;
}) {
  const [query, setQuery] = useState("");

  const filteredBooks = useMemo(() => {
    const normalizedQuery = normalizeArabic(query);
    if (!normalizedQuery) return entry.books;

    return entry.books.filter((book) =>
      normalizeArabic(
        [
          book.title,
          book.attachments,
          book.publisher,
          book.edition,
          book.publicationYear,
          book.classification,
          book.notes,
        ]
          .filter(Boolean)
          .join(" "),
      ).includes(normalizedQuery),
    );
  }, [entry.books, query]);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroPattern} aria-hidden="true" />
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.container}>
          <nav className={styles.breadcrumb} aria-label="مسار الصفحة">
            <Link href="/"><Home size={13} /> الرئيسية</Link>
            <span>/</span>
            <Link href="/library-indexes">فهارس المكتبة</Link>
            <span>/</span>
            <strong>الفهرس رقم {toArabicDigits(entry.number)}</strong>
          </nav>

          <Link className={styles.backLink} href="/library-indexes#subject-index-details">
            <ArrowRight size={16} /> العودة إلى الفهرس الموضوعي
          </Link>

          <div className={styles.heroStage}>
            <div className={styles.heroContent}>
              <span className={styles.eyebrow}><LibraryBig size={16} /> الفهرس الموضوعي</span>
              <h1>{entry.subject}</h1>
              <p className={styles.heroDescription}>
                تصنيف علمي يجمع مقتنيات المكتبة في سجل موحّد، منظم ليسهّل الوصول إلى العناوين وبيانات نشرها.
              </p>
            </div>

            <aside className={styles.indexCard} aria-label={`بطاقة الفهرس رقم ${toArabicDigits(entry.number)}`}>
              <div className={styles.cardCorners} aria-hidden="true" />
              <span className={styles.cardKicker}>المكتبة البكرية</span>
              <div className={styles.cardNumber}>
                <small>رقم الفهرس</small>
                <strong>{toArabicDigits(entry.number)}</strong>
              </div>
              <div className={styles.cardCode}>
                <span>الرمز</span>
                <bdi>{entry.code}</bdi>
              </div>
            </aside>
          </div>

          <div className={styles.statsPanel}>
            <div className={styles.statsIntro}>
              <span>بيانات المجموعة</span>
              <small>إجمالي المحتوى المسجل في هذا التصنيف</small>
            </div>
            <div className={styles.stats} aria-label="إحصاءات الفهرس">
              <Stat icon={<BookOpen size={20} />} value={entry.titleCount} label="عنوانًا" />
              <Stat icon={<Boxes size={20} />} value={entry.volumeCount} label="مجلدًا" />
              <Stat icon={<FileArchive size={20} />} value={entry.coverCount} label="أغلفة" />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.catalogSection}>
        <div className={styles.container}>
          <header className={styles.sectionHeader}>
            <div>
              <span><FolderSearch2 size={15} /> محتويات الفهرس</span>
              <h2>الكتب والعناوين المسجلة</h2>
              <p>استعرض بيانات مقتنيات هذا التصنيف أو ابحث في جميع حقول الجدول.</p>
            </div>
            <div className={styles.resultCount}>
              <strong>{toArabicDigits(filteredBooks.length)}</strong>
              <span>{query ? "نتيجة مطابقة" : "سجل متاح"}</span>
            </div>
          </header>

          <div className={styles.searchBar}>
            <span className={styles.searchIcon}><Search size={21} /></span>
            <label>
              <span>البحث داخل الفهرس</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ابحث بالعنوان، الناشر، التصنيف، سنة النشر أو الملحوظات..."
              />
            </label>
            <div className={styles.searchActions}>
              <span className={styles.searchResults}>
                <strong>{toArabicDigits(filteredBooks.length)}</strong>
                {query ? "نتيجة" : "سجل"}
              </span>
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="مسح البحث">
                  <X size={17} />
                </button>
              )}
            </div>
          </div>

          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>م</th>
                  <th>العنوان وملحقاته</th>
                  <th>الناشر</th>
                  <th>الطبعة وسنة النشر</th>
                  <th>التصنيف</th>
                  <th>ملحوظات</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book, index) => (
                  <tr key={book.id}>
                    <td data-label="م"><span className={styles.sequence}>{toArabicDigits(index + 1)}</span></td>
                    <td data-label="العنوان وملحقاته"><strong>{book.title}</strong>{book.attachments && <small>{book.attachments}</small>}</td>
                    <td data-label="الناشر">{book.publisher || "—"}</td>
                    <td data-label="الطبعة وسنة النشر">{[book.edition, book.publicationYear].filter(Boolean).join("، ") || "—"}</td>
                    <td data-label="التصنيف">{book.classification || "—"}</td>
                    <td data-label="ملحوظات">{book.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!filteredBooks.length && (
              <div className={styles.emptyState}>
                <span><FolderSearch2 size={28} /></span>
                <strong>{query ? "لا توجد نتائج مطابقة" : "لا توجد عناوين مضافة بعد"}</strong>
                <p>
                  {query
                    ? "جرّب عبارة بحث أقصر أو امسح البحث لعرض جميع السجلات."
                    : "ستظهر بيانات الكتب هنا فور إضافتها من لوحة التحكم."}
                </p>
                {query && <button type="button" onClick={() => setQuery("")}>مسح البحث</button>}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className={styles.stat}>
      <span>{icon}</span>
      <div><strong>{toArabicDigits(value)}</strong><small>{label}</small></div>
    </div>
  );
}
