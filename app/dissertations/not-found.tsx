import Link from "next/link";
import { FileQuestion } from "lucide-react";

import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import styles from "@/components/dissertation/DissertationDetailContent/DissertationDetailContent.module.css";

export default function DissertationNotFound() {
  return (
    <>
      <Header />
      <main>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.pageState}>
              <FileQuestion size={34} />
              <strong>الرسالة العلمية غير موجودة</strong>
              <p>قد يكون الرابط غير صحيح أو لم تعد الرسالة منشورة.</p>
              <Link href="/dissertations">العودة إلى السجل الأكاديمي</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
