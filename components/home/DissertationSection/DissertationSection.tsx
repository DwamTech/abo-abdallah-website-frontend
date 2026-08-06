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
  apiErrorMessage,
  getDissertationHome,
  type DissertationCard,
} from "@/lib/api";
import { toArabicDigits } from "@/lib/arabicNumbers";
import styles from "./DissertationSection.module.css";

function dissertationHref(item: DissertationCard) {
  return `/dissertations/${item.slug || item.id}`;
}

export default async function DissertationSection() {
  let response: Awaited<ReturnType<typeof getDissertationHome>> | null = null;
  let error: string | null = null;

  try {
    response = await getDissertationHome();
  } catch (requestError) {
    error = apiErrorMessage(requestError);
  }

  const [featured, ...recent] = response?.data ?? [];
  const stats = response?.stats;
  const specializations = response?.specializations ?? [];

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
              سجل منظم للرسائل الجامعية التي أشرف عليها فضيلة الشيخ أو ناقشها أو
              شارك في لجانها، يربط الباحث بالموضوع والتخصص والجهة العلمية.
            </p>
            <Link href="/dissertations">
              استكشف السجل الأكاديمي
              <ArrowLeft size={18} />
            </Link>
          </div>
        </header>

        {featured ? (
          <div className={styles.academicBoard}>
            <Link
              className={styles.featuredFile}
              href={dissertationHref(featured)}
            >
              <span className={styles.fileEdge} aria-hidden="true" />

              <div className={styles.fileHeader}>
                <span className={styles.featuredBadge}>
                  <Sparkles size={13} />
                  ملف أكاديمي مختار
                </span>
                <span className={styles.fileCode}>
                  RS · {toArabicDigits(String(featured.id).padStart(3, "0"))}
                </span>
              </div>

              <div className={styles.fileMain}>
                <span className={styles.degreeSeal}>
                  <GraduationCap size={34} strokeWidth={1.45} />
                  <small>الدرجة العلمية</small>
                  <strong>{featured.degree || "—"}</strong>
                </span>

                <div className={styles.fileCopy}>
                  <span>{featured.participation_type || "سجل أكاديمي"}</span>
                  <h3>{featured.title}</h3>
                  <p>
                    {featured.abstract ||
                      "تفاصيل الرسالة العلمية ومشاركة فضيلة الشيخ فيها."}
                  </p>
                </div>
              </div>

              <div className={styles.fileMeta}>
                <span>
                  <UserRound size={15} />
                  <small>الباحث</small>
                  <strong>{featured.researcher_name || "—"}</strong>
                </span>
                <span>
                  <Landmark size={15} />
                  <small>الجامعة</small>
                  <strong>{featured.university || "—"}</strong>
                </span>
                <span>
                  <CalendarDays size={15} />
                  <small>العام</small>
                  <strong>
                    {featured.year ? `${toArabicDigits(featured.year)}هـ` : "—"}
                  </strong>
                </span>
              </div>

              <div className={styles.fileFooter}>
                <span>
                  <ClipboardCheck size={16} />
                  {featured.specialization || "دراسة علمية"}
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
                <strong>
                  {stats ? toArabicDigits(stats.total_dissertations) : "—"}
                </strong>
              </header>

              <div className={styles.timeline}>
                {recent.slice(0, 3).map((item, index) => (
                  <Link href={dissertationHref(item)} key={String(item.id)}>
                    <span className={styles.timelinePoint}>
                      {toArabicDigits(String(index + 2).padStart(2, "0"))}
                    </span>
                    <span className={styles.timelineCopy}>
                      <small>
                        {[item.participation_type, item.degree]
                          .filter(Boolean)
                          .join(" · ") || "رسالة علمية"}
                      </small>
                      <strong>{item.title}</strong>
                      <em>
                        {[
                          item.researcher_name,
                          item.year ? `${toArabicDigits(item.year)}هـ` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </em>
                    </span>
                    <ArrowLeft size={16} />
                  </Link>
                ))}
              </div>

              <footer className={styles.registryStats}>
                <span>
                  <strong>
                    {stats ? toArabicDigits(stats.supervised_count) : "—"}
                  </strong>
                  إشراف علمي
                </span>
                <i />
                <span>
                  <strong>
                    {stats ? toArabicDigits(stats.universities_count) : "—"}
                  </strong>
                  جامعات
                </span>
                <i />
                <span>
                  <strong>
                    {stats ? toArabicDigits(stats.specializations_count) : "—"}
                  </strong>
                  تخصصات
                </span>
              </footer>
            </aside>
          </div>
        ) : (
          <div
            className={styles.sectionState}
            role={error ? "alert" : "status"}
          >
            <GraduationCap size={34} />
            <strong>
              {error
                ? "تعذّر تحميل السجل الأكاديمي"
                : "لا توجد رسائل منشورة بعد"}
            </strong>
            <p>{error || "ستظهر الرسائل هنا فور نشرها من لوحة الإدارة."}</p>
            <Link href="/dissertations">فتح السجل الأكاديمي</Link>
          </div>
        )}

        <div className={styles.specialties}>
          <span className={styles.specialtiesTitle}>
            <Building2 size={16} />
            خريطة التخصصات
          </span>
          <div>
            {specializations.length > 0 ? (
              specializations.map((specialization) => (
                <span key={specialization}>{specialization}</span>
              ))
            ) : (
              <span>تُحدَّث من الرسائل المنشورة</span>
            )}
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
