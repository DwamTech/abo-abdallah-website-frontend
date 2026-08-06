import {
  BookOpenCheck,
  FileCheck2,
  FileText,
  GraduationCap,
  LibraryBig,
  Newspaper,
  Sparkles,
} from "lucide-react";
type LibraryWorkIconProps = {
  type: string;
  size?: number;
  className?: string;
};

const iconByType: Record<string, typeof LibraryBig> = {
  "الكتب والمؤلفات": LibraryBig,
  "التحقيقات العلمية": FileCheck2,
  "الأبحاث المحكمة": BookOpenCheck,
  "المقالات والدراسات": Newspaper,
  "المحاضرات المكتوبة": FileText,
  "المواد التعليمية": GraduationCap,
  "الإصدارات الحديثة": Sparkles,
};

export default function LibraryWorkIcon({
  type,
  size = 42,
  className,
}: LibraryWorkIconProps) {
  const Icon = iconByType[type] ?? LibraryBig;

  return <Icon className={className} size={size} strokeWidth={1.15} />;
}
