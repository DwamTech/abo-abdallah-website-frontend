"use client";

import { useState } from "react";
import { ChevronLeft, Megaphone, Pause, Play } from "lucide-react";
import styles from "./NewsTicker.module.css";

const announcements = [
  {
    category: "الفتاوى",
    title: "أحدث الفتاوى والمسائل الحديثية",
    href: "#library",
  },
  {
    category: "المجالس العلمية",
    title: "مواعيد مجالس السماع القادمة",
    href: "#library",
  },
  {
    category: "جديد المكتبة",
    title: "الكتب والبحوث العلمية الجديدة",
    href: "#featured",
  },
  {
    category: "البرامج العلمية",
    title: "المحاضرات والدورات",
    href: "#media",
  },
  {
    category: "إعلان",
    title: "الإعلانات والفعاليات العلمية",
    href: "#featured",
  },
];

function AnnouncementGroup({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div className={styles.group} aria-hidden={duplicate || undefined}>
      {announcements.map((item) => (
        <div className={styles.itemWrap} key={`${duplicate}-${item.category}`}>
          <a className={styles.item} href={item.href} tabIndex={duplicate ? -1 : 0}>
            <span className={styles.category}>{item.category}</span>
            <span className={styles.title}>{item.title}</span>
            <ChevronLeft size={14} strokeWidth={1.7} aria-hidden="true" />
          </a>
          <span className={styles.separator} aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}

export default function NewsTicker() {
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <aside className={styles.ticker} aria-label="آخر الأخبار والإعلانات">
      <div className={styles.inner}>
        <div className={styles.badge}>
          <span className={styles.liveDot} aria-hidden="true" />
          <Megaphone size={16} strokeWidth={1.6} aria-hidden="true" />
          <strong>آخر الأخبار</strong>
        </div>

        <div className={styles.viewport}>
          <div
            className={`${styles.track} ${!isPlaying ? styles.paused : ""}`}
          >
            <AnnouncementGroup />
            <AnnouncementGroup duplicate />
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
