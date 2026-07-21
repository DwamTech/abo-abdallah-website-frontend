"use client";

import { useState } from "react";
import {
  ArrowLeft,
  BookMarked,
  CalendarDays,
  FileStack,
  Headphones,
  ScrollText,
} from "lucide-react";
import siteContent from "@/data/site-content.json";
import styles from "./FeaturedSection.module.css";

const tabs = siteContent.featuredTabs;

const materialIcons = { BookMarked, FileStack, ScrollText, Headphones } as const;
const materials = siteContent.featuredMaterials;

export default function FeaturedSection() {
  const [activeTab, setActiveTab] = useState("all");
  const visibleMaterials =
    activeTab === "all"
      ? materials
      : materials.filter((item) => item.category === activeTab);

  return (
    <section id="featured" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div>
            <span className={styles.kicker}>بوابة المحتوى</span>
            <h2>وصول أسرع إلى المادة العلمية</h2>
          </div>
          <div className={styles.tabs} role="tablist" aria-label="تصفية المحتوى">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={activeTab === tab.id ? styles.activeTab : ""}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.materials} aria-live="polite">
          {visibleMaterials.map((item) => {
            const Icon = materialIcons[item.icon as keyof typeof materialIcons];
            return (
              <article key={item.title} className={styles.material}>
                <div className={styles.materialTop}>
                  <span className={styles.materialIcon}>
                    <Icon size={23} strokeWidth={1.4} />
                  </span>
                  <span className={styles.type}>{item.type}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className={styles.materialFooter}>
                  <span>
                    <CalendarDays size={14} />
                    {item.meta}
                  </span>
                  <a href="#library" aria-label={`الانتقال إلى ${item.title}`}>
                    <ArrowLeft size={18} />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
