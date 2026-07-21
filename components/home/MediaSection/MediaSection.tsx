"use client";

import { useState } from "react";
import { Clock3, Headphones, Pause, Play, Video } from "lucide-react";
import siteContent from "@/data/site-content.json";
import styles from "./MediaSection.module.css";

const playlistIcons = { Headphones, Video, Play } as const;
const playlists = siteContent.mediaPlaylists;

export default function MediaSection() {
  const [selected, setSelected] = useState(1);
  const [playing, setPlaying] = useState(false);

  return (
    <section id="media" className={styles.section}>
      <div className={styles.pattern} aria-hidden="true" />
      <div className={styles.container}>
        <div className={styles.copy}>
          <span className={styles.kicker}>المرئيات والصوتيات</span>
          <h2>العلم معك حيثما كنت</h2>
          <p>
            مكتبة وسائط مصممة للاستماع الهادئ والمتابعة المنظمة، مع تصنيف
            الدروس في سلاسل علمية واضحة.
          </p>

          <div className={styles.player}>
            <button
              type="button"
              onClick={() => setPlaying((value) => !value)}
              aria-label={playing ? "إيقاف العرض التجريبي" : "تشغيل العرض التجريبي"}
            >
              {playing ? (
                <Pause size={23} fill="currentColor" />
              ) : (
                <Play size={23} fill="currentColor" />
              )}
            </button>
            <div className={styles.playerInfo}>
              <span>واجهة مشغّل المواد</span>
              <strong>{playlists.find((item) => item.id === selected)?.title}</strong>
              <div className={styles.progress}>
                <i className={playing ? styles.progressPlaying : ""} />
              </div>
            </div>
            <span className={styles.time}>
              <Clock3 size={14} />
              تجريبي
            </span>
          </div>
        </div>

        <div className={styles.playlists}>
          {playlists.map((item, index) => {
            const Icon = playlistIcons[item.icon as keyof typeof playlistIcons];
            const isSelected = selected === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={isSelected ? styles.selected : ""}
                onClick={() => {
                  setSelected(item.id);
                  setPlaying(false);
                }}
              >
                <span className={styles.index}>٠{index + 1}</span>
                <span className={styles.listIcon}>
                  <Icon size={22} strokeWidth={1.45} />
                </span>
                <span className={styles.listCopy}>
                  <small>{item.kind}</small>
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
