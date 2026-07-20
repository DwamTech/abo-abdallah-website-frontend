import {
  Mail,
  MapPin,
  University,
} from "lucide-react";
import Image from "next/image";
import { toArabicDigits } from "@/lib/arabicNumbers";
import styles from "./Footer.module.css";

const quickLinks = [
  { label: "عن الشيخ", href: "/about" },
  { label: "مجالس السماع", href: "/listening" },
  { label: "الكتب والمؤلفات", href: "/library" },
  { label: "البحوث والدراسات", href: "#featured" },
];

const knowledgeLinks = [
  { label: "مجالس السماع", href: "/listening" },
  { label: "المكتبة الرقمية", href: "/library" },
  { label: "الفتاوى والأجوبة", href: "#library" },
  { label: "السيرة العلمية", href: "#biography" },
  { label: "البحث في الموقع", href: "#home" },
];

export default function Footer() {
  return (
    <footer id="footer" className={styles.footer}>
      <div className={styles.topLine} />
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.identity}>
            <a
              className={styles.brand}
              href="/"
              aria-label="العودة إلى الصفحة الرئيسية"
            >
              <Image
                className={styles.footerLogo}
                src="/media/images/logo2.png"
                alt="أبو عبد الله يحيى بن عبد الله البكري ثم الشهري"
                width={866}
                height={288}
              />
            </a>
            <p>
              موقع علمي يجمع الإنتاج الأكاديمي والدعوي، ويخدم الباحثين وطلاب
              العلم في الحديث النبوي وعلومه.
            </p>
          </div>

          <div className={styles.links}>
            <h3>روابط سريعة</h3>
            {quickLinks.map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>

          <div className={styles.links}>
            <h3>المحتوى العلمي</h3>
            {knowledgeLinks.map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>

          <div className={styles.contact}>
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
          </div>
        </div>

        <div className={styles.bottom}>
          <p>
            © {toArabicDigits(new Date().getFullYear())} الموقع الرسمي للأستاذ الدكتور أبو عبد
            الله يحيى البكري الشهري
          </p>
        </div>
      </div>
    </footer>
  );
}
