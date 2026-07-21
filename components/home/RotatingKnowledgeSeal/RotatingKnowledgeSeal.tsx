"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  BookOpenText,
  FileText,
  GraduationCap,
  LibraryBig,
  MessageCircleQuestion,
  ScrollText,
} from "lucide-react";
import siteContent from "@/data/site-content.json";
import styles from "./RotatingKnowledgeSeal.module.css";

const knowledgeIcons = { BookOpenText, MessageCircleQuestion, BookOpen, FileText, ScrollText, LibraryBig, GraduationCap } as const;
const knowledgeItems = siteContent.knowledgeItems;

export default function RotatingKnowledgeSeal() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = knowledgeItems[activeIndex];
  const Icon = knowledgeIcons[activeItem.icon as keyof typeof knowledgeIcons];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % knowledgeItems.length);
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className={styles.seal}>
      <div className={styles.content} key={activeItem.label}>
        <span className={styles.kicker}>بوابات المعرفة</span>
        <span className={styles.icon}>
          <Icon size={38} strokeWidth={1.15} aria-hidden="true" />
        </span>
        <strong className={activeItem.label.length > 10 ? styles.longTitle : ""}>
          {activeItem.label}
        </strong>
        <span className={styles.divider} aria-hidden="true">
          <i />
          <b>۞</b>
          <i />
        </span>
        <small>{activeItem.description}</small>
      </div>
    </div>
  );
}
