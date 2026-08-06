import Link from "next/link";
import { BookX } from "lucide-react";

import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import styles from "@/components/library/LibraryItemContent/LibraryItemContent.module.css";

export default function LibraryNotFound() {
  return (
    <>
      <Header />
      <main>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.pageState}>
              <BookX size={34} />
              <strong>المصنَّف غير موجود</strong>
              <p>قد يكون الرابط غير صحيح أو لم تعد المادة منشورة.</p>
              <Link className={styles.pageStateLink} href="/library">
                العودة إلى المكتبة
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
