import dissertationData from "@/data/dissertations.json";

export type ParticipationType = "مشرف" | "مناقش" | "عضو لجنة";
export type DissertationDegree = "ماجستير" | "دكتوراه";

export type Dissertation = {
  id: string;
  title: string;
  researcher: string;
  university: string;
  college: string;
  degree: DissertationDegree;
  specialization: string;
  year: number;
  participation: ParticipationType;
  abstract?: string;
  link?: string;
};

export const participationTypes = dissertationData.participationTypes as Array<
  ParticipationType | "الكل"
>;

export const dissertationDegrees = dissertationData.degrees as Array<
  DissertationDegree | "الكل"
>;

export const dissertations = dissertationData.dissertations as Dissertation[];

export const dissertationUniversities = Array.from(
  new Set(dissertations.map((item) => item.university)),
).sort();

export const dissertationSpecializations = Array.from(
  new Set(dissertations.map((item) => item.specialization)),
).sort();

export const dissertationYears = Array.from(
  new Set(dissertations.map((item) => item.year)),
).sort((a, b) => b - a);

export function getDissertation(id: string) {
  return dissertations.find((item) => item.id === id);
}

export function getRelatedDissertations(
  dissertation: Dissertation,
  limit = 3,
) {
  return dissertations
    .filter((item) => item.id !== dissertation.id)
    .sort((a, b) => {
      const aScore =
        Number(a.specialization === dissertation.specialization) * 2 +
        Number(a.university === dissertation.university);
      const bScore =
        Number(b.specialization === dissertation.specialization) * 2 +
        Number(b.university === dissertation.university);
      return bScore - aScore;
    })
    .slice(0, limit);
}
