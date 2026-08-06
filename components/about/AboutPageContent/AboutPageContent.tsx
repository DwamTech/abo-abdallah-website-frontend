import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Award,
  BookCopy,
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChartNetwork,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  Home,
  Landmark,
  LibraryBig,
  MapPinned,
  Mic2,
  Network,
  Presentation,
  ScrollText,
  Sparkles,
  University,
  UserRound,
  UsersRound,
} from 'lucide-react';
import SubpageBackdrop from '@/components/layout/SubpageBackdrop/SubpageBackdrop';
import { toArabicDigits } from '@/lib/arabicNumbers';
import { AboutMotionController, AnimatedNumber } from './AboutMotion';
import styles from './AboutPageContent.module.css';

const qualifications = [
  {
    year: '١٤٠٧هـ',
    title: 'البكالوريوس',
    text: 'كلية الحديث الشريف بالجامعة الإسلامية.',
  },
  {
    year: '١٤١٧هـ',
    title: 'الماجستير',
    text: 'كلية الدعوة وأصول الدين بجامعة أم القرى.',
  },
  {
    year: '١٤٢١هـ',
    title: 'الدكتوراه',
    text: 'كلية الدعوة وأصول الدين بجامعة أم القرى.',
  },
  {
    year: '١٤٤١هـ – ....؟',
    title: 'أستاذ غير متفرغ',
    text: '',
  },
];

const academicRanks = [
  { year: '١٤٠٨هـ', title: 'معيد' },
  { year: '١٤١٧هـ', title: 'محاضر' },
  { year: '١٤٢٢هـ', title: 'أستاذ مساعد' },
  { year: '١٤٢٨هـ', title: 'أستاذ مشارك' },
  { year: '١٤٣٢هـ', title: 'أستاذ' },
];

const administrativeRoles = [
  {
    period: '١٤٢٢هـ – ١٤٢٦هـ',
    title: 'رئيس قسم الدراسات الإسلامية',
    place: 'كلية المعلمين',
  },
  {
    period: '١٤٣٣هـ – ١٤٣٤هـ',
    title: 'مدير مركز البحث العلمي',
    place: 'كلية الشريعة',
  },
  {
    period: '١٤٣٤هـ – ١٤٣٥هـ',
    title: 'رئيس قسم السنة وعلومها',
    place: 'كلية الشريعة',
  },
  {
    period: '١٤٣٦هـ – ١٤٤١هـ',
    title: 'المشرف العام على التوعية الفكرية',
    place: 'الجامعة',
  },
];

const councilMemberships = [
  {
    title: 'مجلس قسم الدراسات الإسلامية بكلية المعلمين',
    period: '١٤٢١هـ – ١٤٢٩هـ',
  },
  { title: 'مجلس الكلية', period: '١٤٢٢هـ – ١٤٢٦هـ' },
  {
    title: 'مجلس قسم السنة وعلومها بكلية الشريعة',
    period: '١٤٢٩هـ – ٣٠/٦/١٤٤١هـ',
  },
  { title: 'مجلس الكلية', period: '١٤٣٤هـ / ١٤٣٥هـ' },
  {
    title: 'مجلس إدارة مركز البحث العلمي بالكلية',
    period: '١٤٣٣هـ / ١٤٣٥هـ',
  },
  {
    title: 'مجلس الجمعية السعودية للسنة وعلومها (سنن)',
    period: '١٤٢٩هـ – ١٤٣٥هـ',
  },
  {
    title: 'مجلس عمادة البحث العلمي بالجامعة',
    period: '١٤٣٣هـ – ١٤٣٥هـ',
  },
  { title: 'المجلس العلمي بالجامعة', period: '١٤٤٠هـ – ١٤٤١هـ' },
  {
    title: 'عضو مجلس إدارة وحدة التوعية الفكرية',
    period: '١٤٣٩هـ – ١٤٤١هـ',
  },
];

const supervisionUniversities = [
  { name: 'الجامعة الإسلامية', count: 16, unit: 'رسالة' },
  { name: 'جامعة أم القرى', count: 22, unit: 'رسالة' },
  { name: 'جامعة الملك خالد', count: 80, unit: 'رسالة' },
  { name: 'جامعة الإمام', count: 18, unit: 'رسالة' },
  { name: 'جامعة الملك سعود', count: 4, unit: 'رسائل' },
  { name: 'جامعة نجران', count: 1, unit: 'رسالة واحدة' },
  { name: 'جامعة القصيم', count: 2, unit: 'رسالتان' },
  { name: 'جامعة نورة', count: 1, unit: 'رسالة واحدة' },
];

const impactStats = [
  {
    value: 147,
    label: 'رسالة علمية',
    text: 'مجموع رسائل الإرشاد والإشراف والمناقشة.',
    icon: GraduationCap,
  },
  {
    value: 651,
    label: 'بحثًا محكّمًا',
    text: 'للمجلات والمجالس العلمية وللأفراد.',
    icon: FileCheck2,
  },
  {
    value: 100,
    prefix: '+',
    label: 'خطة علمية',
    text: 'خطة ماجستير أو دكتوراه تمت مراجعتها وتحريرها.',
    icon: ClipboardCheck,
  },
  {
    value: 25,
    label: 'لجنة',
    text: 'على مستوى القسم والكلية والجامعة.',
    icon: Network,
  },
];

const publications = [
  { value: 17, label: 'بحثًا علميًا محكّمًا' },
  { value: 12, label: 'كتابًا محكّمًا' },
  { value: 40, label: 'كتابًا مطبوعًا للنشر العام' },
  { value: 4, label: 'كتب تحت الطبع' },
];

const publicActivities = [
  {
    value: 5,
    title: 'الدورات والبرامج الخارجية',
    text: 'في أمريكا، ودبي، ومصر، وقطر.',
    icon: MapPinned,
  },
  {
    value: 26,
    title: 'المؤتمرات والندوات والبرامج التوعوية الداخلية',
    text: 'ما بين مؤتمر أو ندوة أو برنامج.',
    icon: Presentation,
  },
  {
    value: 65,
    title: 'الدروس ومجالس السماع',
    text: 'دورة في عشرات المجالس في عسير، والرياض، والدمام، والخبر، والأحساء، وبقيق، والقصيم، ومكة المكرمة، وجدة، وجيزان، وينبع، وفي دولة البحرين.',
    icon: BookOpenCheck,
    featured: true,
  },
  {
    value: 52,
    title: 'اللقاءات والندوات والمحاضرات والكلمات والخطب',
    text: 'ما بين لقاء وندوة وكلمة وخطبة.',
    icon: Mic2,
  },
  {
    value: 6,
    title: 'البرامج والخطط الدراسية',
    text: 'ستة برامج دراسية.',
    icon: ScrollText,
  },
  {
    value: 70,
    title: 'شهادات الشكر والهدايا ونحوها',
    text: 'ما بين وثائق حضور ومشاركة في المؤتمرات والندوات، وشهادات الشكر، والدروع، والهدايا، والتهاني.',
    icon: Award,
  },
  {
    value: 6,
    title: 'اللقاءات والمقابلات الإعلامية',
    text: 'ستة لقاءات ومقابلات إعلامية.',
    icon: UsersRound,
  },
];

function SectionHeading({
  number,
  eyebrow,
  title,
  description,
  light = false,
}: {
  number: string;
  eyebrow: string;
  title: string;
  description?: string;
  light?: boolean;
}) {
  return (
    <header
      className={`${styles.sectionHeading} ${light ? styles.sectionHeadingLight : ''}`}
      data-about-reveal
    >
      <div>
        <span className={styles.sectionEyebrow}>
          <b>{number}</b>
          {eyebrow}
        </span>
        <h2>{title}</h2>
      </div>
      {description ? <p>{description}</p> : null}
    </header>
  );
}

export default function AboutPageContent() {
  return (
    <div id="about-page" className={styles.pageRoot}>
      <AboutMotionController />
      <section className={styles.hero}>
        <div className={styles.heroPattern} aria-hidden="true" />
        <div className={styles.heroContainer}>
          <div className={styles.heroCopy} data-about-reveal>
            <nav className={styles.breadcrumb} aria-label="مسار الصفحة">
              <Link href="/">
                <Home size={13} />
                الرئيسية
              </Link>
              <ArrowLeft size={13} />
              <span>عن الشيخ</span>
            </nav>

            <span className={styles.kicker}>السيرة العلمية والأكاديمية</span>
            <h1>عن فضيلة الشيخ</h1>
            <p className={styles.name}>أ.د. يحيى بن عبد الله بن يحيى البكري الشهري</p>
            <p className={styles.role}>أستاذ الحديث وعلومه بجامعة الملك خالد في أبها</p>
            <div className={styles.heroFacts}>
              <span>
                <CalendarDays size={16} />
                الميلاد: ١/٧/١٣٨٤هـ
              </span>
              <i />
              <span>
                <UserRound size={16} />
                متزوج، أب لولدين وثلاث بنات
              </span>
            </div>
          </div>

          <aside
            className={styles.heroPortrait}
            aria-label="صورة فضيلة الشيخ"
            data-about-reveal
            data-reveal-delay="150"
          >
            <span className={styles.heroPortraitGlow} aria-hidden="true" />
            <Image
              className={styles.heroImage}
              src="/media/images/about-hero-portrait.jpeg"
              alt="الأستاذ الدكتور يحيى بن عبد الله بن يحيى البكري الشهري"
              width={440}
              height={500}
              sizes="(max-width: 620px) 260px, (max-width: 1000px) 310px, 360px"
              priority
            />
            <span className={styles.heroPortraitLabel}>المسيرة العلمية</span>
          </aside>
        </div>
      </section>

      <section className={styles.identitySection} hidden>
        <SubpageBackdrop />
        <div className={styles.identityContainer}>
          <div className={styles.identityCopy}>
            <div className={styles.copyLabelRow}>
              <span className={styles.sectionNumber}>١ · التعريف</span>
              <span className={styles.copyStatus}>
                <i />
                سيرة علمية
              </span>
            </div>
            <h2>يحيى بن عبد الله بن يحيى البكري الشهري</h2>
            <div className={styles.personalDetails}>
              <article>
                <span className={styles.detailIcon}>
                  <CalendarDays size={20} />
                </span>
                <div>
                  <span>الميلاد</span>
                  <strong>١/٧/١٣٨٤هـ</strong>
                </div>
              </article>
              <article>
                <span className={styles.detailIcon}>
                  <UsersRound size={20} />
                </span>
                <div>
                  <span>الحالة الاجتماعية</span>
                  <strong>متزوج، أب لولدين وثلاث بنات</strong>
                </div>
              </article>
            </div>
            <div className={styles.identityNote}>
              <Sparkles size={17} />
              <span>أستاذ الحديث وعلومه بجامعة الملك خالد في أبها</span>
            </div>
          </div>

          <aside className={styles.identityCard} aria-label="صورة تعريفية لفضيلة الشيخ">
            <span className={styles.imageOrbit} aria-hidden="true" />
            <Image
              className={styles.aboutImage}
              src="/media/images/about3.png"
              alt="فضيلة الشيخ يحيى بن عبد الله البكري الشهري"
              width={700}
              height={700}
            />
          </aside>
        </div>
      </section>

      <section className={styles.educationSection}>
        <div className={styles.container}>
          <SectionHeading
            number="٢"
            eyebrow="التأهيل والترقي العلمي"
            title="الشهادات والدرجات العلمية"
            description="تسلسل زمني للشهادات الأكاديمية والدرجات العلمية منذ بداية المسيرة الجامعية."
            light
          />

          <div className={styles.educationGrid}>
            <article className={styles.timelineCard} data-about-reveal>
              <header className={styles.cardHeader}>
                <span className={styles.cardHeaderIcon}>
                  <GraduationCap size={24} />
                </span>
                <div>
                  <span>التأهيل الأكاديمي</span>
                  <h3>الشهادات العلمية</h3>
                </div>
              </header>
              <div className={styles.timeline}>
                {qualifications.map((item, index) => (
                  <div
                    className={styles.timelineItem}
                    key={`${item.year}-${item.title}`}
                    data-about-reveal
                    data-reveal-delay={String(index * 110)}
                  >
                    <span className={styles.timelineDot} aria-hidden="true" />
                    <time>{item.year}</time>
                    <h4>{item.title}</h4>
                    {item.text ? <p>{item.text}</p> : null}
                  </div>
                ))}
              </div>
            </article>

            <article
              className={`${styles.timelineCard} ${styles.timelineCardDark}`}
              data-about-reveal
              data-reveal-delay="120"
            >
              <header className={styles.cardHeader}>
                <span className={styles.cardHeaderIcon}>
                  <ChartNetwork size={24} />
                </span>
                <div>
                  <span>المسار الجامعي</span>
                  <h3>الدرجات العلمية</h3>
                </div>
              </header>
              <div className={styles.rankTrack}>
                {academicRanks.map((item, index) => (
                  <div
                    className={styles.rankItem}
                    key={item.title}
                    data-about-reveal
                    data-reveal-delay={String(index * 95)}
                  >
                    <span className={styles.rankNumber}>
                      {toArabicDigits(index + 1)}
                    </span>
                    <h4>{item.title}</h4>
                    <time>{item.year}</time>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.careerSection}>
        <SubpageBackdrop />
        <div className={styles.container}>
          <SectionHeading
            number="٣"
            eyebrow="الخبرة المؤسسية"
            title="الأعمال الإدارية وعضوية المجالس"
            description="مناصب إدارية وعضويات علمية على مستوى القسم والكلية والجامعة والجمعيات المتخصصة."
          />

          <div className={styles.careerGrid}>
            <div className={styles.rolesPanel} data-about-reveal>
              <div className={styles.panelTitle}>
                <BriefcaseBusiness size={22} />
                <h3>الأعمال الإدارية</h3>
              </div>
              <div className={styles.rolesList}>
                {administrativeRoles.map((role, index) => (
                  <article
                    key={role.title}
                    data-about-reveal
                    data-reveal-delay={String(index * 90)}
                  >
                    <span className={styles.roleIndex}>
                      {toArabicDigits(index + 1)}
                    </span>
                    <div>
                      <time>{role.period}</time>
                      <h4>{role.title}</h4>
                      <p>
                        <Building2 size={15} />
                        {role.place}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className={styles.councilsPanel} data-about-reveal data-reveal-delay="100">
              <div className={styles.panelTitle}>
                <Landmark size={22} />
                <h3>عضوية المجالس</h3>
                <span>{toArabicDigits(String(councilMemberships.length))}</span>
              </div>
              <ul>
                {councilMemberships.map((membership, index) => (
                  <li
                    key={`${membership.title}-${membership.period}`}
                    data-about-reveal
                    data-reveal-delay={String(index * 60)}
                  >
                    <span className={styles.councilIndex}>{toArabicDigits(index + 1)}</span>
                    <CheckCircle2 size={16} />
                    <div className={styles.councilContent}>
                      <h4>{membership.title}</h4>
                      <time className={styles.councilPeriod}>
                        <CalendarDays size={13} />
                        {membership.period}
                      </time>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className={styles.committeeRibbon} data-about-reveal>
            <span className={styles.committeeIcon}>
              <Network size={25} />
            </span>
            <div>
              <span>عضوية اللجان</span>
              <p>على مستوى القسم والكلية والجامعة</p>
            </div>
            <div className={styles.committeeCount}>
              <AnimatedNumber value={25} />
              <small>لجنة</small>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.impactSection}>
        <div className={styles.impactPattern} aria-hidden="true" />
        <div className={styles.container}>
          <SectionHeading
            number="٤"
            eyebrow="الإسهام العلمي"
            title="أثر ممتد في البحث والإشراف"
            description="حصيلة الإرشاد العلمي، والإشراف والمناقشات، وتحكيم الأبحاث، والمشاركة في اللجان."
            light
          />
          <div className={styles.impactGrid}>
            {impactStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <article
                  key={stat.label}
                  data-about-reveal
                  data-reveal-delay={String(impactStats.indexOf(stat) * 90)}
                >
                  <span className={styles.impactIcon}>
                    <Icon size={22} strokeWidth={1.5} />
                  </span>
                  <AnimatedNumber value={stat.value} prefix={'prefix' in stat ? stat.prefix : ''} />
                  <h3>{stat.label}</h3>
                  <p>{stat.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.supervisionSection}>
        <SubpageBackdrop />
        <div className={styles.container}>
          <SectionHeading
            number="٥"
            eyebrow="الإرشاد والإشراف والمناقشات"
            title="حضور علمي في ثماني جامعات"
            description="الخطط والرسائل العلمية التي تمت مراجعتها أو الإشراف عليها أو مناقشتها في عدد من الجامعات."
          />

          <div className={styles.supervisionLayout}>
            <aside className={styles.supervisionSummary} data-about-reveal>
              <AnimatedNumber value={147} />
              <h3>رسالة علمية</h3>
              <p>في الإرشاد والإشراف والمناقشة.</p>
              <div>
                <ClipboardCheck size={18} />
                <span>
                  ما يزيد على <b>١٠٠</b> خطة ماجستير أو دكتوراه تمت مراجعتها وتحريرها من خلال
                  اللجان أو بصورة شخصية.
                </span>
              </div>
            </aside>

            <div className={styles.universitiesGrid}>
              {supervisionUniversities.map((university, index) => (
                <article
                  key={university.name}
                  data-about-reveal
                  data-reveal-delay={String(index * 70)}
                >
                  <span className={styles.universityIndex}>
                    {toArabicDigits(index + 1)}
                  </span>
                  <University size={19} />
                  <h3>{university.name}</h3>
                  <p>
                    <AnimatedNumber value={university.count} /> {university.unit}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.outputSection}>
        <div className={styles.container}>
          <SectionHeading
            number="٦"
            eyebrow="التدريس والإنتاج المنشور"
            title="عطاء أكاديمي وتأليف علمي"
            description="مواد دراسية في المراحل الجامعية العليا، وبحوث وكتب محكّمة ومطبوعة."
            light
          />

          <div className={styles.outputLayout}>
            <article className={styles.teachingCard} data-about-reveal>
              <span className={styles.teachingIcon}>
                <LibraryBig size={28} />
              </span>
              <span className={styles.cardKicker}>المواد التي قام بتدريسها</span>
              <h3>خبرة تدريسية في مختلف المراحل الجامعية</h3>
              <div className={styles.teachingStats}>
                <div>
                  <AnimatedNumber value={12} prefix="+" />
                  <span>مادة في مرحلتي الماجستير والدكتوراه</span>
                </div>
                <i />
                <div>
                  <AnimatedNumber value={10} prefix="+" />
                  <span>مواد في مرحلة البكالوريوس</span>
                </div>
              </div>
            </article>

            <article className={styles.publicationsCard} data-about-reveal data-reveal-delay="110">
              <div className={styles.publicationsHead}>
                <BookCopy size={23} />
                <div>
                  <span>البحوث والكتب المنشورة</span>
                  <h3>الإنتاج العلمي</h3>
                </div>
              </div>
              <div className={styles.publicationGrid}>
                {publications.map((item, index) => (
                  <div
                    key={item.label}
                    data-about-reveal
                    data-reveal-delay={String(index * 80)}
                  >
                    <AnimatedNumber value={item.value} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.activitiesSection}>
        <SubpageBackdrop />
        <div className={styles.container}>
          <SectionHeading
            number="٧"
            eyebrow="المشاركة المجتمعية والعلمية"
            title="الدورات والمجالس والبرامج"
            description="مشاركات علمية وتوعوية وإعلامية داخل المملكة وخارجها."
          />

          <div className={styles.activitiesGrid}>
            {publicActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <article
                  className={activity.featured ? styles.activityFeatured : undefined}
                  key={activity.title}
                  data-about-reveal
                  data-reveal-delay={String((index % 3) * 90)}
                >
                  <div className={styles.activityTop}>
                    <span className={styles.activityIcon}>
                      <Icon size={22} strokeWidth={1.5} />
                    </span>
                    <AnimatedNumber value={activity.value} />
                  </div>
                  <h3>{activity.title}</h3>
                  <p>{activity.text}</p>
                  <span className={styles.activityLine} aria-hidden="true" />
                </article>
              );
            })}
          </div>

          <footer className={styles.documentDate}>
            <span className={styles.dateOrnament} aria-hidden="true">۞</span>
            <div>
              <span>آخر تحديث للسيرة</span>
              <time>٨ / ٩ / ١٤٤٦هـ</time>
            </div>
            <span className={styles.dateOrnament} aria-hidden="true">۞</span>
          </footer>
        </div>
      </section>
    </div>
  );
}
