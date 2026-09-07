import Image from "next/image";
import { Feather, Maximize2 } from "lucide-react";
import styles from "./TributeSection.module.css";

const artworkPath = "/media/images/sheikh-tribute-poem.png";

export default function TributeSection() {
  return (
    <section id="tribute" className={styles.section} aria-labelledby="tribute-heading">
      <div className={styles.backgroundArt} aria-hidden="true">
        <span className={styles.sunWash} />
        <span className={styles.leafWash} />
        <span className={styles.dottedPattern} />
      </div>

      <div className={styles.container}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>
            <Feather size={15} strokeWidth={1.55} />
            من نفحات الوفاء
          </span>

          <h2 id="tribute-heading" className={styles.verse}>
            ﴿وَٱجْعَل لِّى لِسَانَ صِدْقٍ
            <span>فِى ٱلْـَٔاخِرِينَ﴾</span>
          </h2>

          <p className={styles.intro}>
            «تَسْمَعُونَ، ويُسْمَعُ مِنْكُمْ، ويُسْمَعُ مِمَّنْ سَمِعَ مِنْكُمْ».
            <span>رواه أبو داود.</span>
          </p>

          <blockquote className={styles.quote}>
            <span className={styles.quoteMark} aria-hidden="true">
              “
            </span>
            <div className={styles.poem}>
              <p>
                دينُ النبيِّ محمدٍ أخبارُ
                <span>نِعْمَ المطيَّةُ للفتى الآثارُ</span>
              </p>
              <p>
                لا تَرْغَبَنَّ عن الحديثِ وأهلِهِ
                <span>فالرأيُ ليلٌ والحديثُ نهارُ</span>
              </p>
            </div>
          </blockquote>

          <div className={styles.actions}>


            <span className={styles.note}>علمٌ يُروى، وأثرٌ يبقى</span>
          </div>
        </div>

        <figure className={styles.artwork}>
          <div className={styles.artworkFrame}>
            <Image
              className={styles.artworkImage}
              src={artworkPath}
              alt="لوحة وفاء لفضيلة الشيخ تتضمن أبياتًا عن أثر العلم والعطاء"
              width={1254}
              height={1254}
              sizes="(max-width: 720px) calc(100vw - 46px), (max-width: 980px) min(720px, calc(100vw - 64px)), 650px"
            />
          </div>

          <figcaption className={styles.caption}>
           
            <a href={artworkPath} target="_blank" rel="noreferrer">
              <Maximize2 size={15} strokeWidth={1.6} />
              عرض اللوحة كاملة
            </a>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
