"use client";

import { ArrowUpLeft, Search } from "lucide-react";
import styles from "./HeroSearchTrigger.module.css";

export default function HeroSearchTrigger() {
  const openSearch = () => {
    window.dispatchEvent(new Event("site:open-search"));
  };

  return (
    <button
      className={styles.trigger}
      type="button"
      onClick={openSearch}
      aria-label="فتح نافذة البحث في الموقع"
    >
      <span className={styles.searchIcon}>
        <Search size={23} strokeWidth={1.55} aria-hidden="true" />
      </span>

      <span className={styles.copy}>
        <strong>ابحث في الكتب، البحوث، الدروس ومجالس السماع...</strong>
      </span>

      <span className={styles.action}>
        <ArrowUpLeft size={17} strokeWidth={1.7} aria-hidden="true" />
      </span>
    </button>
  );
}
