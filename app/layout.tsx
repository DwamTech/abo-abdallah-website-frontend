import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "@fontsource-variable/noto-kufi-arabic";
import "@fontsource-variable/noto-naskh-arabic";
import SiteStatisticsTicker from "@/components/layout/SiteStatisticsTicker/SiteStatisticsTicker";
import ScrollReveal from "@/components/layout/ScrollReveal/ScrollReveal";
import ScrollToTop from "@/components/layout/ScrollToTop/ScrollToTop";
import { FooterContactProvider } from "@/components/layout/Footer/FooterContactProvider";
import { getFooterContact } from "@/lib/footerContact";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const contact = await getFooterContact();
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Suspense fallback={null}>
          <SiteStatisticsTicker />
        </Suspense>
        <FooterContactProvider contact={contact}>{children}</FooterContactProvider>
        <ScrollReveal />
        <ScrollToTop />
      </body>
    </html>
  );
}
