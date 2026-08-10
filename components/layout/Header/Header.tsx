'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  AudioLines,
  ArrowUpLeft,
  BookMarked,
  BookOpen,
  ChevronDown,
  GraduationCap,
  LibraryBig,
  MapPin,
  Menu,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { toArabicDigits } from '@/lib/arabicNumbers';
import SmartSearchOverlay from '@/components/search/SmartSearchOverlay';
import styles from './Header.module.css';
import siteContent from '@/data/site-content.json';

const navigation = siteContent.navigation;

const libraryNavigation = [
  {
    label: 'مؤلفات الشيخ',
    description: 'الكتب والتحقيقات والبحوث المنشورة',
    href: '/library',
    icon: BookMarked,
  },
  {
    label: 'الإشراف العلمي',
    description: 'الرسائل والمناقشات والإنتاج الأكاديمي',
    href: '/dissertations',
    icon: GraduationCap,
  },
  {
    label: 'فهارس المكتبة البكرية',
    description: 'السجل والضيوف والفهارس المتخصصة',
    href: '/library-indexes',
    icon: LibraryBig,
  },
];

const visibleNavigation = navigation.filter((item) => item.href !== '/dissertations');

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));
}

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const previousSearchFocus = useRef<HTMLElement | null>(null);
  const searchWasOpen = useRef(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    const handleOpenSearch = () => {
      previousSearchFocus.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setMenuOpen(false);
      setSearchOpen(true);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('site:open-search', handleOpenSearch);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('site:open-search', handleOpenSearch);
    };
  }, []);

  useEffect(() => {
    if (searchWasOpen.current && !searchOpen) {
      window.requestAnimationFrame(() => previousSearchFocus.current?.focus());
    }
    searchWasOpen.current = searchOpen;
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, searchOpen]);

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.navShell}>
          <a className={styles.brand} href="/" aria-label="الانتقال إلى الصفحة الرئيسية">
            <Image
              className={styles.brandLogo}
              src="/media/images/real-logo-transparent.png"
              alt="أبو عبد الله يحيى بن عبد الله البكري الشهري"
              width={1600}
              height={561}
              priority
            />
          </a>

          <nav className={styles.desktopNav} aria-label="التنقل الرئيسي">
            {visibleNavigation.map((item) =>
              item.href === '/library' ? (
                <div
                  className={`${styles.navDropdown} ${
                    libraryNavigation.some((entry) => isActivePath(pathname, entry.href))
                      ? styles.navDropdownActive
                      : ''
                  }`}
                  key={item.href}
                >
                  <button className={styles.navDropdownTrigger} type="button" aria-haspopup="true">
                    {item.label}
                    <ChevronDown size={14} strokeWidth={1.8} />
                  </button>
                  <div className={styles.navDropdownPanel}>
                    <div className={styles.dropdownHeading}>
                      <span>المكتبة البكرية</span>
                      <small>بوابة المعرفة والفهارس العلمية</small>
                    </div>
                    {libraryNavigation.map((entry) => {
                      const Icon = entry.icon;
                      return (
                        <a
                          className={
                            isActivePath(pathname, entry.href)
                              ? styles.dropdownActiveLink
                              : undefined
                          }
                          href={entry.href}
                          key={entry.href}
                        >
                          <i>
                            <Icon size={18} strokeWidth={1.55} />
                          </i>
                          <span>
                            <strong>{entry.label}</strong>
                            <small>{entry.description}</small>
                          </span>
                          <ArrowUpLeft size={15} />
                        </a>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  className={isActivePath(pathname, item.href) ? styles.activeLink : undefined}
                >
                  {item.label}
                </a>
              ),
            )}
          </nav>

          <div className={styles.actions}>
            <button
              className={styles.searchButton}
              type="button"
              onClick={() => {
                previousSearchFocus.current =
                  document.activeElement instanceof HTMLElement ? document.activeElement : null;
                setSearchOpen(true);
              }}
              aria-label="فتح البحث"
            >
              <Search size={19} strokeWidth={1.7} />
            </button>

            <span className={styles.actionDivider} aria-hidden="true" />

            <a className={styles.libraryButton} href="/listening">
              <span className={styles.audioQuranIcon} aria-hidden="true">
                <BookOpen size={20} strokeWidth={1.45} />
                <AudioLines size={10} strokeWidth={2} />
              </span>
              <span>المكتبة الصوتية</span>
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
        className={`${styles.drawerLayer} ${menuOpen ? styles.drawerLayerOpen : ''}`}
        aria-hidden={!menuOpen}
        onMouseDown={(event) => {
          if (event.currentTarget === event.target) setMenuOpen(false);
        }}
      >
        <aside id="mobile-navigation" className={styles.drawer} aria-label="التنقل على الجوال">
          <div className={styles.drawerHead}>
            <Image
              className={styles.drawerLogo}
              src="/media/images/real-logo-transparent.png"
              alt=""
              width={1600}
              height={561}
            />
            <button type="button" onClick={() => setMenuOpen(false)} aria-label="إغلاق القائمة">
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
            {visibleNavigation.map((item, index) =>
              item.href === '/library' ? (
                <div className={styles.mobileLibraryGroup} key={item.href}>
                  <div className={styles.mobileLibraryTitle}>
                    <span className={styles.navNumber}>
                      {toArabicDigits(String(index + 1).padStart(2, '0'))}
                    </span>
                    <strong>{item.label}</strong>
                    <ChevronDown size={17} />
                  </div>
                  <div className={styles.mobileLibraryLinks}>
                    {libraryNavigation.map((entry) => {
                      const Icon = entry.icon;
                      return (
                        <a href={entry.href} key={entry.href} onClick={() => setMenuOpen(false)}>
                          <Icon size={16} />
                          <span>{entry.label}</span>
                          <ArrowUpLeft size={15} />
                        </a>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                  <span className={styles.navNumber}>
                    {toArabicDigits(String(index + 1).padStart(2, '0'))}
                  </span>
                  <strong>{item.label}</strong>
                  <ArrowUpLeft size={17} />
                </a>
              ),
            )}
          </nav>

          <div className={styles.drawerFooter}>
            <MapPin size={16} />
            <span>جامعة الملك خالد · أبها</span>
          </div>
        </aside>
      </div>

      {searchOpen && <SmartSearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}
