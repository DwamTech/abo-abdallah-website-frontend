import styles from "./SectionDivider.module.css";

type SectionDividerProps = {
  variant: "paper" | "audio" | "book" | "manuscript";
};

export default function SectionDivider({ variant }: SectionDividerProps) {
  if (variant === "paper") {
    return (
      <div
        className={`${styles.divider} ${styles.paperDivider}`}
        aria-hidden="true"
      >
        <span className={styles.paperGrain} />
        <i className={styles.fragmentOne} />
        <i className={styles.fragmentTwo} />
        <i className={styles.fragmentThree} />
      </div>
    );
  }

  if (variant === "audio") {
    return (
      <div
        className={`${styles.divider} ${styles.audioDivider}`}
        aria-hidden="true"
      >
        <span className={styles.audioWave}>
          {Array.from({ length: 23 }).map((_, index) => (
            <i key={index} />
          ))}
        </span>
      
      </div>
    );
  }

  if (variant === "book") {
    return (
      <div
        className={`${styles.divider} ${styles.bookDivider}`}
        aria-hidden="true"
      >
        <span className={styles.bookLine} />
        <span className={styles.bookMark}>
          <i />
          <b />
        </span>
        <span className={styles.bookLine} />
      </div>
    );
  }

  return (
    <div
      className={`${styles.divider} ${styles.manuscriptDivider}`}
      aria-hidden="true"
    >
      <span className={styles.inkLine} />
      <span className={styles.inkSeal}>۞</span>
      <span className={styles.inkLine} />
    </div>
  );
}
