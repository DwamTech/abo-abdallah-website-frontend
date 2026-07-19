import { ArrowLeft, Award, BookOpenCheck, Landmark } from "lucide-react";
import styles from "./BiographySection.module.css";

const highlights = [
  {
    icon: Landmark,
    title: "المسار الأكاديمي",
    text: "أستاذ الحديث وعلومه بجامعة الملك خالد في أبها.",
  },
  {
    icon: BookOpenCheck,
    title: "التخصص العلمي",
    text: "العناية بالسنة النبوية وعلوم الرواية والدراية.",
  },
  {
    icon: Award,
    title: "الرسالة",
    text: "خدمة العلم وطلابه، وإتاحة المعرفة بمنهج واضح وموثوق.",
  },
];

export default function BiographySection() {
  return (
    <section id="biography" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.portrait}>
          <div className={styles.frame}>
            <div className={styles.monogram}>
              <span>أبو عبد الله</span>
              <strong>يحيى</strong>
              <small>البكري ثم الشهري</small>
            </div>
          </div>
          <span className={styles.caption}>العلم · التحقيق · التعليم</span>
        </div>

        <div className={styles.content}>
          <span className={styles.kicker}>السيرة العلمية</span>
          <h2>مسيرة أكاديمية في خدمة السنة النبوية</h2>
          <p className={styles.intro}>
            صفحة تعريفية موثقة تعرض المؤهلات والخبرات والإنتاج العلمي والمشاركة
            في خدمة الحديث وعلومه، بأسلوب زمني يسهل على الباحث الرجوع إليه.
          </p>

          <div className={styles.highlights}>
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className={styles.highlight}>
                  <span>
                    <Icon size={21} strokeWidth={1.45} />
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <a className={styles.link} href="#footer">
            عرض السيرة العلمية الكاملة
            <ArrowLeft size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}
