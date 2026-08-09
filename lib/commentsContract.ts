import { z } from "zod";

export const COMMENTS_MIN_LENGTH = 3;
export const COMMENTS_MAX_LENGTH = 1200;
export const COMMENTS_PAGE_SIZE = 8;

/** Matches Laravel's Unicode-character length checks for surrogate pairs. */
export function unicodeCharacterCount(value: string) {
  return Array.from(value).length;
}

function boundedUnicodeText(min: number, max: number) {
  return z
    .string()
    .trim()
    .refine((value) => unicodeCharacterCount(value) >= min, {
      error: `Must contain at least ${min} Unicode characters`,
    })
    .refine((value) => unicodeCharacterCount(value) <= max, {
      error: `Must contain at most ${max} Unicode characters`,
    });
}

/**
 * Public aliases are deliberately decoupled from Laravel model names.
 * A shared deployment can change the backend morph-map without changing any
 * public URL or detail-page integration in this application.
 */
export const publicCommentTargetTypeSchema = z.enum([
  "site_article",
  "scientific_library_item",
  "dissertation",
  "scientific_fatwa",
  "scientific_video",
  "listening_series",
  "listening_session",
]);

export type PublicCommentTargetType = z.infer<
  typeof publicCommentTargetTypeSchema
>;

const targetIdSchema = z.union([z.string(), z.number()]).transform(String).pipe(
  z.string().trim().regex(/^\d+$/).max(20),
);

export const publicCommentTargetSchema = z.strictObject({
  type: publicCommentTargetTypeSchema,
  targetId: targetIdSchema,
});

export type PublicCommentTarget = z.infer<typeof publicCommentTargetSchema>;

const apiNumber = z.coerce.number().int().nonnegative();
const apiPositiveNumber = z.coerce.number().int().positive();

export const publicCommentSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    author_name: z.literal("زائر"),
    body: boundedUnicodeText(1, COMMENTS_MAX_LENGTH),
    created_at: z.string().min(1),
  })
  .strip();

export type PublicComment = z.infer<typeof publicCommentSchema>;

export const publicCommentsCollectionSchema = z
  .object({
    data: z.array(publicCommentSchema),
    links: z
      .object({
        first: z.string().nullable(),
        last: z.string().nullable(),
        prev: z.string().nullable(),
        next: z.string().nullable(),
      })
      .strip()
      .optional(),
    meta: z
      .object({
        current_page: apiPositiveNumber,
        last_page: apiPositiveNumber,
        per_page: apiPositiveNumber,
        total: apiNumber,
      })
      .strip(),
  })
  .strip();

export type PublicCommentsCollection = z.infer<
  typeof publicCommentsCollectionSchema
>;

export const publicCommentSubmissionSchema = z.strictObject({
  body: boundedUnicodeText(COMMENTS_MIN_LENGTH, COMMENTS_MAX_LENGTH),
  // A real visitor never fills this field. It is intentionally accepted by
  // the BFF so the backend can silently reject unsophisticated form bots.
  website: z.string().max(200).optional().default(""),
});

export type PublicCommentSubmission = z.infer<
  typeof publicCommentSubmissionSchema
>;

export const publicCommentSubmissionResponseSchema = z
  .object({
    success: z.literal(true),
    message: z.string().trim().min(1),
    data: z.object({
      status: z.literal("pending"),
      created_at: z.string().min(1),
    }),
  })
  .strip();

export type PublicCommentSubmissionResponse = z.infer<
  typeof publicCommentSubmissionResponseSchema
>;

export function publicCommentTargetSegments(target: PublicCommentTarget) {
  return [target.type, target.targetId];
}

export function parsePublicCommentRouteTarget(
  targetType: string,
  targetId: string,
): PublicCommentTarget | null {
  const parsed = publicCommentTargetSchema.safeParse({ type: targetType, targetId });
  return parsed.success ? parsed.data : null;
}
