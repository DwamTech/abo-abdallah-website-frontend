import fatwaData from "@/data/fatwas.json";

export type Fatwa = {
  slug: string;
  title: string;
  category: string;
  question: string;
  answer: string;
  date: string;
  keywords: string[];
  sources: string[];
};

export const fatwaCategories = fatwaData.categories;
export const fatwas = fatwaData.fatwas as Fatwa[];
export const questionSubmissionStages = fatwaData.submissionStages;

export function getFatwa(slug: string) {
  return fatwas.find((fatwa) => fatwa.slug === slug);
}

export function getRelatedFatwas(fatwa: Fatwa, limit = 3) {
  return fatwas
    .filter((item) => item.slug !== fatwa.slug)
    .sort((a, b) => Number(b.category === fatwa.category) - Number(a.category === fatwa.category))
    .slice(0, limit);
}
