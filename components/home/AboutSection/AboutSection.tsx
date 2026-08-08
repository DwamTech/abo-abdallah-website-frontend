import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, BookOpenCheck, GraduationCap, Landmark } from 'lucide-react';
import { aboutProfilePoints, sheikhProfile } from '@/data/about';
import styles from './AboutSection.module.css';

const profileIcons = { GraduationCap, BookOpenCheck, Landmark } as const;
const profilePoints = aboutProfilePoints;

export default function AboutSection() {
  return (
    <section id="about" className={styles.section}>
      <div className={styles.backgroundArt} aria-hidden="true">
        <span className={styles.manuscriptArc} />
        <span className={styles.scholarSeal}>
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className={styles.dotManuscript} />
        <span className={styles.knowledgeLines}>
          <i />
          <i />
          <i />
        </span>
      </div>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.eyebrow}>۞ عن فضيلة الشيخ</span>

          <h2>
            مسيرةٌ في خدمة الحديث
            <span>وعطاءٌ علمي راسخ</span>
          </h2>

          <div className={styles.intro}>
            <span className={styles.introMark}>“</span>
            <p>
              فضيلة الأستاذ الدكتور {sheikhProfile.fullName}، أستاذ الحديث وعلومه
              سابقًا في قسم السنة وعلومها بجامعة الملك خالد.
            </p>
          </div>

          <div className={styles.profilePoints}>
            {profilePoints.map((item) => {
              const Icon = profileIcons[item.icon as keyof typeof profileIcons];
              return (
                <div className={styles.profilePoint} key={item.label}>
                  <span className={styles.pointIcon}>
                    <Icon size={18} strokeWidth={1.45} />
                  </span>
                  <span className={styles.pointCopy}>
                    <small>{item.label}</small>
                    <strong>{item.value}</strong>
                  </span>
                </div>
              );
            })}
          </div>

          <div className={styles.actions}>
            <Link className={styles.cta} href="/about">
              <span>اكتشف المسيرة العلمية</span>
              <ArrowLeft size={17} strokeWidth={1.7} />
            </Link>
            <span className={styles.actionNote}>علمٌ يُروى، وأثرٌ يبقى</span>
          </div>
        </div>

        <div className={styles.visual}>
          <Image
            className={styles.scholarImage}
            src="/media/images/about_hero.jpg"
            alt={`فضيلة الأستاذ الدكتور ${sheikhProfile.fullName}`}
            fill
            sizes="(max-width: 900px) 100vw, 42vw"
          />
          <span className={styles.visualVeil} aria-hidden="true" />
          <span className={styles.visualLabel}>سيرة علمية موثقة</span>

          <div className={styles.visualStatement}>
            <BookOpenCheck size={24} strokeWidth={1.3} />
            <span>مسيرة أكاديمية بدأت عام</span>
            <strong>١٤٠٨هـ</strong>
          </div>

          <div className={styles.visualCaption}>
            <span>{sheikhProfile.faculty}</span>
            <strong>{sheikhProfile.academicTitle}</strong>
          </div>

          <span className={styles.cornerMark}>١٤٤١هـ · التقاعد</span>
        </div>
      </div>
    </section>
  );
}
