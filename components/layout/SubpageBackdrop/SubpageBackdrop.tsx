import styles from "./SubpageBackdrop.module.css";

export default function SubpageBackdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <i className={styles.orbit} />
      <i className={styles.diamond} />
      <i className={styles.dots} />
      <i className={styles.arches} />
      <i className={styles.thread} />
    </div>
  );
}
