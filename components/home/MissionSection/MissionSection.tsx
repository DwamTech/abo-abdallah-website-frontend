import { BookMarked, Feather, LibraryBig } from "lucide-react";
import styles from "./MissionSection.module.css";

const principles = [
  {
    icon: BookMarked,
    title: "مرجعية علمية",
    text: "جمع الإنتاج العلمي والدعوي في مكان موثوق ومنظم.",
  },
  {
    icon: LibraryBig,
    title: "وصول ميسّر",
    text: "تجربة هادئة تيسّر البحث والقراءة والاستماع.",
  },
  {
    icon: Feather,
    title: "أصالة ووضوح",
    text: "هوية تجمع روح التراث مع التنظيم الأكاديمي الحديث.",
  },
];

export default function MissionSection() {
  return (
    <section id="about" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.heading}>
          <span className={styles.kicker}>رسالة الموقع</span>
          <h2>منصة علمية تحفظ المعرفة وتقرّبها</h2>
        </div>

        <div className={styles.body}>
          <div className={styles.copy}>
            <p className={styles.lead}>
              يهدف الموقع إلى جمع المسيرة العلمية والأكاديمية لفضيلة الشيخ في
              منصة واحدة، تخدم المتخصصين والباحثين وطلاب العلم في الحديث وعلومه.
            </p>
            <p>
              لا يقتصر دور الموقع على التعريف بفضيلة الشيخ، بل يُبنى ليكون
              مرجعًا علميًا متكاملًا يعتني بحسن تصنيف المادة، ودقة الوصول إليها،
              وراحة القراءة والاستماع على مختلف الأجهزة.
            </p>
          </div>

          <blockquote className={styles.verse}>
            <span aria-hidden="true">﴿</span>
            <p>وَقُل رَّبِّ زِدْنِي عِلْمًا</p>
            <span aria-hidden="true">﴾</span>
            <cite>سورة طه · الآية ١١٤</cite>
          </blockquote>
        </div>

        <div className={styles.principles}>
          {principles.map((item, index) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className={styles.principle}>
                <span className={styles.number}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={styles.icon}>
                  <Icon size={23} strokeWidth={1.45} />
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
