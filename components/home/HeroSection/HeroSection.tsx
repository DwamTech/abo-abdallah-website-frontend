import {
  ArrowLeft,
  BookOpen,
  CirclePlay,
  Feather,
  ScrollText,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import HeroSearchTrigger from "@/components/home/HeroSearchTrigger/HeroSearchTrigger";
import RotatingKnowledgeSeal from "@/components/home/RotatingKnowledgeSeal/RotatingKnowledgeSeal";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  return (
    <section id="home" className={styles.hero}>
      <div className={styles.pattern} aria-hidden="true" />
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.eyebrow}>
            {/* <Sparkles size={15} strokeWidth={1.5} /> */}
            <span>
 ۞ العلم ميراث النبوة</span>
          </div>
          <p className={styles.preTitle}>الموقع الرسمي لفضيلة الأستاذ الدكتور</p>
          <h1 className={styles.srOnly}>
            أبو عبد الله يحيى بن عبد الله البكري ثم الشهري
          </h1>
          <div className={styles.nameArtwork} aria-hidden="true">
            <span className={styles.nameOrnament}>
              <i />
              <b>۞</b>
              <i />
            </span>
            <Image
              className={styles.calligraphy}
              src="/media/images/logo2.png"
              alt=""
              width={866}
              height={288}
              priority
            />
            <span className={styles.englishName} lang="en" dir="ltr">
              Abu Abdullah Yahya bin Abdullah Al-Bakri Al-Shahri
            </span>
          </div>
          <div className={styles.divider} aria-hidden="true">
            <span />
            <i />
            <span />
          </div>
          <p className={styles.subtitle}>
            أستاذ الحديث وعلومه بجامعة الملك خالد في أبها
          </p>
          <p className={styles.intro}>
            منصة علمية تجمع الإنتاج الأكاديمي والدعوي، وتيسّر للباحثين وطلاب
            العلم الوصول إلى المؤلفات والبحوث والدروس ومجالس السماع.
          </p>
          <HeroSearchTrigger />
          <div className={styles.ctas}>
            <a className={styles.primaryCta} href="#library">
              <BookOpen size={19} strokeWidth={1.6} />
              تصفّح المكتبة العلمية
              <ArrowLeft size={17} />
            </a>
            <a className={styles.secondaryCta} href="#media">
              <CirclePlay size={20} strokeWidth={1.5} />
              الدروس والمحاضرات
            </a>
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

          <span className={`${styles.particle} ${styles.particleOne}`} />
          <span className={`${styles.particle} ${styles.particleTwo}`} />
          <span className={`${styles.particle} ${styles.particleThree}`} />

          <p className={styles.visualNote}>
            <span>الموقع العلمي الرسمي</span>
            <i />
            <span>١٤٤٨ هـ</span>
          </p>
        </div>
      </div>
      <a className={styles.scrollCue} href="#about" aria-label="انتقل إلى نبذة الموقع">
        <span>اكتشف الموقع</span>
        <i />
      </a>
    </section>
  );
}
