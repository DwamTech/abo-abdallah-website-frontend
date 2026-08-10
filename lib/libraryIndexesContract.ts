import { z } from "zod";

const apiNumber = z.coerce.number().int().nonnegative();
const nullableText = z.string().nullable().optional();

const publicRecordBaseSchema = z
  .object({
    id: z.union([z.number(), z.string()]),
    name: z.string().trim().min(1),
    visit_date: z.string().min(1),
  });

export const goldenVisitRecordSchema = publicRecordBaseSchema.extend({
  image_url: nullableText,
});

export const guestVisitRecordSchema = publicRecordBaseSchema.extend({
  title: z.string().min(1),
});

export type GoldenVisitRecord = z.infer<typeof goldenVisitRecordSchema>;
export type GuestVisitRecord = z.infer<typeof guestVisitRecordSchema>;

const paginationLinksSchema = z
  .object({
    first: nullableText,
    last: nullableText,
    prev: nullableText,
    next: nullableText,
  });

const paginationMetaSchema = z
  .object({
    current_page: apiNumber,
    last_page: apiNumber,
    per_page: apiNumber,
    total: apiNumber,
    from: apiNumber.nullable().optional(),
    to: apiNumber.nullable().optional(),
  });

function collectionSchema<T extends z.ZodType>(recordSchema: T) {
  return z
    .object({
      data: z.array(recordSchema),
      links: paginationLinksSchema,
      meta: paginationMetaSchema,
    });
}

export const goldenVisitCollectionSchema = collectionSchema(
  goldenVisitRecordSchema,
);
export const guestVisitCollectionSchema = collectionSchema(
  guestVisitRecordSchema,
);

export type GoldenVisitCollection = z.infer<
  typeof goldenVisitCollectionSchema
>;
export type GuestVisitCollection = z.infer<typeof guestVisitCollectionSchema>;
export type LibraryIndexCollection =
  | GoldenVisitCollection
  | GuestVisitCollection;

export const libraryIndexSummarySchema = z.object({
  data: z.object({
    golden_visits: apiNumber,
    guests: apiNumber,
    total: apiNumber,
  }),
});

export type LibraryIndexSummary = z.infer<
  typeof libraryIndexSummarySchema
>["data"];

export const guestVisitSubmissionSchema = z.strictObject({
  name: z.string().trim().min(2).max(180),
  title: z.string().trim().min(2).max(180),
  visit_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type GuestVisitSubmission = z.input<
  typeof guestVisitSubmissionSchema
>;

export const libraryIndexSubmissionResponseSchema = z
  .object({
    message: z.string().min(1),
    data: z.object({
      id: z.union([z.number(), z.string()]),
      status: z.literal("pending"),
    }),
  });
