"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Film,
  LoaderCircle,
  Play,
  PlayCircle,
  RefreshCcw,
} from "lucide-react";
import SubpageBackdrop from "@/components/layout/SubpageBackdrop/SubpageBackdrop";
import { ShareButton } from "@/components/content/ShareButton/ShareButton";
import ViewCount from "@/components/content/ViewCount/ViewCount";
import VideoPreview from "@/components/video/VideoPreview/VideoPreview";
import { toArabicDigits } from "@/lib/arabicNumbers";
import {
  getScientificVideos,
  scientificVideosErrorMessage,
  type ScientificVideoCard,
} from "@/lib/scientificVideosApi";
import sharedStyles from "@/components/content/ContentIndex/ContentIndex.module.css";
import styles from "./VideoIndexContent.module.css";

const ITEMS_PER_PAGE = 6;

export default function VideoIndexContent() {
  const [items, setItems] = useState<ScientificVideoCard[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getScientificVideos({ page, per_page: ITEMS_PER_PAGE }, controller.signal)
      .then((result) => {
        setItems(result.data);
        setLastPage(result.meta.last_page);
        setTotal(result.meta.total);
      })
      .catch((requestError: unknown) => {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        )
          return;
        setItems([]);
        setError(scientificVideosErrorMessage(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [page, retryKey]);

  const visiblePages = useMemo(() => {
    const start = Math.max(1, Math.min(page - 2, lastPage - 4));
    const end = Math.min(lastPage, start + 4);
    return Array.from(
      { length: Math.max(0, end - start + 1) },
      (_, index) => start + index,
    );
  }, [lastPage, page]);

  function changePage(nextPage: number) {
    if (nextPage < 1 || nextPage > lastPage || nextPage === page) return;
    setPage(nextPage);
    document
      .getElementById("content-archive")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <section className={`${sharedStyles.hero} ${sharedStyles.videoHero}`}>
        <div className={sharedStyles.heroInner}>
          <div className={sharedStyles.heroCopy}>
            <span>المكتبة المرئية</span>
            <h1>المرئيات واللقاءات العلمية</h1>
            <p>مواد مرئية منظمة للدرس والمحاضرة واللقاء العلمي.</p>
          </div>
          <div className={sharedStyles.heroMotion} aria-hidden="true">
            <span className={sharedStyles.motionOrbit} />
            <span className={sharedStyles.motionIcon}>
              <Film size={48} strokeWidth={1.35} />
              <Play size={19} fill="currentColor" />
            </span>
            <span className={sharedStyles.motionBars}>
              {Array.from({ length: 9 }, (_, index) => (
                <i key={index} />
              ))}
            </span>
          </div>
        </div>
      </section>

      <section className={sharedStyles.content} id="content-archive">
        <SubpageBackdrop />
        <div className={sharedStyles.container}>
          <header>
            <h2>أحدث المرئيات</h2>
            <span>{loading ? "—" : toArabicDigits(total)} مواد منشورة</span>
          </header>

          {loading ? (
            <div
              className={`${sharedStyles.grid} ${sharedStyles.videoGrid}`}
              aria-label="جارٍ تحميل المرئيات"
              aria-busy="true"
            >
              {Array.from({ length: ITEMS_PER_PAGE }, (_, index) => (
                <article className={styles.skeleton} key={index}>
                  <LoaderCircle className={styles.spinner} size={27} />
                  <span />
                  <span />
                  <span />
                </article>
              ))}
            </div>
          ) : error ? (
            <div className={styles.state} role="alert">
              <RefreshCcw size={29} />
              <strong>تعذّر تحميل المرئيات</strong>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => setRetryKey((value) => value + 1)}
              >
                إعادة المحاولة
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className={styles.state}>
              <Film size={30} />
              <strong>لا توجد مواد مرئية منشورة بعد</strong>
              <p>ستظهر المواد هنا فور نشرها من لوحة الإدارة.</p>
            </div>
          ) : (
            <div className={`${sharedStyles.grid} ${sharedStyles.videoGrid}`}>
              {items.map((item, index) => {
                const itemNumber = (page - 1) * ITEMS_PER_PAGE + index + 1;
                return (
                  <article
                    className={styles.videoCard}
                    id={item.slug}
                    key={item.slug}
                  >
                    <VideoPreview
                      className={styles.cardPreview}
                      previewUrl={item.preview_url}
                      posterUrl={item.thumbnail_url}
                    />
                    <span className={sharedStyles.number}>
                      {toArabicDigits(String(itemNumber).padStart(2, "0"))}
                    </span>
                    <span
                      className={`${sharedStyles.playIcon} ${styles.cardPlay}`}
                    >
                      <PlayCircle size={30} />
                    </span>
                    <div className={styles.cardCopy}>
                      <small>{item.category}</small>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                    <footer>
                      <span>
                        <PlayCircle size={15} />{" "}
                        {toArabicDigits(item.duration_label)}
                      </span>
                      <span>{item.date_label}</span>
                      <ViewCount count={item.views_count} tone="muted" />
                      <ShareButton
                        ariaLabel={`نسخ رابط المادة المرئية: ${item.title}`}
                        className={styles.cardShare}
                        href={`/videos/${item.slug}`}
                        iconOnly
                      />
                      <Link href={`/videos/${item.slug}`}>
                        التفاصيل <ArrowLeft size={15} />
                      </Link>
                    </footer>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && !error && lastPage > 1 && (
            <nav
              className={sharedStyles.pagination}
              aria-label="صفحات المرئيات"
            >
              <button
                type="button"
                disabled={page === 1}
                onClick={() => changePage(page - 1)}
              >
                <ArrowRight size={17} />
                <span>السابقة</span>
              </button>
              <div>
                {visiblePages.map((pageNumber) => (
                  <button
                    className={
                      pageNumber === page ? sharedStyles.activePage : ""
                    }
                    type="button"
                    key={pageNumber}
                    onClick={() => changePage(pageNumber)}
                    aria-current={pageNumber === page ? "page" : undefined}
                  >
                    {toArabicDigits(pageNumber)}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={page === lastPage}
                onClick={() => changePage(page + 1)}
              >
                <span>التالية</span>
                <ArrowLeft size={17} />
              </button>
            </nav>
          )}
        </div>
      </section>
    </>
  );
}
