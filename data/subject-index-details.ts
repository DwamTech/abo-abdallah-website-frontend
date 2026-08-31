import { subjectIndexEntries, type SubjectIndexEntry } from "./subject-index";

export type SubjectIndexBook = {
  id: string;
  title: string;
  attachments?: string;
  publisher?: string;
  edition?: string;
  publicationYear?: string;
  classification?: string;
  notes?: string;
};

export type SubjectIndexDetails = SubjectIndexEntry & {
  titleCount: number;
  volumeCount: number;
  coverCount: number;
  books: SubjectIndexBook[];
};

const detailOverrides: Partial<Record<number, Partial<SubjectIndexDetails>>> = {
  49: {
    titleCount: 85,
    volumeCount: 94,
    coverCount: 5,
  },
};

export const subjectIndexDetails: SubjectIndexDetails[] = subjectIndexEntries.map(
  (entry) => ({
    ...entry,
    titleCount: 0,
    volumeCount: 0,
    coverCount: 0,
    books: [],
    ...detailOverrides[entry.number],
  }),
);

export function getSubjectIndexDetails(number: number) {
  return subjectIndexDetails.find((entry) => entry.number === number);
}
