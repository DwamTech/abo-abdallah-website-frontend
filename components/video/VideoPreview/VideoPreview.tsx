"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./VideoPreview.module.css";

type Props = {
  previewUrl?: string | null;
  posterUrl?: string | null;
  className?: string;
};

export default function VideoPreview({
  previewUrl,
  posterUrl,
  className = "",
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [canAnimate, setCanAnimate] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setFailed(false);
    setReady(false);
  }, [previewUrl]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !previewUrl) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    setCanAnimate(!reducedMotion.matches);

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "520px 0px", threshold: 0.01 },
    );
    observer.observe(root);

    return () => observer.disconnect();
  }, [previewUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!isVisible || !canAnimate) {
      video.pause();
      return;
    }

    void video.play().catch(() => {
      // Browsers may still defer autoplay; the poster remains a valid fallback.
    });
  }, [canAnimate, isVisible]);

  const posterStyle = posterUrl
    ? { backgroundImage: `url(${JSON.stringify(posterUrl)})` }
    : undefined;

  return (
    <div
      ref={rootRef}
      className={`${styles.preview} ${className}`.trim()}
      aria-hidden="true"
    >
      <span className={styles.poster} style={posterStyle} />
      <span
        className={`${styles.placeholder} ${previewUrl && !failed && !ready ? styles.loading : ""} ${ready ? styles.placeholderHidden : ""}`.trim()}
      >
        <i />
      </span>
      {previewUrl && isVisible && canAnimate && !failed && (
        <video
          ref={videoRef}
          className={`${styles.video} ${ready ? styles.videoReady : ""}`.trim()}
          src={previewUrl}
          poster={posterUrl || undefined}
          preload="auto"
          autoPlay
          muted
          loop
          playsInline
          tabIndex={-1}
          onCanPlay={() => {
            setReady(true);
            if (isVisible && canAnimate) void videoRef.current?.play();
          }}
          onLoadedData={() => setReady(true)}
          onError={() => {
            setFailed(true);
            setReady(false);
          }}
        />
      )}
      <span className={styles.scrim} />
    </div>
  );
}
