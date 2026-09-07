import { z } from "zod";

const SITE_URL_BASE = "https://site-statistics.invalid";

function isSafeSiteStatisticsHref(value: string): boolean {
  if (!value.startsWith("/") || value.startsWith("//")) return false;
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return false;

  try {
    return new URL(value, SITE_URL_BASE).origin === SITE_URL_BASE;
  } catch {
    return false;
  }
}

export const siteStatisticsResponseSchema = z
  .object({
    data: z.array(
      z.object({
        key: z.string().trim().min(1).max(80),
        label: z.string().trim().min(1).max(255),
        count: z.coerce.number().int().nonnegative(),
        href: z
          .string()
          .trim()
          .max(2048)
          .refine(isSafeSiteStatisticsHref, "Statistics href must be a safe relative URL."),
      }),
    ).max(20),
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
        message: "Statistics meta count must match the returned items.",
        path: ["meta", "count"],
      });
    }

    const keys = new Set<string>();
    response.data.forEach((item, index) => {
      if (keys.has(item.key)) {
        context.addIssue({
          code: "custom",
          message: "Statistics keys must be unique.",
          path: ["data", index, "key"],
        });
      }
      keys.add(item.key);
    });
  });

export type SiteStatistic = z.infer<typeof siteStatisticsResponseSchema>["data"][number];
