import Link from "next/link";
import { MessageCircleQuestion } from "lucide-react";

import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import styles from "@/components/fatwa/FatwaRouteState/FatwaRouteState.module.css";

export default function FatwaNotFound() {
  return (
    <>
      <Header />
      <main>
        <section className={styles.hero}>
          <div className={styles.state}>
            <MessageCircleQuestion size={34} />
            <strong>المسألة غير موجودة</strong>
            <p>قد يكون الرابط غير صحيح أو لم تعد المسألة منشورة.</p>
            <Link href="/fatwas">العودة إلى الفتاوى</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
