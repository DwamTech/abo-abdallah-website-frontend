import {
  BookOpenCheck,
  BookMarked,
  GraduationCap,
  LibraryBig,
  ScrollText,
} from "lucide-react";

type SeriesIconProps = {
  slug: string;
  size?: number;
  className?: string;
};

const iconBySeries = {
  "sahih-al-bukhari": BookOpenCheck,
  "sahih-muslim": BookMarked,
  "sunan-and-masanid": LibraryBig,
  "hadith-terminology": ScrollText,
  "hadith-lessons": GraduationCap,
};

export default function SeriesIcon({
  slug,
  size = 48,
  className,
}: SeriesIconProps) {
  const Icon =
    iconBySeries[slug as keyof typeof iconBySeries] ?? BookOpenCheck;

  return <Icon className={className} size={size} strokeWidth={1.15} />;
}
