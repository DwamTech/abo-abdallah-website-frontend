import Link from "next/link";
import { ArrowLeft, BookOpenCheck, Layers3 } from "lucide-react";
import { ShareButton } from "@/components/content/ShareButton/ShareButton";
import ViewCount from "@/components/content/ViewCount/ViewCount";
import {
  getHadithCardsHome,
  hadithCardsErrorMessage,
  resolveHadithCardImageUrl,
} from "@/lib/hadithCardsApi";
import styles from "./HadithCardsSection.module.css";

export default async function HadithCardsSection() {
  let response: Awaited<ReturnType<typeof getHadithCardsHome>> | null = null;
  let error: string | null = null;

  try {
    response = await getHadithCardsHome();
  } catch (requestError) {
    error = hadithCardsErrorMessage(requestError);
  }

  const projects = response?.data ?? [];
  // The API field is additive so a frontend deployment remains usable while a
  // backend is catching up. Once available, `gallery_cards` is the source of
  // truth and is selected randomly by the backend across every public section.
  const fallbackCardKeys = new Set<string>();
  const fallbackGalleryCards = projects
    .flatMap((project) => {
      const cards = [
        project.cover_card,
        ...project.gallery_preview,
        ...project.cards,
      ].filter((card): card is NonNullable<typeof card> => Boolean(card))
        .filter((card) => {
          const key = `${project.slug}:${card.id}`;

          if (fallbackCardKeys.has(key)) return false;
          fallbackCardKeys.add(key);
          return true;
        });

      return cards.map((card) => ({
        ...card,
        project: {
          slug: project.slug,
          title: project.title,
        },
      }));
    })
    .slice(0, 10);
  const galleryCards = response?.gallery_cards.length
    ? response.gallery_cards
    : fallbackGalleryCards;

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

        <div className={styles.galleryArea}>
          {galleryCards.length ? (
            <ul className={styles.cardsRail} aria-label="مختارات البطاقات الحديثية">
              {galleryCards.map((card) => {
                const imageUrl = resolveHadithCardImageUrl(card.image_url);
                const cardTitle = card.title || "بطاقة حديثية";

                return (
                  <li key={`${card.project.slug}-${card.id}`}>
                    <Link
                      className={styles.galleryCard}
                      href={`/hadith-cards#${encodeURIComponent(card.project.slug)}`}
                      aria-label={`فتح قسم ${card.project.title}: ${cardTitle}`}
                    >
                      <span className={styles.imageWrap}>
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={card.alt_text || cardTitle}
                            loading="lazy"
                          />
                        ) : (
                          <span className={styles.imageMissing}>
                            <Layers3 size={29} />
                            لا توجد صورة مرفقة
                          </span>
                        )}
                      </span>
                      <span className={styles.cardOverlay}>
                        <span className={styles.cardProject}>
                          <BookOpenCheck size={13} />
                          {card.project.title}
                        </span>
                        <strong>{cardTitle}</strong>
                        <span className={styles.cardMeta}>
                          <ViewCount count={card.views_count} tone="light" />
                          <ArrowLeft size={15} aria-hidden="true" />
                        </span>
                      </span>
                    </Link>
                    <ShareButton
                      className={styles.cardShare}
                      href={`/hadith-cards#${encodeURIComponent(card.project.slug)}`}
                      includeHash
                      iconOnly
                      shareTitle={cardTitle}
                      ariaLabel={`مشاركة الصورة: ${cardTitle}`}
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <div
              className={styles.sectionState}
              role={error ? "alert" : "status"}
            >
              <Layers3 size={31} />
              <strong>
                {error
                  ? "تعذّر تحميل البطاقات الحديثية"
                  : "لا توجد مشروعات بطاقات منشورة بعد"}
              </strong>
              <p>
                {error || "ستظهر مختارات البطاقات هنا فور نشرها من لوحة الإدارة."}
              </p>
              <Link href="/hadith-cards">
                فتح صفحة البطاقات <ArrowLeft size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
