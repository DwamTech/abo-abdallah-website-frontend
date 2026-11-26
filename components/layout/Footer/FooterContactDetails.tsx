"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import type { FooterContact } from "@/lib/footerContact";
import { useFooterContact } from "./FooterContactProvider";
import styles from "./Footer.module.css";

type Platform = FooterContact["socials"][number]["platform"];

const brands: Record<Platform, { name: string; path: string }> = {
  telegram: {
    name: "تيليجرام",
    path: "M21.7 3.4 18.8 20c-.2 1.2-.9 1.5-1.9.9l-4.4-3.2-2.1 2.1c-.2.2-.4.4-.9.4l.3-4.5 8.2-7.4c.4-.3-.1-.5-.2-.2L7.4 14.4 3 13c-1-.3-1-1 .2-1.5L20.4 4c.8-.3 1.5.2 1.3 1.4Z",
  },
  youtube: {
    name: "يوتيوب",
    path: "M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2a31 31 0 0 0 0 9.6 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 0-9.6ZM9.7 15.2V8.8l6 3.2-6 3.2Z",
  },
  twitter: {
    name: "إكس",
    path: "M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-7.4L5.5 22H2.3l8.2-9.4L2 2h6.5l4.4 6.7L18.9 2ZM17.9 20h1.7L7.5 4H5.7l12.2 16Z",
  },
  facebook: {
    name: "فيسبوك",
    path: "M14 22v-9h3l.5-3.5H14V7.2c0-1 .3-1.7 1.7-1.7H18V2.3c-.4-.1-1.6-.3-2.9-.3-2.9 0-4.9 1.7-4.9 5v2.5H7V13h3.2v9H14Z",
  },
  snapchat: {
    name: "سناب شات",
    path: "M12 2c3.2 0 5 2.2 5 5.2v3.3c.6.3 1.4-.5 2.1-.2.4.2.6.7.2 1.1-.5.6-1.5.7-2 1.3.5 2 2.1 3.4 4.3 3.8.4 1-1 1.6-2.4 1.7l-.5 1.3c-1.4-.1-2.2 0-3.2.8-1 .8-2.1 1.7-3.5 1.7s-2.6-.9-3.5-1.7c-1-.8-1.8-.9-3.2-.8l-.5-1.3c-1.4-.1-2.8-.7-2.4-1.7 2.2-.4 3.8-1.8 4.3-3.8-.5-.6-1.5-.7-2-1.3-.4-.4-.2-.9.2-1.1.7-.3 1.5.5 2.1.2V7.2C7 4.2 8.8 2 12 2Z",
  },
  instagram: {
    name: "إنستجرام",
    path: "M7 2a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5H7Zm0 2h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Zm5 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm5.5-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z",
  },
  tiktok: {
    name: "تيك توك",
    path: "M14 2h3.2a5.7 5.7 0 0 0 4.8 4.8V10a9 9 0 0 1-4.8-1.5v7.2a6.3 6.3 0 1 1-6.3-6.3h.7v3.3h-.7a3 3 0 1 0 3 3L14 2Z",
  },
  linkedin: {
    name: "لينكدإن",
    path: "M5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3.3 9v12h3.4V9H3.3ZM9 9v12h3.4v-6.5c0-3.4 4.4-3.6 4.4 0V21h3.5v-7.7c0-4.8-5.3-5.7-8-3V9H9Z",
  },
  threads: {
    name: "ثريدز",
    path: "M12 2c5 0 8 3 9 7.5l-1.9.5C18.3 6.4 16 4 12 4 7.2 4 5 7 5 12s2.2 8 7 8c3.3 0 5.7-1.7 5.7-4.2 0-1.4-.7-2.3-1.8-2.9-.5 3.3-2.5 4.5-4.6 4.5-2.2 0-3.7-1.5-3.7-3.3 0-2.3 2-3.7 4.6-3.7.6 0 1.2.1 1.8.2-.2-1.6-1-2.2-2.2-2.2-1 0-1.8.4-2.3 1.2l-1.6-1c.8-1.4 2.2-2.2 4-2.2 2.6 0 4 1.7 4.2 4.8 2.3.9 3.6 2.5 3.6 4.6 0 3.7-3.2 6.2-7.7 6.2-5.8 0-9-3.7-9-10s3.2-10 9-10Zm2 10.6-1.7-.2c-1.6 0-2.7.7-2.7 1.7 0 .8.7 1.4 1.7 1.4 1.4 0 2.5-.9 2.7-2.9Z",
  },
  whatsapp_channel: {
    name: "واتساب",
    path: "M12 2a10 10 0 0 0-8.7 15l-1.2 5 5.1-1.3A10 10 0 1 0 12 2Zm0 2a8 8 0 1 1-4.1 14.9l-.4-.3-2.7.7.7-2.6-.3-.5A8 8 0 0 1 12 4Zm-3 3.6c-.5 0-1.5.9-1.5 2.4 0 2.4 2.9 5.4 5.2 6.4 1.2.5 2.2.8 3.2.4.7-.3 1.4-1.3 1.4-1.8 0-.3-.4-.4-1.5-.9-.9-.5-1.1-.5-1.4-.2l-.8 1c-1.5-.5-3.1-1.8-3.8-3.3l.7-.8c.3-.3.2-.5-.2-1.5-.4-1.1-.7-1.7-1.3-1.7Z",
  },
};

export default function FooterContactDetails() {
  const contact = useFooterContact();
  return (
    <>
      {contact?.address && (
        <span>
          <MapPin size={18} />
          {contact.mapUrl ? (
            <a href={contact.mapUrl} target="_blank" rel="noreferrer">
              {contact.address}
            </a>
          ) : (
            contact.address
          )}
        </span>
      )}
      <span>
        <Mail size={18} />
        {contact?.email ? (
          <a href={`mailto:${contact.email}`} dir="ltr">
            {contact.email}
          </a>
        ) : (
          "قناة التواصل الرسمية"
        )}
      </span>
      {contact?.phones.map((phone) => (
        <span key={phone}>
          <Phone size={18} />
          <a href={`tel:${phone}`} dir="ltr">
            {phone}
          </a>
        </span>
      ))}
      {!!contact?.socials.length && (
        <div
          className={styles.telegramChannels}
          aria-label={
            contact.socials.every(({ platform }) => platform === "telegram")
              ? "قنوات تيليجرام العلمية"
              : "منصات التواصل الاجتماعي"
          }
        >
          {contact.socials.map(({ platform, url, label }) => {
            const brand = brands[platform];
            return (
              <a
                href={url}
                key={`${platform}:${url}`}
                target="_blank"
                rel="noreferrer"
                aria-label={
                  label ? `فتح ${label} على ${brand.name}` : brand.name
                }
                title={label || brand.name}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d={brand.path} fill="currentColor" />
                </svg>
              </a>
            );
          })}
        </div>
      )}
    </>
  );
}
