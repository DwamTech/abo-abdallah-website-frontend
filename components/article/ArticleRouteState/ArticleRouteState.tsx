import type { ReactNode } from "react";

import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import sharedStyles from "@/components/content/ContentIndex/ContentIndex.module.css";
import styles from "./ArticleRouteState.module.css";

export default function ArticleRouteState({
  title,
  description,
  stateTitle,
  stateDescription,
  icon,
  action,
  alert = false,
  busy = false,
}: {
  title: string;
  description: string;
  stateTitle: string;
  stateDescription?: string;
  icon: ReactNode;
  action?: ReactNode;
  alert?: boolean;
  busy?: boolean;
}) {
  return (
    <>
      <Header />
      <main>
        <section className={sharedStyles.hero} aria-busy={busy || undefined}>
          <div className={sharedStyles.heroInner}>
            <div className={sharedStyles.heroCopy}>
              <span>مكتبة الباحث</span>
              <h1>{title}</h1>
              <p>{description}</p>
            </div>
          </div>
        </section>
        <section className={sharedStyles.content}>
          <div className={sharedStyles.container}>
            <div className={styles.state} role={alert ? "alert" : "status"}>
              {icon}
              <strong>{stateTitle}</strong>
              {stateDescription && <p>{stateDescription}</p>}
              {action}
            </div>
          </div>
        </section>
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
