"use client";

import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { ChevronLeft, Megaphone, Pause, Play } from "lucide-react";
import type { NewsTickerItem } from "@/lib/newsTickerContract";
import styles from "./NewsTicker.module.css";

function AnnouncementGroup({
  items,
  repeatCount,
  duplicate = false,
  groupRef,
}: {
  items: NewsTickerItem[];
  repeatCount: number;
  duplicate?: boolean;
  groupRef?: RefObject<HTMLDivElement | null>;
}) {
  const groupName = duplicate ? "duplicate" : "primary";
  const renderedItems = Array.from(
    { length: items.length * repeatCount },
    (_, index) => ({
      item: items[index % items.length],
      isVisualClone: index >= items.length,
      index,
    }),
  );

  return (
    <div
      className={styles.group}
      aria-hidden={duplicate || undefined}
      ref={groupRef}
    >
      {renderedItems.map(({ item, isVisualClone, index }) => {
        const isHiddenClone = duplicate || isVisualClone;

        return (
          <div
            className={styles.itemWrap}
            key={`${groupName}-${index}-${item.key}`}
            aria-hidden={isHiddenClone || undefined}
          >
            <a
              className={styles.item}
              href={item.href}
              tabIndex={isHiddenClone ? -1 : 0}
            >
              <span className={styles.category}>{item.section.label}</span>
              <span className={styles.title}>{item.title}</span>
              <ChevronLeft size={14} strokeWidth={1.7} aria-hidden="true" />
            </a>
            <span className={styles.separator} aria-hidden="true" />
          </div>
        );
      })}
    </div>
  );
}

export default function NewsTickerMotion({
  items,
}: {
  items: NewsTickerItem[];
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [repeatCount, setRepeatCount] = useState(1);
  const viewportRef = useRef<HTMLDivElement>(null);
  const primaryGroupRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const primaryGroup = primaryGroupRef.current;
    if (!viewport || !primaryGroup || items.length === 0) return;

    const fitTrackToViewport = () => {
      const singleSequenceWidth = primaryGroup.scrollWidth / repeatCount;
      if (singleSequenceWidth <= 0) return;

      const requiredRepeats = Math.max(
        1,
        Math.ceil(viewport.clientWidth / singleSequenceWidth),
      );
      setRepeatCount((current) =>
        current === requiredRepeats ? current : requiredRepeats,
      );
    };

    fitTrackToViewport();
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(fitTrackToViewport);
    observer.observe(viewport);
    observer.observe(primaryGroup);

    return () => observer.disconnect();
  }, [items, repeatCount]);

  return (
    <aside className={styles.ticker} aria-label="آخر الأخبار والإعلانات">
      <div className={styles.inner}>
        <div className={styles.badge}>
          <span className={styles.liveDot} aria-hidden="true" />
          <Megaphone size={16} strokeWidth={1.6} aria-hidden="true" />
          <strong>جديد موقعنا</strong>
        </div>

        <div className={styles.viewport} ref={viewportRef}>
          <div
            className={`${styles.track} ${!isPlaying ? styles.paused : ""}`}
          >
            <AnnouncementGroup
              items={items}
              repeatCount={repeatCount}
              groupRef={primaryGroupRef}
            />
            <AnnouncementGroup
              items={items}
              repeatCount={repeatCount}
              duplicate
            />
          </div>
        </div>

        <button
          className={styles.control}
          type="button"
          onClick={() => setIsPlaying((value) => !value)}
          aria-label={isPlaying ? "إيقاف حركة الأخبار" : "تشغيل حركة الأخبار"}
          title={isPlaying ? "إيقاف الحركة" : "تشغيل الحركة"}
        >
          {isPlaying ? (
            <Pause size={15} fill="currentColor" />
          ) : (
            <Play size={15} fill="currentColor" />
          )}
        </button>
      </div>
    </aside>
  );
}
