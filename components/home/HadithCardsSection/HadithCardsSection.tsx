import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpenCheck, Layers3 } from "lucide-react";
import { hadithCardProjects } from "@/data/hadithCards";
import styles from "./HadithCardsSection.module.css";

export default function HadithCardsSection() {
  return (
    <section className={styles.section} id="hadith-cards">
      <div className={styles.container}>
        <header className={styles.heading}>
          <div>
            <span><Layers3 size={16} /> مشاريع معرفية مصوّرة</span>
            <h2>بطاقات <em>حديثية</em></h2>
          </div>
          <div>
            <p>مختارات علمية مصممة بعناية لتقريب الحديث النبوي ومعاني القرآن في صورة واضحة قابلة للقراءة والمشاركة.</p>
            <Link href="/hadith-cards">استعرض جميع البطاقات <ArrowLeft size={17} /></Link>
          </div>
        </header>

        <div className={styles.projects}>
          {hadithCardProjects.map((project, index) => (
            <Link className={`${styles.project} ${styles[project.accent]}`} href={`/hadith-cards#${project.id}`} key={project.id}>
              <div className={styles.imageWrap}>
                <Image src={project.cards[0].image} alt={project.cards[0].alt} fill sizes="(max-width: 760px) 88vw, 34vw" />
              </div>
              <div className={styles.projectCopy}>
                <span><BookOpenCheck size={14} /> المشروع {index + 1 === 1 ? "الأول" : "الثاني"}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <strong>فتح المشروع <ArrowLeft size={16} /></strong>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
