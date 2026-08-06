import {
  BookOpenCheck,
  BookMarked,
  GraduationCap,
  LibraryBig,
  ScrollText,
} from "lucide-react";
import { getListeningVisual } from "@/lib/listeningVisuals";

type SeriesIconProps = {
  visualVariant?: string | null;
  size?: number;
  className?: string;
};

const iconByVariant = {
  "book-check": BookOpenCheck,
  "book-marked": BookMarked,
  library: LibraryBig,
  scroll: ScrollText,
  graduation: GraduationCap,
};

export default function SeriesIcon({
  visualVariant,
  size = 48,
  className,
}: SeriesIconProps) {
  const Icon = iconByVariant[getListeningVisual(visualVariant).icon];

  return <Icon className={className} size={size} strokeWidth={1.15} />;
}
