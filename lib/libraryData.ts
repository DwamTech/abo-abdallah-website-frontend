import libraryData from "@/data/library.json";

export type LibraryContentType =
  | "الكتب والمؤلفات"
  | "التحقيقات العلمية"
  | "الأبحاث المحكمة"
  | "المقالات والدراسات"
  | "المحاضرات المكتوبة"
  | "المواد التعليمية"
  | "الإصدارات الحديثة";

export type HadithField =
  | "مصطلح الحديث"
  | "علم الرجال"
  | "الجرح والتعديل"
  | "علل الحديث"
  | "التخريج ودراسة الأسانيد"
  | "مختلف الحديث"
  | "شروح الحديث"
  | "مناهج المحدثين"
  | "الدراسات الحديثية المعاصرة";

export type LibraryWork = {
  slug: string;
  title: string;
  shortTitle: string;
  contentType: LibraryContentType;
  field: HadithField;
  description: string;
  publication: string;
  pages: number;
  edition: string;
  keywords: string[];
  contents: string[];
  accent: string;
  pdfUrl?: string;
  downloadAllowed: boolean;
  isPlaceholder?: boolean;
};

export const libraryContentTypes = libraryData.contentTypes as Array<
  LibraryContentType | "الكل"
>;

export const hadithFields = libraryData.hadithFields as Array<
  HadithField | "الكل"
>;

export const libraryWorks = libraryData.works as LibraryWork[];

export function getLibraryWork(slug: string) {
  return libraryWorks.find((work) => work.slug === slug);
}

export function getRelatedWorks(work: LibraryWork, limit = 3) {
  return libraryWorks
    .filter((item) => item.slug !== work.slug)
    .sort((a, b) => {
      const aScore =
        Number(a.field === work.field) * 2 +
        Number(a.contentType === work.contentType);
      const bScore =
        Number(b.field === work.field) * 2 +
        Number(b.contentType === work.contentType);
      return bScore - aScore;
    })
    .slice(0, limit);
}
