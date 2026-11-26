import { z } from "zod";
import { API_BASE_URL } from "@/lib/api";

const text = z.string().trim().nullable().optional();
const contactSchema = z.object({
  phones: z.object({
    support_phone: text,
    management_phone: text,
    backup_phone: text,
  }),
  business_details: z.object({ address: text, email: text, map_url: text }),
  social: z.record(z.string(), text),
  telegram_channels: z
    .array(z.object({ url: z.string(), label: text }))
    .optional(),
});

type SiteContact = z.infer<typeof contactSchema>;

export const footerPlatforms = [
  "telegram",
  "youtube",
  "twitter",
  "facebook",
  "snapchat",
  "instagram",
  "tiktok",
  "linkedin",
  "threads",
  "whatsapp_channel",
] as const;

type Platform = (typeof footerPlatforms)[number];

export type FooterContact = {
  phones: string[];
  address: string | null;
  email: string | null;
  mapUrl: string | null;
  socials: { platform: Platform; url: string; label?: string }[];
};

export const emptyFooterContact: FooterContact = {
  phones: [],
  address: null,
  email: null,
  mapUrl: null,
  socials: [],
};

function webUrl(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export function presentFooterContact(contact: SiteContact): FooterContact {
  const socialLinks: FooterContact["socials"] = [];

  for (const platform of footerPlatforms) {
    const links =
      platform === "telegram" && contact.telegram_channels !== undefined
        ? contact.telegram_channels
        : [{ url: contact.social[platform], label: null }];
    const seen = new Set<string>();
    for (const link of links) {
      const url = webUrl(link.url);
      if (url && !seen.has(url)) {
        seen.add(url);
        socialLinks.push({ platform, url, label: link.label || undefined });
      }
    }
  }

  const { address, email, map_url } = contact.business_details;
  const phones = [...new Set(Object.values(contact.phones))].filter(
    (value): value is string => Boolean(value && /^\+?\d{7,15}$/.test(value)),
  );
  return {
    phones,
    address: address || null,
    email:
      email && /^[^\s@:?&#]+@[^\s@:?&#]+\.[^\s@:?&#]+$/.test(email)
        ? email
        : null,
    mapUrl: webUrl(map_url),
    socials: socialLinks,
  };
}

export const FOOTER_CONTACT_REVALIDATE_SECONDS = 30;

export async function getFooterContact(): Promise<FooterContact> {
  try {
    const response = await fetch(`${API_BASE_URL}/site-contact`, {
      headers: { Accept: "application/json" },
      next: { revalidate: FOOTER_CONTACT_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(3_000),
    });
    if (!response.ok) return emptyFooterContact;
    const parsed = contactSchema.safeParse(await response.json());
    return parsed.success
      ? presentFooterContact(parsed.data)
      : emptyFooterContact;
  } catch {
    return emptyFooterContact;
  }
}
