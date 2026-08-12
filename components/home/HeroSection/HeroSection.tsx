import { ArrowLeft, BookOpen, Feather, ScrollText } from 'lucide-react';
import Image from 'next/image';
import HeroSearchTrigger from '@/components/home/HeroSearchTrigger/HeroSearchTrigger';
import RotatingKnowledgeSeal from '@/components/home/RotatingKnowledgeSeal/RotatingKnowledgeSeal';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  return (
    <section id="home" className={styles.hero}>
      <div className={styles.pattern} aria-hidden="true" />
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.introHeader}>
            <span className={styles.introSeal} aria-hidden="true">۞</span>
            <div className={styles.introCopy}>
              <div className={styles.eyebrow}>العلم ميراث النبوة</div>
              <p className={styles.preTitle}>الموقع الرسمي لفضيلة الأستاذ الدكتور</p>
            </div>
          </div>
          <h1 className={styles.srOnly}>أبو عبد الله يحيى بن عبد الله البكري الشهري</h1>
          <div className={styles.nameArtwork} aria-hidden="true">
            <span className={styles.nameOrnament}>
              <i />
              <b>۞</b>
              <i />
            </span>
            <Image
              className={styles.calligraphy}
              src="/media/images/الشهري.png"
              alt=""
              width={1600}
              height={533}
              priority
            />
             <span className={styles.englishName} lang="en" dir="ltr">
              Yahya Abdullah Al-Bakri Al-Shehri
            </span>
          </div>
          <div className={styles.profileSummary}>
            <span className={styles.summaryMark} aria-hidden="true" />
            <div>
              <p className={styles.subtitle}>أستاذ الحديث وعلومه بجامعة الملك خالد في أبها</p>
              <p className={styles.intro}>
                منصة علمية تجمع الإنتاج الأكاديمي، وتيسّر للباحثين وطلاب العلم
                الوصول إلى المؤلفات والبحوث والدروس ومجالس السماع.
              </p>
            </div>
          </div>

          <div className={styles.actionRow}>
            <HeroSearchTrigger />
            <div className={styles.ctas}>
              <a className={styles.primaryCta} href="/about">
                <BookOpen size={18} strokeWidth={1.6} />
                المسيرة العلمية
                <ArrowLeft size={16} />
              </a>
            </div>
          </div>
        </div>

        <div
          className={styles.visual}
          role="img"
          aria-label="تكوين بصري متحرك يرمز إلى الحديث النبوي وعلومه"
        >
          <div className={styles.visualGlow} aria-hidden="true" />

          <div className={styles.outerOrbit} aria-hidden="true">
            <span className={styles.orbitStarOne}>✦</span>
            <span className={styles.orbitStarTwo}>✦</span>
            <span className={styles.orbitStarThree}>✦</span>
          </div>

          <div className={styles.innerOrbit} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>

          <RotatingKnowledgeSeal />

          <div className={`${styles.floatingCard} ${styles.cardOne}`}>
            <span>
              <ScrollText size={18} strokeWidth={1.4} />
            </span>
            <div>
              <small>المجالس العلمية</small>
              <strong>مجالس السماع</strong>
            </div>
          </div>

          <div className={`${styles.floatingCard} ${styles.cardTwo}`}>
            <span>
              <Feather size={18} strokeWidth={1.4} />
            </span>
            <div>
              <small>منهج علمي</small>
              <strong>الرواية والدراية</strong>
            </div>
          </div>

          <div className={styles.visualBrand}>
            <Image
              className={styles.subCalligraphy}
              src="/media/images/elmaktaba_elbakrya.png"
              alt="المكتبة البكرية"
              width={834}
              height={299}
            />
            <span>خزانة العلم والمعرفة</span>
          </div>

          <span className={`${styles.particle} ${styles.particleOne}`} />
          <span className={`${styles.particle} ${styles.particleTwo}`} />
          <span className={`${styles.particle} ${styles.particleThree}`} />


        </div>
      </div>

    </section>
  );
}
