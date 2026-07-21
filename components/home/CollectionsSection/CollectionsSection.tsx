import {
  ArrowUpLeft,
  BookOpen,
  FileText,
  GraduationCap,
  MessageCircleQuestion,
  Mic2,
  ScrollText,
} from "lucide-react";
import siteContent from "@/data/site-content.json";
import styles from "./CollectionsSection.module.css";

const collectionIcons = { BookOpen, FileText, Mic2, ScrollText, MessageCircleQuestion, GraduationCap } as const;
const collections = siteContent.collections;

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
            const Icon = collectionIcons[item.icon as keyof typeof collectionIcons];
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
