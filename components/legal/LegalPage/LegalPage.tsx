import Link from "next/link";
import { CalendarDays, ChevronLeft, FileCheck2, Home, ShieldCheck } from "lucide-react";
import SubpageBackdrop from "@/components/layout/SubpageBackdrop/SubpageBackdrop";
import { toArabicDigits } from "@/lib/arabicNumbers";
import styles from "./LegalPage.module.css";

type LegalContent = { title:string; subtitle:string; updatedAt:string; intro:string; sections:{title:string;content:string}[] };

export default function LegalPage({content,type}:{content:LegalContent;type:"terms"|"privacy"}) {
  const Icon=type==="privacy"?ShieldCheck:FileCheck2;
  return <>
    <section className={styles.hero}><div className={styles.heroInner}><nav><Link href="/"><Home size={13}/>الرئيسية</Link><span>/</span><strong>{content.title}</strong></nav><span className={styles.eyebrow}><Icon size={17}/>{content.subtitle}</span><h1>{content.title}</h1><p>{content.intro}</p><span className={styles.updated}><CalendarDays size={15}/>آخر تحديث: {content.updatedAt}</span></div></section>
    <section className={styles.content}><SubpageBackdrop/><div className={styles.inner}><aside><Icon size={30}/><strong>وثيقة الاستخدام</strong><p>توضح هذه الصفحة حقوق الزائر وضوابط استخدام الخدمات والمحتوى العلمي.</p><Link href={type==="terms"?"/privacy-policy":"/terms"}>{type==="terms"?"سياسة الخصوصية":"الشروط والأحكام"}<ChevronLeft size={15}/></Link></aside><article>{content.sections.map((section,index)=><section key={section.title}><i>{toArabicDigits(String(index+1).padStart(2,"0"))}</i><div><h2>{section.title}</h2><p>{section.content}</p></div></section>)}</article></div></section>
  </>;
}
