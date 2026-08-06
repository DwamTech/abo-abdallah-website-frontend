import Link from "next/link";
import { ArrowLeft, Headphones } from "lucide-react";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import styles from "@/components/listening/ListeningIndexContent/ListeningIndexContent.module.css";

export default function ListeningNotFound() {
  return (
    <>
      <Header />
      <main>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <span className={styles.eyebrow}>
              <Headphones size={15} />
              مجالس السماع
            </span>
            <h1>المادة المطلوبة غير موجودة</h1>
            <p>قد تكون السلسلة أو الجلسة غير منشورة، أو تغير رابطها.</p>
            <Link className={styles.routeAction} href="/listening">
              عرض جميع السلاسل
              <ArrowLeft size={16} />
            </Link>
          </div>
        </section>
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
