import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  BookOpenCheck,
  GraduationCap,
  Home,
  Landmark,
  Quote,
} from "lucide-react";
import SubpageBackdrop from "@/components/layout/SubpageBackdrop/SubpageBackdrop";
import { toArabicDigits } from "@/lib/arabicNumbers";
import siteContent from "@/data/site-content.json";
import styles from "./AboutPageContent.module.css";

const foundationIcons = { GraduationCap, BookOpenCheck, Landmark } as const;
const foundations = siteContent.aboutFoundations;

export default function AboutPageContent() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroPattern} aria-hidden="true" />
        <div className={styles.heroContainer}>
          <nav className={styles.breadcrumb} aria-label="مسار الصفحة">
            <Link href="/">
              <Home size={13} />
              الرئيسية
            </Link>
            <ArrowLeft size={13} />
            <span>عن الشيخ</span>
          </nav>

          <span className={styles.kicker}>السيرة العلمية</span>
          <h1>عن فضيلة الشيخ</h1>
          <p className={styles.name}>
            الأستاذ الدكتور أبو عبد الله يحيى بن عبد الله البكري ثم الشهري
          </p>
          <p className={styles.role}>
            أستاذ الحديث وعلومه بجامعة الملك خالد في أبها
          </p>
          <div className={styles.heroFacts}>
            <span>
              <GraduationCap size={16} />
              أستاذ الحديث وعلومه
            </span>
            <i />
            <span>
              <Landmark size={16} />
              جامعة الملك خالد · أبها
            </span>
          </div>
        </div>
      </section>

      <section className={styles.profile}>
        <SubpageBackdrop />
        <div className={styles.profileContainer}>
          <div className={styles.copy}>
            <div className={styles.copyLabelRow}>
              <span className={styles.sectionNumber}>٠١ · التعريف</span>
              <span className={styles.copyStatus}>
                <i />
                ملف علمي موثّق
              </span>
            </div>
            <h2>مسيرة علمية تجمع التعليم والتحقيق</h2>
            <p className={styles.lead}>
              تمثل هذه الصفحة المدخل الرسمي للتعريف بالمسيرة العلمية
              والأكاديمية لفضيلة الشيخ، وبجهوده في خدمة الحديث النبوي وعلومه.
            </p>
            <p>
              وتهدف إلى تقديم المعلومات العلمية في صورة موثقة ومنظمة، تيسّر
              للباحث وطالب العلم التعرف إلى التخصص، والإنتاج العلمي، والمشاركة
              الأكاديمية؛ على أن تُستكمل التفاصيل الموثقة تباعًا.
            </p>

            <blockquote>
              <Quote size={22} />
              <span>
                المعرفة الموثقة تبدأ من عرض واضح، وتنمو بحسن التنظيم وسهولة
                الوصول.
              </span>
            </blockquote>
          </div>

          <aside className={styles.identityCard}>
            <span className={styles.imageOrbit} aria-hidden="true" />
            <Image
              className={styles.aboutImage}
              src="/media/images/about.png"
              alt="أبو عبد الله يحيى بن عبد الله البكري ثم الشهري"
              width={500}
              height={500}
            />
          </aside>
        </div>

        <div className={styles.foundationBlock}>
          <header className={styles.foundationHead}>
            <div>
              <span>مرتكزات المسيرة</span>
              <h2>أبعاد الحضور العلمي</h2>
            </div>
            <p>
              مسار يجمع بين التدريس الأكاديمي، والعناية بعلوم الحديث، وتيسير
              المعرفة للباحثين وطلاب العلم.
            </p>
          </header>

          <div className={styles.foundations}>
            {foundations.map((item, index) => {
              const Icon = foundationIcons[item.icon as keyof typeof foundationIcons];
              return (
                <article key={item.title}>
                  <span className={styles.foundationNumber}>
                    {toArabicDigits(String(index + 1).padStart(2, "0"))}
                  </span>
                  <span className={styles.foundationIcon}>
                    <Icon size={23} strokeWidth={1.4} />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <span className={styles.cardLine} aria-hidden="true" />
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
