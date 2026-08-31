import { z } from "zod";

const indexNumber = z.coerce.number().int().positive();
const requiredText = z.string().trim().min(1);
const optionalText = z.string().nullable();

export const publicSubjectIndexEntrySchema = z.object({
  number: indexNumber,
  code: requiredText,
  subject: requiredText,
});

export type PublicSubjectIndexEntry = z.infer<
  typeof publicSubjectIndexEntrySchema
>;

export const publicSubjectIndexBookSchema = z.object({
  id: z.string().min(1),
  title: requiredText,
  attachments: optionalText,
  publisher: optionalText,
  edition: optionalText,
  publicationYear: optionalText,
  classification: optionalText,
  notes: optionalText,
});

export const publicSubjectIndexDetailSchema =
  publicSubjectIndexEntrySchema.extend({
    titleCount: z.coerce.number().int().nonnegative(),
    volumeCount: z.coerce.number().int().nonnegative(),
    coverCount: z.coerce.number().int().nonnegative(),
    books: z.array(publicSubjectIndexBookSchema),
  });

export type PublicSubjectIndexDetail = z.infer<
  typeof publicSubjectIndexDetailSchema
>;

export const publicSubjectIndexListResponseSchema = z.object({
  data: z.array(publicSubjectIndexEntrySchema),
});

export const publicSubjectIndexDetailResponseSchema = z.object({
  data: publicSubjectIndexDetailSchema,
});
