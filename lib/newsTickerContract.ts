import { z } from "zod";

const TICKER_URL_BASE = "https://news-ticker.invalid";

/**
 * The ticker accepts root-relative public-site links only. Keeping this rule in
 * the shared response contract means a backend cannot turn the ticker into an
 * open redirect or inject a javascript/protocol-relative URL.
 */
export function isSafeNewsTickerHref(value: string): boolean {
  if (!value.startsWith("/") || value.startsWith("//")) return false;
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return false;

  try {
    return new URL(value, TICKER_URL_BASE).origin === TICKER_URL_BASE;
  } catch {
    return false;
  }
}

const identifierSchema = z
  .union([z.string().trim().min(1).max(160), z.number().int()])
  .transform(String);

const boundedText = (maximum: number) =>
  z.string().trim().min(1).max(maximum);

export const newsTickerItemSchema = z.object({
  key: boundedText(160),
  source: boundedText(80),
  resource_id: identifierSchema,
  section: z.object({
    key: boundedText(80),
    label: boundedText(255),
  }),
  title: boundedText(300),
  href: z
    .string()
    .trim()
    .max(2_048)
    .refine(isSafeNewsTickerHref, "Ticker href must be a safe relative URL."),
  content_category: z.string().trim().max(255).nullable().optional(),
  published_at: z.string().datetime({ offset: true }),
});

export type NewsTickerItem = z.infer<typeof newsTickerItemSchema>;

export const newsTickerResponseSchema = z
  .object({
    data: z.array(newsTickerItemSchema).max(50),
    meta: z.object({
      contract_version: z.literal(1),
      count: z.coerce.number().int().nonnegative(),
      generated_at: z.string().datetime({ offset: true }),
    }),
  })
  .superRefine((response, context) => {
    if (response.meta.count !== response.data.length) {
      context.addIssue({
        code: "custom",
        message: "Ticker meta count must match the returned item count.",
        path: ["meta", "count"],
      });
    }

    const seen = new Set<string>();

    response.data.forEach((item, index) => {
      if (seen.has(item.key)) {
        context.addIssue({
          code: "custom",
          message: "Ticker item keys must be unique.",
          path: ["data", index, "key"],
        });
      }
      seen.add(item.key);
    });
  });

export type NewsTickerResponse = z.infer<typeof newsTickerResponseSchema>;
