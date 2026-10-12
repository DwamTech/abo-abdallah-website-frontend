import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Quote, Sparkles, UserRound } from "lucide-react";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import { getPublicGoldenVisit } from "@/lib/publicGoldenVisit";
import styles from "./page.module.css";

type PageProps = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "كلمات السجل الذهبي",
  description: "كلمات وانطباعات زوار المكتبة البكرية المعتمدة في السجل الذهبي.",
};

function visitDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;
  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))),
  );
}

export default async function GoldenVisitPage({ params }: PageProps) {
  const { id } = await params;
  let visit;

  try {
    visit = await getPublicGoldenVisit(id);
  } catch {
    return (
      <>
        <Header />
        <main className={styles.unavailable}>
          <h1>تعذّر عرض كلمة الزائر الآن</h1>
          <p>يرجى المحاولة مرة أخرى بعد قليل.</p>
          <Link href="/library-indexes#golden-record-details">العودة إلى السجل الذهبي</Link>
        </main>
        <Footer />
      </>
    );
  }

  if (!visit) notFound();

  return (
    <>
      <Header />
      <main className={styles.page} dir="rtl">
        <section className={styles.hero}>
          <div className={styles.heroVeil} aria-hidden="true" />
          <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="مسار الصفحة">
            <Link href="/library-indexes#golden-record-details"><ArrowRight size={16} /> السجل الذهبي</Link>
            <span>/</span>
            <span>كلمة الزائر</span>
          </nav>

            <div className={styles.heroCopy}>
              {/* <span className={styles.heroEyebrow}><Sparkles size={16} /> من ذاكرة المكتبة البكرية</span> */}
              <h1>كلمات <span>السجل الذهبي</span></h1>
              <p>مساحة تحفظ كلمات زوار المكتبة وانطباعاتهم، لتبقى الزيارة جزءًا من ذاكرتها العلمية والإنسانية.</p>
              <div className={styles.heroMeta}>
                <span><UserRound size={17} /> {visit.name}</span>
                <span><CalendarDays size={17} /> {visitDate(visit.visit_date)}</span>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.wrap}>
          <article className={styles.story}>
            <header className={`${styles.profileHero} ${!visit.image_url ? styles.profileWithoutPortrait : ""}`}>
              {visit.image_url && <div className={styles.portraitColumn}>
                <div className={styles.photoFrame}>
                  {visit.image_url ? (
                    // The photo is served by the backend's approved-visit image endpoint.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={visit.image_url} alt={`صورة الزائر ${visit.name}`} />
                  ) : (
                    <UserRound size={82} aria-hidden="true" />
                  )}
                </div>
                <span className={styles.photoCaption}>صورة من سجل زوار المكتبة</span>
              </div>}

              <div className={styles.intro}>
              <span className={styles.kicker}><Sparkles size={17} /> السجل الذهبي</span>
                <h2>{visit.name}</h2>
              <div className={styles.rule} aria-hidden="true"><span /></div>
              <div className={styles.visitorMeta}>
                  <span className={styles.visitorName}><UserRound size={18} /> زائر المكتبة البكرية</span>
                <span><CalendarDays size={17} /> {visitDate(visit.visit_date)}</span>
              </div>
                <p>كلمة موثقة ضمن السجل الذهبي لزوار المكتبة البكرية.</p>
              </div>
            </header>

            <section className={styles.wordSection} aria-labelledby="visitor-word-title">
              <header className={styles.wordHeading}>
                <span className={styles.quoteIcon}><Quote size={30} aria-hidden="true" /></span>
                <div>
                  <small>من ذاكرة الزيارة</small>
                  <h2 id="visitor-word-title">كلمة الزائر</h2>
                </div>
              </header>
              {visit.visitor_comment && <div className={styles.quoteBox}>
                <blockquote>{visit.visitor_comment}</blockquote>
              </div>}
              {visit.word_image_url && <figure className={styles.wordImageFrame}>
                <a href={visit.word_image_url} target="_blank" rel="noopener noreferrer" aria-label={`فتح صورة كلمة ${visit.name} بالحجم الكامل`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={visit.word_image_url} alt={`كلمة الزائر ${visit.name} في السجل الذهبي`} />
                </a>
                <figcaption>صورة كلمة الزائر — اضغط لعرضها بالحجم الكامل</figcaption>
              </figure>}
              {!visit.visitor_comment && !visit.word_image_url && <p>لم تُضف كلمة لهذه الزيارة بعد.</p>}
              <footer className={styles.storyFooter}>
              <Link className={styles.backLink} href="/library-indexes#golden-record-details">
                <ArrowRight size={17} /> العودة إلى السجل الذهبي
              </Link>
                <span><Sparkles size={15} /> المكتبة البكرية</span>
              </footer>
            </section>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
