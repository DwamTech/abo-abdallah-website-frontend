"use client";

import { RefreshCcw } from "lucide-react";

import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import styles from "@/components/library/LibraryItemContent/LibraryItemContent.module.css";

export default function LibraryError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <>
      <Header />
      <main>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.pageState} role="alert">
              <RefreshCcw size={34} />
              <strong>تعذّر فتح المصنَّف</strong>
              <p>تحقق من الاتصال ثم حاول مرة أخرى.</p>
              <button type="button" onClick={reset}>
                إعادة المحاولة
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
