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
  type LucideIcon,
} from "lucide-react";
import styles from "./RotatingKnowledgeSeal.module.css";

type KnowledgeItem = {
  label: string;
  description: string;
  icon: LucideIcon;
};

const knowledgeItems: KnowledgeItem[] = [
  {
    label: "الحديث",
    description: "رواية · دراية · تحقيق",
    icon: BookOpenText,
  },
  {
    label: "الفتاوى",
    description: "تأصيل · بيان · إجابة",
    icon: MessageCircleQuestion,
  },
  {
    label: "الكتب",
    description: "تصنيف · تحقيق · نشر",
    icon: BookOpen,
  },
  {
    label: "الأبحاث",
    description: "دراسة · توثيق · تحليل",
    icon: FileText,
  },
  {
    label: "مجالس السماع",
    description: "قراءة · إجازة · توثيق",
    icon: ScrollText,
  },
  {
    label: "الإنتاج الأكاديمي",
    description: "علم · بحث · إثراء",
    icon: LibraryBig,
  },
  {
    label: "الإشراف العلمي",
    description: "توجيه · متابعة · تأهيل",
    icon: GraduationCap,
  },
];

export default function RotatingKnowledgeSeal() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = knowledgeItems[activeIndex];
  const Icon = activeItem.icon;

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
