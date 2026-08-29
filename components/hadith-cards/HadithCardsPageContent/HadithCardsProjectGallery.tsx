"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Images,
  LoaderCircle,
  Maximize2,
  RefreshCw,
  X,
} from "lucide-react";

import HashTrackedViewCount from "@/components/content/ViewCount/HashTrackedViewCount";
import { ShareButton } from "@/components/content/ShareButton/ShareButton";
import { toArabicDigits } from "@/lib/arabicNumbers";
import {
  getHadithCardsProjectGalleryPage,
  resolveHadithCardImageUrl,
  type HadithCard,
  type HadithCardProject,
} from "@/lib/hadithCardsApi";

import styles from "./HadithCardsPageContent.module.css";

type HadithCardsProjectGalleryProps = {
  project: HadithCardProject;
  ordinal: string;
};

type LoadResult = {
  added: number;
  total: number;
};

function cardIdentity(card: HadithCard) {
  return `${card.id}:${card.slug}`;
}

function uniqueCards(cards: readonly HadithCard[]) {
  const seen = new Set<string>();

  return cards.filter((card) => {
    const key = cardIdentity(card);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * New responses deliberately send a tiny gallery preview. Older responses
 * contain the whole list under `cards`, so the latter stays as a safe fallback
 * throughout the gradual backend rollout.
 */
function initialGalleryCards(project: HadithCardProject) {
  return uniqueCards(
    project.gallery_preview.length > 0 ? project.gallery_preview : project.cards,
  );
}

function galleryCount(project: HadithCardProject, cards: readonly HadithCard[]) {
  return Math.max(project.cards_count, project.gallery_count ?? 0, cards.length);
}

function coverForProject(project: HadithCardProject, cards: readonly HadithCard[]) {
  const fallbackCard = project.cover_card ?? cards[0] ?? null;

  return {
    src: resolveHadithCardImageUrl(
      project.cover_image_url ?? fallbackCard?.image_url,
    ),
    alt:
      project.cover_alt_text ?? fallbackCard?.alt_text ?? `غلاف ${project.title}`,
  };
}

function focusableElements(container: HTMLElement | null) {
  return container?.querySelectorAll<HTMLElement>(
    'button:not([disabled]):not([tabindex="-1"]), [href]:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])',
  );
}

export default function HadithCardsProjectGallery({
  project,
  ordinal,
}: HadithCardsProjectGalleryProps) {
  const initialCards = useMemo(() => initialGalleryCards(project), [project]);
  const initialCount = galleryCount(project, initialCards);
  const initialHasMore =
    project.gallery_has_more || initialCount > initialCards.length;

  const [cards, setCards] = useState<HadithCard[]>(initialCards);
  const [total, setTotal] = useState(initialCount);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [nextPage, setNextPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const cardsRef = useRef(cards);
  const activeIndexRef = useRef(activeIndex);
  const totalRef = useRef(total);
  const hasMoreRef = useRef(hasMore);
  const nextPageRef = useRef(nextPage);
  const loadingRef = useRef(false);
  const loadedPagesRef = useRef(new Set<number>());
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    totalRef.current = total;
  }, [total]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    nextPageRef.current = nextPage;
  }, [nextPage]);

  useEffect(() => {
    cardsRef.current = initialCards;
    totalRef.current = initialCount;
    hasMoreRef.current = initialHasMore;
    nextPageRef.current = 1;
    loadedPagesRef.current = new Set();
    setCards(initialCards);
    setTotal(initialCount);
    setHasMore(initialHasMore);
    setNextPage(1);
    activeIndexRef.current = 0;
    setActiveIndex(0);
    setLoadError(null);
  }, [
    initialCards,
    initialCount,
    initialHasMore,
    project.slug,
  ]);

  const loadNextPage = useCallback(async (): Promise<LoadResult> => {
    if (!hasMoreRef.current || loadingRef.current) {
      return { added: 0, total: cardsRef.current.length };
    }

    const page = nextPageRef.current;
    if (loadedPagesRef.current.has(page)) {
      return { added: 0, total: cardsRef.current.length };
    }

    loadingRef.current = true;
    setIsLoading(true);
    setLoadError(null);

    try {
      const galleryPage = await getHadithCardsProjectGalleryPage(
        project.slug,
        page,
      );
      const previous = cardsRef.current;
      const merged = uniqueCards([...previous, ...galleryPage.data]);
      const added = merged.length - previous.length;
      const meta = galleryPage.meta;
      const currentPage = meta?.current_page ?? page;
      const lastPage = meta?.last_page;
      const reportedTotal = meta?.total ?? totalRef.current;
      const next = currentPage + 1;
      const nextHasMore =
        typeof lastPage === "number"
          ? currentPage < lastPage
          : reportedTotal > merged.length;

      loadedPagesRef.current.add(page);
      cardsRef.current = merged;
      totalRef.current = Math.max(reportedTotal, merged.length);
      hasMoreRef.current = nextHasMore;
      nextPageRef.current = next;
      setCards(merged);
      setTotal(Math.max(reportedTotal, merged.length));
      setHasMore(nextHasMore);
      setNextPage(next);

      return { added, total: merged.length };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "تعذّر تحميل المزيد من البطاقات. حاول مرة أخرى.";
      setLoadError(message);
      return { added: 0, total: cardsRef.current.length };
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [project.slug]);

  const closeGallery = useCallback(() => {
    setIsOpen(false);
  }, []);

  const selectCard = useCallback((index: number) => {
    const nextIndex = Math.max(0, Math.min(index, cardsRef.current.length - 1));
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
  }, []);

  const syncProjectHash = useCallback(() => {
    const expectedHash = `#${encodeURIComponent(project.slug)}`;
    if (window.location.hash === expectedHash) return;

    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${window.location.search}${expectedHash}`,
    );
    // replaceState deliberately does not emit this event. Dispatching it keeps
    // the existing per-project view counter behaviour intact on cover clicks.
    window.dispatchEvent(new Event("hashchange"));
  }, [project.slug]);

  const openGallery = useCallback(
    (index: number, trigger: HTMLButtonElement) => {
      triggerRef.current = trigger;
      syncProjectHash();
      selectCard(index);
      setIsOpen(true);

      // A preview is immediately usable; subsequent images are requested only
      // after the visitor decides to open the project.
      if (hasMoreRef.current && !loadedPagesRef.current.has(nextPageRef.current)) {
        void loadNextPage();
      }
    },
    [loadNextPage, selectCard, syncProjectHash],
  );

  const goPrevious = useCallback(() => {
    selectCard(activeIndexRef.current - 1);
  }, [selectCard]);

  const goNext = useCallback(async () => {
    const lastAvailableIndex = cardsRef.current.length - 1;
    if (activeIndexRef.current < lastAvailableIndex) {
      selectCard(activeIndexRef.current + 1);
      return;
    }

    if (!hasMoreRef.current) return;
    const result = await loadNextPage();
    if (result.added > 0) {
      selectCard(activeIndexRef.current + 1);
    }
  }, [loadNextPage, selectCard]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => closeRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeGallery();
        return;
      }

      // The visual sequence follows Arabic right-to-left reading direction.
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        void goNext();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goPrevious();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus({ preventScroll: true });
    };
  }, [closeGallery, goNext, goPrevious, isOpen]);

  useEffect(() => {
    if (!cards.length) return;
    if (activeIndex < cards.length) return;
    selectCard(cards.length - 1);
  }, [activeIndex, cards.length, selectCard]);

  const trapFocus = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab") return;

    const focusable = focusableElements(dialogRef.current);
    if (!focusable?.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const cover = coverForProject(project, cards);
  const previewCards = cards.slice(0, 3);
  const activeCard = cards[activeIndex] ?? null;
  const activeImageUrl = resolveHadithCardImageUrl(activeCard?.image_url);
  const displayTotal = Math.max(total, cards.length);
  const canOpen = cards.length > 0 || hasMore;
  const canMovePrevious = activeIndex > 0;
  const canMoveNext = activeIndex < cards.length - 1 || hasMore;

  const dialog = isOpen ? (
    <div
      className={styles.lightboxOverlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) closeGallery();
      }}
    >
      <section
        ref={dialogRef}
        className={styles.lightbox}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={trapFocus}
      >
        <header className={styles.lightboxHeader}>
          <div>
            <span><Images size={15} /> معرض البطاقات</span>
            <h2 id={titleId}>{project.title}</h2>
          </div>
          <button
            ref={closeRef}
            className={styles.closeLightbox}
            type="button"
            onClick={closeGallery}
            aria-label={`إغلاق معرض ${project.title}`}
          >
            <X size={21} />
          </button>
        </header>

        <div className={styles.lightboxBody}>
          <div className={styles.lightboxStage}>
            <button
              className={styles.galleryNav}
              type="button"
              onClick={goPrevious}
              disabled={!canMovePrevious}
              aria-label="البطاقة السابقة"
            >
              <ChevronRight size={25} />
            </button>

            <figure className={styles.activeCard}>
              {activeImageUrl ? (
                <img
                  src={activeImageUrl}
                  alt={activeCard?.alt_text || `بطاقة من ${project.title}`}
                />
              ) : (
                <span className={styles.activeCardMissing}>
                  <Images size={34} />
                  {isLoading
                    ? "جارٍ تجهيز صور المعرض…"
                    : "لا توجد صورة متاحة لهذه البطاقة."}
                </span>
              )}
              {(activeCard?.title || activeCard?.alt_text) && (
                <figcaption>{activeCard.title || activeCard.alt_text}</figcaption>
              )}
            </figure>

            <button
              className={styles.galleryNav}
              type="button"
              onClick={() => void goNext()}
              disabled={!canMoveNext || isLoading}
              aria-label="البطاقة التالية"
            >
              <ChevronLeft size={25} />
            </button>
          </div>

          <div className={styles.galleryProgress} aria-live="polite" aria-atomic="true">
            <span>
              {cards.length
                ? `البطاقة ${toArabicDigits(activeIndex + 1)} من ${toArabicDigits(displayTotal)}`
                : "جارٍ تحميل البطاقات"}
            </span>
            {isLoading && <LoaderCircle className={styles.gallerySpinner} size={17} aria-label="جارٍ تحميل الصور" />}
          </div>

          {cards.length > 0 && (
            <div className={styles.galleryThumbnails} aria-label="صور معرض المشروع">
              {cards.map((card, index) => {
                const thumbnailUrl = resolveHadithCardImageUrl(card.image_url);
                const selected = index === activeIndex;

                return (
                  <button
                    className={selected ? styles.thumbnailActive : ""}
                    type="button"
                    key={cardIdentity(card)}
                    onClick={() => selectCard(index)}
                    aria-label={`عرض البطاقة ${toArabicDigits(index + 1)}${card.title ? `: ${card.title}` : ""}`}
                    aria-current={selected ? "true" : undefined}
                  >
                    {thumbnailUrl ? (
                      <img src={thumbnailUrl} alt="" />
                    ) : (
                      <Images size={17} aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {(hasMore || loadError) && (
            <div className={styles.galleryMore}>
              {loadError && <p role="alert">{loadError}</p>}
              {hasMore && (
                <button
                  type="button"
                  onClick={() => void loadNextPage()}
                  disabled={isLoading}
                >
                  {isLoading ? <LoaderCircle className={styles.gallerySpinner} size={16} /> : <RefreshCw size={16} />}
                  {isLoading ? "جارٍ تحميل المزيد…" : "تحميل المزيد من البطاقات"}
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  ) : null;

  return (
    <article
      className={`${styles.project} ${styles[project.accent]}`}
      id={project.slug}
    >
      <div className={styles.projectCoverColumn}>
        <button
          className={styles.projectCoverButton}
          type="button"
          onClick={(event) => openGallery(0, event.currentTarget)}
          disabled={!canOpen}
          aria-haspopup="dialog"
          aria-label={`فتح معرض ${project.title}`}
        >
          {cover.src ? (
            <img src={cover.src} alt={cover.alt} />
          ) : (
            <span className={styles.projectCoverMissing}>
              <Images size={32} />
              لا توجد صورة غلاف مرفقة
            </span>
          )}
          <span className={styles.coverAction}>
            <Maximize2 size={16} />
            فتح المعرض
          </span>
        </button>
      </div>

      <div className={styles.projectCopy}>
        <span className={styles.projectNumber}>المشروع {ordinal}</span>
        {project.eyebrow && <small>{project.eyebrow}</small>}
        <h2>{project.title}</h2>
        {project.description && <p>{project.description}</p>}

        {previewCards.length > 0 && (
          <div className={styles.projectPreview} aria-label={`معاينة معرض ${project.title}`}>
            {previewCards.map((card, index) => {
              const imageUrl = resolveHadithCardImageUrl(card.image_url);

              return (
                <button
                  type="button"
                  key={cardIdentity(card)}
                  onClick={(event) => openGallery(index, event.currentTarget)}
                  aria-haspopup="dialog"
                  aria-label={`فتح البطاقة ${toArabicDigits(index + 1)} من معرض ${project.title}`}
                >
                  {imageUrl ? <img src={imageUrl} alt="" /> : <Images size={18} />}
                </button>
              );
            })}
          </div>
        )}

        <div className={styles.projectActions}>
          <button
            className={styles.openGalleryButton}
            type="button"
            onClick={(event) => openGallery(0, event.currentTarget)}
            disabled={!canOpen}
            aria-haspopup="dialog"
          >
            <Images size={17} />
            فتح الجاليري
            <ArrowLeft size={16} />
          </button>
          <ShareButton
            href={`/hadith-cards#${encodeURIComponent(project.slug)}`}
            includeHash
            shareTitle={project.title}
            ariaLabel={`مشاركة صور مشروع: ${project.title}`}
          />
          <span>
            <Images size={16} />
            {toArabicDigits(displayTotal)} بطاقة
          </span>
        </div>

        <footer className={styles.projectFooter}>
          <HashTrackedViewCount
            endpoint={`/api/hadith-cards/projects/${encodeURIComponent(project.slug)}/view`}
            initialCount={project.views_count}
            projectSlug={project.slug}
            tone="muted"
          />
          <span><Images size={16} /> مشروع متجدد</span>
        </footer>
      </div>

      {typeof document !== "undefined" && dialog
        ? createPortal(dialog, document.body)
        : null}
    </article>
  );
}
