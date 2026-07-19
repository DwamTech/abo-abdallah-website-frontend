import type { Metadata, Viewport } from "next";
import "@fontsource-variable/noto-kufi-arabic";
import "@fontsource-variable/noto-naskh-arabic";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "الأستاذ الدكتور أبو عبد الله يحيى البكري الشهري",
    template: "%s | الموقع الرسمي",
  },
  description:
    "الموقع العلمي الرسمي لفضيلة الأستاذ الدكتور أبو عبد الله يحيى بن عبد الله البكري ثم الشهري، أستاذ الحديث وعلومه بجامعة الملك خالد.",
  keywords: [
    "أبو عبد الله يحيى البكري الشهري",
    "الحديث وعلومه",
    "السنة النبوية",
    "جامعة الملك خالد",
  ],
};

export const viewport: Viewport = {
  themeColor: "#35241c",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
