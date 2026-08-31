import { FolderSearch2 } from "lucide-react";
import styles from "./SubjectIndexDetailsPage.module.css";

export default function SubjectIndexDetailsUnavailable() {
  return (
    <section className={styles.catalogSection}>
      <div className={styles.container}>
        <div className={styles.emptyState} role="alert">
          <span><FolderSearch2 size={28} /></span>
          <strong>تعذّر تحميل بيانات الفهرس</strong>
          <p>يرجى المحاولة مرة أخرى بعد قليل.</p>
        </div>
      </div>
    </section>
  );
}
