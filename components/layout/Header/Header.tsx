"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ArrowUpLeft,
  BookOpenText,
  MapPin,
  Menu,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { toArabicDigits } from "@/lib/arabicNumbers";
import SmartSearchOverlay from "@/components/search/SmartSearchOverlay";
import styles from "./Header.module.css";
import siteContent from "@/data/site-content.json";

const navigation = siteContent.navigation;

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    const handleOpenSearch = () => {
      setMenuOpen(false);
      setSearchOpen(true);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("site:open-search", handleOpenSearch);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("site:open-search", handleOpenSearch);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchOpen]);

  return (
    <>
      <header
        className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}
      >
        <div className={styles.navShell}>
          <a
            className={styles.brand}
            href="/"
            aria-label="الانتقال إلى الصفحة الرئيسية"
          >
            <Image
              className={styles.brandLogo}
              src="/media/images/Header_logo.png"
              alt="أبو عبد الله يحيى بن عبد الله البكري الشهري"
              width={866}
              height={288}
              priority
            />
          </a>

          <nav className={styles.desktopNav} aria-label="التنقل الرئيسي">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(`${item.href}/`))
                    ? styles.activeLink
                    : undefined
                }
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className={styles.actions}>
            <button
              className={styles.searchButton}
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="فتح البحث"
            >
              <Search size={19} strokeWidth={1.7} />
            </button>

            <span className={styles.actionDivider} aria-hidden="true" />

            <a className={styles.libraryButton} href="/listening">
              <BookOpenText size={18} strokeWidth={1.5} />
              <span>مجالس السماع</span>
              <ArrowUpLeft size={15} strokeWidth={1.7} />
            </a>

            <button
              className={styles.menuButton}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label="فتح القائمة"
            >
              <Menu size={23} strokeWidth={1.7} />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`${styles.drawerLayer} ${menuOpen ? styles.drawerLayerOpen : ""}`}
        aria-hidden={!menuOpen}
        onMouseDown={(event) => {
          if (event.currentTarget === event.target) setMenuOpen(false);
        }}
      >
        <aside
          id="mobile-navigation"
          className={styles.drawer}
          aria-label="التنقل على الجوال"
        >
          <div className={styles.drawerHead}>
            <Image
              className={styles.drawerLogo}
              src="/media/images/Header_logo.png"
              alt=""
              width={866}
              height={288}
            />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="إغلاق القائمة"
            >
              <X size={21} />
            </button>
          </div>

          <div className={styles.drawerIntro}>
            <span>
              <Sparkles size={14} />
              الموقع العلمي الرسمي
            </span>
            <p>الوصول إلى أقسام الموقع ومحتواه العلمي.</p>
          </div>

          <nav className={styles.mobileNav}>
            {navigation.map((item, index) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
              >
                <span className={styles.navNumber}>
                  {toArabicDigits(String(index + 1).padStart(2, "0"))}
                </span>
                <strong>{item.label}</strong>
                <ArrowUpLeft size={17} />
              </a>
            ))}
          </nav>

          <div className={styles.drawerFooter}>
            <MapPin size={16} />
            <span>جامعة الملك خالد · أبها</span>
          </div>
        </aside>
      </div>

      {searchOpen && (
        <SmartSearchOverlay onClose={() => setSearchOpen(false)} />
      )}
    </>
  );
}
