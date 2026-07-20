"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { ArrowUp } from "lucide-react";
import styles from "./ScrollToTop.module.css";

type ProgressStyle = CSSProperties & {
  "--scroll-progress": string;
};

export default function ScrollToTop() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;

    const updateScrollState = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollableHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const nextProgress =
          scrollableHeight > 0
            ? Math.min(100, Math.max(0, (window.scrollY / scrollableHeight) * 100))
            : 0;

        setProgress(nextProgress);
        setVisible(window.scrollY > 360);
      });
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const progressStyle: ProgressStyle = {
    "--scroll-progress": `${progress * 3.6}deg`,
  };

  return (
    <button
      className={`${styles.button} ${visible ? styles.visible : ""}`}
      style={progressStyle}
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="العودة إلى أعلى الصفحة"
      title="العودة إلى الأعلى"
    >
      <span className={styles.tooltip}>العودة للأعلى</span>
      <span className={styles.core}>
        <ArrowUp size={19} strokeWidth={1.8} />
      </span>
    </button>
  );
}
