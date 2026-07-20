import Link from "next/link";
import {
  ArrowLeft,
  BookOpenCheck,
  GraduationCap,
  Landmark,
  Sparkles,
} from "lucide-react";
import styles from "./AboutSection.module.css";

const profilePoints = [
  {
    icon: GraduationCap,
    label: "المرتبة العلمية",
    value: "أستاذ الحديث وعلومه",
  },
  {
    icon: BookOpenCheck,
    label: "مجال التخصص",
    value: "الحديث النبوي وعلومه",
  },
  {
    icon: Landmark,
    label: "الجهة الأكاديمية",
    value: "جامعة الملك خالد",
  },
];

export default function AboutSection() {
  return (
    <section id="about" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.eyebrow}>
            ۞ 
            عن فضيلة الشيخ
          </span>

          <h2>
            مسيرةٌ في خدمة الحديث
            <span>وعطاءٌ علمي راسخ</span>
          </h2>

          <div className={styles.intro}>
            <span className={styles.introMark}>“</span>
            <p>
              فضيلة الأستاذ الدكتور أبو عبد الله يحيى بن عبد الله البكري ثم
              الشهري، أستاذ الحديث وعلومه بجامعة الملك خالد في أبها.
            </p>
          </div>

          <div className={styles.profilePoints}>
            {profilePoints.map((item) => {
              const Icon = item.icon;
              return (
                <div className={styles.profilePoint} key={item.label}>
                  <span className={styles.pointIcon}>
                    <Icon size={18} strokeWidth={1.45} />
                  </span>
                  <span className={styles.pointCopy}>
                    <small>{item.label}</small>
                    <strong>{item.value}</strong>
                  </span>
                </div>
              );
            })}
          </div>

          <div className={styles.actions}>
            <Link className={styles.cta} href="/about">
              <span>اكتشف السيرة العلمية</span>
              <ArrowLeft size={17} strokeWidth={1.7} />
            </Link>
            <span className={styles.actionNote}>علمٌ يُروى، وأثرٌ يبقى</span>
          </div>
        </div>

        <div className={styles.visual} aria-hidden="true">
          <span className={styles.visualLabel}>سيرة علمية موثقة</span>

          <div className={styles.orbit}>
            <span className={`${styles.orbitText} ${styles.orbitTextTop}`}>
              تحقيق
            </span>
            <span className={`${styles.orbitText} ${styles.orbitTextBottom}`}>
              تعليم
            </span>

            <div className={styles.knowledgeSeal}>
              <span className={styles.sealIcon}>
                <BookOpenCheck size={30} strokeWidth={1.15} />
              </span>
              <small>في خدمة</small>
              <strong>السنة النبوية</strong>
              <span className={styles.sealRule}>
                <i />
                <b>۞</b>
                <i />
              </span>
              <em>علم · تحقيق · تعليم</em>
            </div>
          </div>

          <div className={styles.visualCaption}>
            <span>جامعة الملك خالد · أبها</span>
            <strong>أستاذ الحديث وعلومه</strong>
          </div>

          <span className={styles.cornerMark}>٠١</span>
          <span className={styles.sparkOne} />
          <span className={styles.sparkTwo} />
        </div>
      </div>
    </section>
  );
}
