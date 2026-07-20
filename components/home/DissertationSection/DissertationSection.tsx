import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  ScrollText,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import {
  dissertations,
  dissertationSpecializations,
  dissertationUniversities,
  participationTypes,
} from "@/lib/dissertationData";
import { toArabicDigits } from "@/lib/arabicNumbers";
import styles from "./DissertationSection.module.css";

export default function DissertationSection() {
  const featured = dissertations[0];
  const recent = dissertations.slice(1, 4);

  return (
    <section id="dissertations" className={styles.section}>
      <span className={styles.paperArc} aria-hidden="true" />
      <span className={styles.dotField} aria-hidden="true" />

      <div className={styles.container}>
        <header className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>
              <GraduationCap size={15} />
              الإنتاج الأكاديمي والإشراف العلمي
            </span>
            <h2>
              الرسائل العلمية
              <span>والإشراف والمناقشة</span>
            </h2>
          </div>

          <div className={styles.headingCopy}>
            <p>
              قاعدة بيانات للرسائل الجامعية التي أشرف عليها فضيلة الشيخ أو
              ناقشها أو شارك في لجانها، مفهرسة للباحثين في علوم الحديث.
            </p>
            <Link href="/dissertations">
              تصفّح قاعدة الرسائل
              <ArrowLeft size={18} />
            </Link>
          </div>
        </header>

        <div className={styles.showcase}>
          <Link className={styles.featured} href={`/dissertations#${featured.id}`}>
            <div className={styles.featuredCover}>
              <span>رسالة علمية</span>
              <ScrollText size={58} />
              <strong>{featured.degree}</strong>
              <i />
              <small>{featured.specialization}</small>
              <b className={styles.bookBottom} aria-hidden="true" />
            </div>

            <div className={styles.featuredCopy}>
              <span className={styles.status}>
                <i />
                رسالة مختارة
              </span>
              <small>{featured.participation}</small>
              <h3>{featured.title}</h3>
              <p>
                {featured.researcher} — {featured.university}، {featured.college}
              </p>

              <div className={styles.meta}>
                <span>
                  <BookOpen size={15} />
                  {featured.specialization}
                </span>
                <span>
                  <GraduationCap size={15} />
                  {featured.degree}
                </span>
                <span>
                  <Users size={15} />
                  {featured.participation}
                </span>
              </div>

              <span className={styles.openAction}>
                <i>
                  <Search size={17} />
                </i>
                اعرض تفاصيل الرسالة
                <ArrowLeft size={17} />
              </span>
            </div>
          </Link>

          <div className={styles.workList}>
            {recent.map((item, index) => (
              <Link
                className={styles.workCard}
                href={`/dissertations#${item.id}`}
                key={item.id}
              >
                <span className={styles.workNumber}>
                  {toArabicDigits(String(index + 2).padStart(2, "0"))}
                </span>
                <span className={styles.miniCover}>
                  <ScrollText size={25} />
                </span>
                <span className={styles.workCopy}>
                  <small>{item.participation}</small>
                  <strong>{item.title}</strong>
                  <span>
                    {item.researcher} · {item.university}
                  </span>
                </span>
                <span className={styles.workArrow}>
                  <ArrowLeft size={17} />
                </span>
              </Link>
            ))}

            <div className={styles.tools}>
              <span>
                <Search size={18} />
                بحث متقدم
              </span>
              <i />
              <span>
                <GraduationCap size={18} />
                {toArabicDigits(dissertations.length)} رسالة
              </span>
              <i />
              <span>
                <Sparkles size={18} />
                {toArabicDigits(dissertationUniversities.length)} جامعات
              </span>
            </div>
          </div>
        </div>

        <div className={styles.filterPreview}>
          <div className={styles.filterGroup}>
            <span>نوع المشاركة</span>
            <div>
              {participationTypes.slice(1).map((type) => (
                <span key={type}>{type}</span>
              ))}
            </div>
          </div>
          <div className={styles.filterGroup}>
            <span>التخصصات</span>
            <div>
              {dissertationSpecializations.slice(0, 5).map((spec) => (
                <span key={spec}>{spec}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
