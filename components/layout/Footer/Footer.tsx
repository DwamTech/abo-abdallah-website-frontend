import {
  BookOpenCheck,
  Headphones,
  Mail,
  MapPin,
  MessageCircleQuestion,
  University,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Footer.module.css";
import premium from "./FooterPremium.module.css";
import logoStyles from "./DwamCredit.module.css";
import mobileStyles from "./FooterMobile.module.css";
import siteContent from "@/data/site-content.json";

const quickLinks = siteContent.footerQuickLinks;

const knowledgeLinks = siteContent.footerKnowledgeLinks;
const legalLinks = siteContent.footerLegalLinks;

const telegramChannels = [
  { label: "القناة العلمية الأولى", href: "https://t.me/Suohv5qO9j3oQjNS" },
  { label: "القناة العلمية الثانية", href: "https://t.me/+HyNBeIUGsHE0ZGM0" },
  { label: "قناة المكتبة البكرية", href: "https://t.me/ALbakrih" },
];

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21.7 3.4 18.8 20c-.2 1.2-.9 1.5-1.9.9l-4.4-3.3-2.1 2.1c-.2.2-.4.4-.9.4l.3-4.5 8.2-7.4c.4-.3-.1-.5-.5-.2L7.4 14.4 3 13c-1-.3-1-1 .2-1.5L20.4 4c.8-.3 1.5.2 1.3 1.4Z" fill="currentColor" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer id="footer" className={`${styles.footer} ${premium.footer} ${logoStyles.cleanFooter}`}>
      <div className={styles.container}>
        <div className={`${styles.main} ${premium.main} ${logoStyles.cleanMain} ${mobileStyles.main}`}>
          <div className={`${styles.identity} ${mobileStyles.centerBlock}`}>
            <a
              className={styles.brand}
              href="/"
              aria-label="العودة إلى الصفحة الرئيسية"
            >
              <Image
                className={styles.footerLogo}
                src="/media/images/real-hero-logo-transparent2.png"
                alt="أبو عبد الله يحيى بن عبد الله البكري الشهري"
                width={1600}
                height={561}
              />
            </a>
            <p>
              موقع علمي يجمع الإنتاج الأكاديمي، ويخدم الباحثين وطلاب
              العلم في الحديث النبوي وعلومه.
            </p>
            <div className={premium.identityTags}><span><BookOpenCheck size={15}/>مكتبة علمية</span><span><Headphones size={15}/>مجالس سماع</span><span><MessageCircleQuestion size={15}/>فتاوى حديثية</span></div>
          </div>

          <div className={`${styles.links} ${mobileStyles.centerBlock}`}>
            <h3>روابط سريعة</h3>
            {quickLinks.map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>

          <div className={`${styles.links} ${mobileStyles.centerBlock}`}>
            <h3>المحتوى العلمي</h3>
            {knowledgeLinks.map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>

          <div className={`${styles.contact} ${premium.contact} ${mobileStyles.centerBlock}`}>
            <h3>بيانات علمية</h3>
            <span>
              <University size={18} />
              أستاذ الحديث وعلومه
            </span>
            <span>
              <MapPin size={18} />
              جامعة الملك خالد · أبها
            </span>
            <span>
              <Mail size={18} />
              قناة التواصل الرسمية
            </span>
            <div className={styles.telegramChannels} aria-label="قنوات تيليجرام العلمية">
              {telegramChannels.map((channel) => (
                <a
                  href={channel.href}
                  key={channel.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`فتح ${channel.label} على تيليجرام`}
                  title={channel.label}
                >
                  <TelegramIcon />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className={`${styles.bottom} ${premium.bottom}`}>
          <nav>{legalLinks.map(item=><Link href={item.href} key={item.href}>{item.label}</Link>)}</nav>
          <a className={`${premium.dwamCredit} ${logoStyles.credit}`} href="https://dwam-tech.com/" target="_blank" rel="noreferrer"><span>تصميم وتطوير شركة</span><i><Image className={logoStyles.logo} src="/media/images/logo3.png" alt="شركة دوام للتقنية" width={72} height={72}/></i></a>
        </div>
      </div>
    </footer>
  );
}
