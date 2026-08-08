import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "@fontsource-variable/noto-kufi-arabic";
import "@fontsource-variable/noto-naskh-arabic";
import NewsTicker from "@/components/layout/NewsTicker/NewsTicker";
import ScrollReveal from "@/components/layout/ScrollReveal/ScrollReveal";
import ScrollToTop from "@/components/layout/ScrollToTop/ScrollToTop";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "يحيى بن عبد الله البكري الشهري | الصفحة الرئيسية",
    template: "يحيى بن عبد الله البكري الشهري | %s",
  },
  icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
  description:
    "الموقع العلمي الرسمي لفضيلة الأستاذ الدكتور أبو عبد الله يحيى بن عبد الله البكري الشهري، أستاذ الحديث وعلومه بجامعة الملك خالد.",
  keywords: [
    "يحيى بن عبد الله البكري الشهري",
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
      <body>
        <Suspense fallback={null}>
          <NewsTicker />
        </Suspense>
        {children}
        <ScrollReveal />
        <ScrollToTop />
      </body>
    </html>
  );
}
