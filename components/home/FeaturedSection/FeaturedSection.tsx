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
import styles from "./FeaturedSection.module.css";

const tabs = [
  { id: "all", label: "الكل" },
  { id: "books", label: "المؤلفات" },
  { id: "research", label: "البحوث" },
  { id: "sessions", label: "المجالس" },
];

const materials = [
  {
    category: "books",
    icon: BookMarked,
    type: "كتب ومؤلفات",
    title: "فهرس المؤلفات العلمية",
    description:
      "وصول مرتب إلى كتب الشيخ وإصداراته مع بيانات النشر والنسخ المتاحة.",
    meta: "تصنيف موضوعي",
  },
  {
    category: "research",
    icon: FileStack,
    type: "بحوث ودراسات",
    title: "الأبحاث العلمية المحكمة",
    description:
      "أرشيف للبحوث والأوراق العلمية، مهيأ للباحثين والتوثيق الأكاديمي.",
    meta: "فهرسة أكاديمية",
  },
  {
    category: "sessions",
    icon: ScrollText,
    type: "مجالس علمية",
    title: "مجالس السماع والإجازات",
    description:
      "سجل للمجالس والقراءات العلمية، مع تفاصيل الكتاب والمجلس والتاريخ.",
    meta: "توثيق زمني",
  },
  {
    category: "sessions",
    icon: Headphones,
    type: "مكتبة صوتية",
    title: "الدروس والمحاضرات المسجلة",
    description:
      "مواد صوتية منظمة في سلاسل مع إمكان متابعة الاستماع من آخر موضع.",
    meta: "استماع ميسّر",
  },
];

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
            const Icon = item.icon;
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
