import { z } from "zod";

export const scientificFatwaCategorySchema = z
  .string()
  .trim()
  .min(1)
  .max(180);

const scientificFatwaCategoryIdentifierSchema = z
  .union([
    z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
    z.string().trim().regex(/^[1-9]\d*$/).max(20),
  ])
  .transform(String);

export const scientificFatwaCategoryOptionSchema = z
  .object({
    id: scientificFatwaCategoryIdentifierSchema,
    name: scientificFatwaCategorySchema,
    slug: z.string().trim().min(1).max(180),
  })
  .passthrough();

export const scientificFatwaOptionsResponseSchema = z.object({
  data: z.object({
    categories: z
      .array(scientificFatwaCategorySchema)
      .max(250)
      .transform((categories) => [...new Set(categories)]),
    category_options: z
      .array(scientificFatwaCategoryOptionSchema)
      .max(250)
      .default([])
      .transform((categories) => [
        ...new Map(categories.map((category) => [category.id, category])).values(),
      ]),
  }),
});

export type ScientificFatwaOptions = z.infer<
  typeof scientificFatwaOptionsResponseSchema
>["data"];

export type ScientificFatwaCategoryOption = z.infer<
  typeof scientificFatwaCategoryOptionSchema
>;
