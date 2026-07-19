import {
  ArrowUpLeft,
  BookOpen,
  FileText,
  GraduationCap,
  MessageCircleQuestion,
  Mic2,
  ScrollText,
} from "lucide-react";
import styles from "./CollectionsSection.module.css";

const collections = [
  {
    icon: BookOpen,
    number: "٠١",
    title: "الكتب والمؤلفات",
    description: "إصدارات الشيخ العلمية، مرتبة حسب الموضوع وسنة النشر.",
  },
  {
    icon: FileText,
    number: "٠٢",
    title: "البحوث والدراسات",
    description: "الأبحاث المحكمة والأوراق العلمية في الحديث وعلومه.",
  },
  {
    icon: Mic2,
    number: "٠٣",
    title: "الدروس والمحاضرات",
    description: "مكتبة مرئية وصوتية قابلة للاستماع والمتابعة بسهولة.",
  },
  {
    icon: ScrollText,
    number: "٠٤",
    title: "مجالس السماع",
    description: "توثيق المجالس العلمية وقراءات الكتب والإجازات.",
  },
  {
    icon: MessageCircleQuestion,
    number: "٠٥",
    title: "الفتاوى والأجوبة",
    description: "أجوبة علمية مفهرسة مع إمكان البحث حسب الموضوع.",
  },
  {
    icon: GraduationCap,
    number: "٠٦",
    title: "الإشراف الأكاديمي",
    description: "الرسائل العلمية والمناقشات والأنشطة الجامعية.",
  },
];

export default function CollectionsSection() {
  return (
    <section id="library" className={styles.section}>
      <div className={styles.container}>
        <header className={styles.heading}>
          <div>
            <span className={styles.kicker}>المكتبة العلمية</span>
            <h2>المعرفة مرتبة بين يديك</h2>
          </div>
          <p>
            أبواب واضحة تجمع الإنتاج العلمي، وتساعد الباحث على الوصول إلى
            المادة التي يحتاجها بأقل عدد من الخطوات.
          </p>
        </header>

        <div className={styles.grid}>
          {collections.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className={styles.card}>
                <span className={styles.cardNumber}>{item.number}</span>
                <span className={styles.icon}>
                  <Icon size={27} strokeWidth={1.35} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <a href="#featured">
                  استكشف القسم
                  <ArrowUpLeft size={17} strokeWidth={1.6} />
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
