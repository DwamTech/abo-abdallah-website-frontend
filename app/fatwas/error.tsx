"use client";

import { RefreshCcw } from "lucide-react";

import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import styles from "@/components/fatwa/FatwaRouteState/FatwaRouteState.module.css";

export default function FatwasError({
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
          <div className={styles.state} role="alert">
            <RefreshCcw size={34} />
            <strong>تعذّر فتح المسألة العلمية</strong>
            <p>تحقق من الاتصال ثم حاول مرة أخرى.</p>
            <button type="button" onClick={reset}>
              إعادة المحاولة
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
