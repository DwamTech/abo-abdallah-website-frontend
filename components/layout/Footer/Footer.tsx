import {
  BookOpenCheck,
  Headphones,
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
import FooterContactDetails from "./FooterContactDetails";

const knowledgeLinks = siteContent.footerKnowledgeLinks;
const legalLinks = siteContent.footerLegalLinks;

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
                src="/media/images/elmaktaba_elbakrya.png"
                alt="المكتبة البكرية"
                width={834}
                height={299}
              />
            </a>
            <p>
             منصة علمية تجمع أهم مصادر المعرفة، والإنتاج العلمي والأكاديمي، والجهود في خدمة السنة النبوية.
            </p>
            <div className={premium.identityTags}><span><BookOpenCheck size={15}/>مكتبة علمية</span><span><Headphones size={15}/>مجالس سماع</span><span><MessageCircleQuestion size={15}/>فتاوى حديثية</span></div>
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
            <FooterContactDetails />
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
