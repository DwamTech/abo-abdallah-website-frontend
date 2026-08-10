"use client";

import { useState, type CSSProperties } from "react";
import styles from "./AdaptiveVideoPlayer.module.css";

type Orientation = "loading" | "landscape" | "portrait" | "square";

type PlayerStyle = CSSProperties & {
  "--video-aspect"?: number;
  "--video-poster"?: string;
};

export default function AdaptiveVideoPlayer({
  src,
  poster,
  duration,
}: {
  src: string;
  poster?: string | null;
  duration: string;
}) {
  const [orientation, setOrientation] = useState<Orientation>("loading");
  const [aspectRatio, setAspectRatio] = useState(16 / 9);

  const playerStyle: PlayerStyle = {
    "--video-aspect": aspectRatio,
    ...(poster ? { "--video-poster": `url(${JSON.stringify(poster)})` } : {}),
  };

  return (
    <div
      className={`${styles.player} ${styles[orientation]}`}
      data-video-orientation={orientation}
      style={playerStyle}
    >
      <span className={styles.ambient} aria-hidden="true" />
      <video
        controls
        playsInline
        preload="metadata"
        src={src}
        poster={poster || undefined}
        onLoadedMetadata={(event) => {
          const { videoWidth, videoHeight } = event.currentTarget;
          if (!videoWidth || !videoHeight) return;
          const ratio = videoWidth / videoHeight;
          setAspectRatio(ratio);
          setOrientation(
            ratio > 1.12 ? "landscape" : ratio < 0.88 ? "portrait" : "square",
          );
        }}
      >
        متصفحك لا يدعم تشغيل الفيديو.
      </video>
      <span className={styles.duration}>{duration}</span>
    </div>
  );
}
