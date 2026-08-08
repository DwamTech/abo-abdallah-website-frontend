import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Layers3, Share2, Sparkles } from "lucide-react";
import { hadithCardProjects } from "@/data/hadithCards";
import { toArabicDigits } from "@/lib/arabicNumbers";
import styles from "./HadithCardsPageContent.module.css";

export default function HadithCardsPageContent() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.heroPattern} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}><Layers3 size={16} /> مكتبة بصرية علمية</span>
            <h1>بطاقات <em>حديثية</em></h1>
            <p>مشروعات مصوّرة تجمع صحة المادة، ووضوح العبارة، وجمال التقديم؛ لتقريب العلم وتيسير تداوله.</p>
            <div className={styles.heroMeta}>
              <span><strong>٢</strong> مشروعان معرفيان</span>
              <i />
              <span><Share2 size={16} /> محتوى سهل القراءة والمشاركة</span>
            </div>
          </div>
          <div className={styles.heroStack} aria-hidden="true">
            {hadithCardProjects.map((project, index) => (
              <div className={styles.stackCard} key={project.id}>
                <Image src={project.cards[0].image} alt="" fill sizes="230px" priority={index === 0} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.projectsSection}>
        <div className={styles.projectsInner}>
          <header className={styles.sectionHeading}>
            <span><Sparkles size={15} /> مشروعات البطاقات</span>
            <h2>مشروعان، ورسالة علمية واحدة</h2>
            <p>كل مشروع مساحة مستقلة تُعرض داخلها بطاقاته تباعًا عند نشرها من لوحة التحكم.</p>
          </header>

          <div className={styles.projectsList}>
            {hadithCardProjects.map((project, index) => (
              <article className={`${styles.project} ${styles[project.accent]}`} id={project.id} key={project.id}>
                <header className={styles.projectHeader}>
                  <div>
                    <span className={styles.projectNumber}>المشروع {index === 0 ? "الأول" : "الثاني"}</span>
                    <small>{project.eyebrow}</small>
                    <h2>{project.title}</h2>
                  </div>
                  <p>{project.description}</p>
                </header>

                <div className={styles.cardsGallery}>
                  {project.cards.map((card, cardIndex) => (
                    <figure className={styles.cardItem} key={card.id}>
                      <div>
                        <Image src={card.image} alt={card.alt} fill sizes="(max-width: 760px) 92vw, 30vw" />
                      </div>
                      <figcaption>البطاقة {toArabicDigits(cardIndex + 1)}</figcaption>
                    </figure>
                  ))}
                </div>

                <footer className={styles.projectFooter}>
                  <span><Layers3 size={17} /> {toArabicDigits(project.cards.length)} بطاقة</span>
                  <span><Share2 size={17} /> مشروع متجدد</span>
                </footer>
              </article>
            ))}
          </div>

          <Link className={styles.backHome} href="/#hadith-cards">العودة إلى سكشن البطاقات <ArrowLeft size={17} /></Link>
        </div>
      </section>
    </main>
  );
}
