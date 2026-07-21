import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Landmark,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  dissertations,
  dissertationSpecializations,
  dissertationUniversities,
} from "@/lib/dissertationData";
import { toArabicDigits } from "@/lib/arabicNumbers";
import styles from "./DissertationSection.module.css";

export default function DissertationSection() {
  const featured = dissertations[0];
  const recent = dissertations.slice(1, 4);
  const supervisedCount = dissertations.filter(
    (item) => item.participation === "مشرف",
  ).length;

  return (
    <section id="dissertations" className={styles.section}>
      <span className={styles.orbit} aria-hidden="true" />
      <span className={styles.gridPattern} aria-hidden="true" />

      <div className={styles.container}>
        <header className={styles.heading}>
          <div className={styles.titleBlock}>
            <span className={styles.eyebrow}>
              <GraduationCap size={16} />
              سجل أكاديمي موثّق
            </span>
            <h2>
              الإنتاج الأكاديمي
              <span>والإشراف العلمي</span>
            </h2>
          </div>

          <div className={styles.intro}>
            <p>
              سجل منظم للرسائل الجامعية التي أشرف عليها فضيلة الشيخ أو ناقشها
              أو شارك في لجانها، يربط الباحث بالموضوع والتخصص والجهة العلمية.
            </p>
            <Link href="/dissertations">
              استكشف السجل الأكاديمي
              <ArrowLeft size={18} />
            </Link>
          </div>
        </header>

        <div className={styles.academicBoard}>
          <Link
            className={styles.featuredFile}
            href={`/dissertations/${featured.id}`}
          >
            <span className={styles.fileEdge} aria-hidden="true" />

            <div className={styles.fileHeader}>
              <span className={styles.featuredBadge}>
                <Sparkles size={13} />
                ملف أكاديمي مختار
              </span>
              <span className={styles.fileCode}>
                RS · {toArabicDigits("001")}
              </span>
            </div>

            <div className={styles.fileMain}>
              <span className={styles.degreeSeal}>
                <GraduationCap size={34} strokeWidth={1.45} />
                <small>الدرجة العلمية</small>
                <strong>{featured.degree}</strong>
              </span>

              <div className={styles.fileCopy}>
                <span>{featured.participation}</span>
                <h3>{featured.title}</h3>
                <p>{featured.abstract}</p>
              </div>
            </div>

            <div className={styles.fileMeta}>
              <span>
                <UserRound size={15} />
                <small>الباحث</small>
                <strong>{featured.researcher}</strong>
              </span>
              <span>
                <Landmark size={15} />
                <small>الجامعة</small>
                <strong>{featured.university}</strong>
              </span>
              <span>
                <CalendarDays size={15} />
                <small>العام</small>
                <strong>{toArabicDigits(featured.year)}هـ</strong>
              </span>
            </div>

            <div className={styles.fileFooter}>
              <span>
                <ClipboardCheck size={16} />
                {featured.specialization}
              </span>
              <strong>
                عرض تفاصيل الرسالة
                <ArrowLeft size={17} />
              </strong>
            </div>
          </Link>

          <aside className={styles.registry}>
            <header className={styles.registryHeader}>
              <span>
                <FileText size={19} />
              </span>
              <div>
                <small>أحدث السجل</small>
                <h3>مسار الإشراف والمناقشات</h3>
              </div>
              <strong>{toArabicDigits(dissertations.length)}</strong>
            </header>

            <div className={styles.timeline}>
              {recent.map((item, index) => (
                <Link href={`/dissertations/${item.id}`} key={item.id}>
                  <span className={styles.timelinePoint}>
                    {toArabicDigits(String(index + 2).padStart(2, "0"))}
                  </span>
                  <span className={styles.timelineCopy}>
                    <small>
                      {item.participation} · {item.degree}
                    </small>
                    <strong>{item.title}</strong>
                    <em>
                      {item.researcher} · {toArabicDigits(item.year)}هـ
                    </em>
                  </span>
                  <ArrowLeft size={16} />
                </Link>
              ))}
            </div>

            <footer className={styles.registryStats}>
              <span>
                <strong>{toArabicDigits(supervisedCount)}</strong>
                إشراف علمي
              </span>
              <i />
              <span>
                <strong>{toArabicDigits(dissertationUniversities.length)}</strong>
                جامعات
              </span>
              <i />
              <span>
                <strong>{toArabicDigits(dissertationSpecializations.length)}</strong>
                تخصصات
              </span>
            </footer>
          </aside>
        </div>

        <div className={styles.specialties}>
          <span className={styles.specialtiesTitle}>
            <Building2 size={16} />
            خريطة التخصصات
          </span>
          <div>
            {dissertationSpecializations.slice(0, 6).map((specialization) => (
              <span key={specialization}>{specialization}</span>
            ))}
          </div>
          <Link href="/dissertations">
            جميع التخصصات
            <ArrowLeft size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
