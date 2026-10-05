"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  getLibraryIndexRecords,
  type GoldenVisitRecord,
} from "@/lib/libraryIndexesApi";
import styles from "./GoldenVisitsSection.module.css";

function formatVisitDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;

  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))));
}

function VisitorImage({ visitor }: { visitor: GoldenVisitRecord }) {
  const [failed, setFailed] = useState(false);

  if (!visitor.image_url || failed) {
    return <UserRound size={44} aria-hidden="true" />;
  }

  // The backend only serves this URL for approved visits.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={visitor.image_url} alt={`صورة الزائر ${visitor.name}`} loading="lazy" onError={() => setFailed(true)} />;
}

export default function GoldenVisitsSection() {
  const [visits, setVisits] = useState<GoldenVisitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sliderPaused, setSliderPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const currentCardRef = useRef(0);

  useEffect(() => {
    const controller = new AbortController();

    getLibraryIndexRecords(
      "golden-visits",
      { per_page: 12, with_comment: 1 },
      controller.signal,
    )
      .then((result) => setVisits(result.data))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setVisits([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const moveSlider = (step: number) => {
    const track = trackRef.current;
    if (!track || visits.length < 2) return;

    const cards = Array.from(
      track.querySelectorAll<HTMLElement>("[data-golden-card]"),
    );
    const next = (currentCardRef.current + step + cards.length) % cards.length;
    currentCardRef.current = next;
    const target = cards[next];
    if (!target) return;

    const trackRect = track.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const isRtl = window.getComputedStyle(track).direction === "rtl";
    const horizontalDistance = isRtl
      ? targetRect.right - trackRect.right
      : targetRect.left - trackRect.left;

    track.scrollBy({ left: horizontalDistance, behavior: "smooth" });
  };

  useEffect(() => {
    if (visits.length < 2 || sliderPaused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => moveSlider(1), 1000);
    return () => window.clearInterval(timer);
  }, [visits.length, sliderPaused]);

  return (
    <section className={styles.section} id="golden-visits">
      <div className={styles.container}>
        <header className={styles.heading}>
          <div>
            <span><Sparkles size={16} /> من ذاكرة المكتبة</span>
            <h2>كلمات <em>السجل الذهبي</em></h2>
          </div>
         
          <div className={styles.headingActions}>
            {visits.length > 1 && (
              <div className={styles.controls} aria-label="التنقل بين كلمات الزوار">
                <button type="button" aria-label="السابق" onClick={() => moveSlider(-1)}><ChevronRight size={19} /></button>
                <button type="button" aria-label="التالي" onClick={() => moveSlider(1)}><ChevronLeft size={19} /></button>
              </div>
            )}
            <Link className={styles.registryLink} href="/library-indexes#golden-record-details">
              سجل الزيارات <ArrowLeft size={15} />
            </Link>
          </div>
        </header>

        {loading ? (
          <div className={styles.state} role="status"><LoaderCircle className={styles.spinner} size={23} /> جارٍ تحميل كلمات الزوار...</div>
        ) : visits.length ? (
          <div
            className={styles.track}
            ref={trackRef}
            aria-label="بطاقات كلمات الزوار"
            onMouseEnter={() => setSliderPaused(true)}
            onMouseLeave={() => setSliderPaused(false)}
            onFocusCapture={() => setSliderPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setSliderPaused(false);
            }}
            onTouchStart={() => setSliderPaused(true)}
            onTouchEnd={() => setSliderPaused(false)}
          >
            {visits.map((visitor) => (
              <Link data-golden-card className={styles.card} href={`/library-indexes/golden-visits/${visitor.id}`} key={visitor.id}>
                <span className={styles.cardOrnament} aria-hidden="true" />
                <div className={styles.cardBody}>
                  <div className={styles.photoPanel}>
                    <div className={styles.photoFrame}><VisitorImage visitor={visitor} /></div>
                    <span>زيارة موثقة</span>
                  </div>
                  <div className={styles.cardIdentity}>
                    <span className={styles.libraryMark}><Sparkles size={13} /> المكتبة البكرية</span>
                    <div className={styles.wordmark} aria-label="السجل الذهبي">
                      <span>«</span>
                      <strong>السجل الذهبي</strong>
                      <span>»</span>
                    </div>
                    <span className={styles.date}><CalendarDays size={14} /> {formatVisitDate(visitor.visit_date)}</span>
                  </div>
                </div>

                <footer>
                  <span><small>ضيف السجل الذهبي</small><strong>{visitor.name}</strong></span>
                  <span className={styles.open}>عرض الكلمة <ArrowLeft size={17} /></span>
                </footer>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.state}><Sparkles size={21} /> ستظهر هنا كلمات الزوار بعد اعتمادها.</div>
        )}
      </div>
    </section>
  );
}
