"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowLeft, BookOpenCheck, BookOpenText, Check, ChevronLeft, ChevronRight, Home, MessageCircleQuestion, Search, Send, Sparkles, X } from "lucide-react";
import SubpageBackdrop from "@/components/layout/SubpageBackdrop/SubpageBackdrop";
import { fatwaCategories, fatwas, questionSubmissionStages } from "@/lib/fatwaData";
import { toArabicDigits } from "@/lib/arabicNumbers";
import styles from "./FatwaIndexContent.module.css";
import enhancements from "./FatwaPagination.module.css";

export default function FatwaIndexContent() {
  const itemsPerPage = 8;
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState("الكل");
  const [currentPage,setCurrentPage]=useState(1);
  const [submitted,setSubmitted]=useState(false);
  useEffect(()=>{const value=new URLSearchParams(window.location.search).get("category");if(value&&fatwaCategories.includes(value))setCategory(value)},[]);
  const filtered=useMemo(()=>fatwas.filter(item=>(category==="الكل"||item.category===category)&&(!query.trim()||[item.title,item.question,item.answer,...item.keywords].some(value=>value.includes(query.trim())))),[category,query]);
  const totalPages=Math.max(1,Math.ceil(filtered.length/itemsPerPage));
  const pageItems=filtered.slice((currentPage-1)*itemsPerPage,currentPage*itemsPerPage);
  useEffect(()=>setCurrentPage(1),[category,query]);
  const goToPage=(page:number)=>{setCurrentPage(page);document.getElementById("fatwa-results")?.scrollIntoView({behavior:"smooth",block:"start"})};
  const submitQuestion=(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();setSubmitted(true);event.currentTarget.reset()};

  return <>
    <section className={styles.hero}><div className={styles.heroInner}>
      <nav className={styles.breadcrumb}><Link href="/"><Home size={13}/>الرئيسية</Link><span>/</span><strong>الفتاوى والمسائل الحديثية</strong></nav>
      <span className={styles.eyebrow}><MessageCircleQuestion size={16}/>مرجع الأسئلة الحديثية</span>
      <div className={enhancements.heroSymbol} aria-hidden="true"><span><BookOpenText size={64}/><i><MessageCircleQuestion size={27}/></i></span><b/><b/><b/></div>
      <h1>الفتاوى <span>والمسائل الحديثية</span></h1>
      <p>أجوبة علمية مصنفة في أبواب الحديث وعلومه، تجمع السؤال والجواب والمراجع والمسائل المرتبطة في سجل واحد.</p>
      <div className={enhancements.actionStack}><div className={enhancements.heroActions}><a href="#ask"><Send size={18}/><span><strong>أرسل سؤالك الحديثي</strong><small>انتقل إلى نموذج استقبال الأسئلة</small></span><ArrowDown size={17}/></a></div>
      <div className={`${styles.stats} ${enhancements.heroStats}`}><span><strong>{toArabicDigits(fatwas.length)}</strong>مسائل منشورة</span><i/><span><strong>{toArabicDigits(fatwaCategories.length-1)}</strong>أبواب علمية</span></div></div>
    </div></section>

    <section className={styles.catalog}><SubpageBackdrop/><div className={styles.inner}>
      <header id="fatwa-results" className={styles.catalogHead}><div><span><Sparkles size={14}/>فهرس الأجوبة</span><h2>ابحث في المسائل المنشورة</h2></div>
        <label className={styles.search}><Search size={20}/><span><small>بحث في السؤال والجواب</small><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="اكتب كلمة أو موضوعًا حديثيًا..."/></span>{query&&<button type="button" onClick={()=>setQuery("")}><X size={16}/></button>}<strong>{toArabicDigits(filtered.length)}</strong></label>
      </header>
      <div className={styles.filters}>{fatwaCategories.map(item=><button type="button" key={item} className={category===item?styles.active:undefined} onClick={()=>setCategory(item)}>{item}</button>)}</div>
      <div className={styles.grid}>{pageItems.map(item=><Link className={`${styles.card} ${enhancements.cardEnhanced}`} href={`/fatwas/${item.slug}`} key={item.slug}>
        <div className={`${styles.cardTop} ${enhancements.cardTopEnhanced}`}><i className={enhancements.cardIcon}><MessageCircleQuestion size={18}/></i><span className={enhancements.categoryLabel}>{item.category}</span></div><h3>{item.title}</h3><p className={styles.cardQuestion}>{item.question}</p><p className={styles.cardAnswer}>{item.answer}</p><footer><span><BookOpenCheck size={15}/>{toArabicDigits(item.sources.length)} مراجع</span><strong>قراءة الجواب <ArrowLeft size={16}/></strong></footer>
      </Link>)}</div>
      {filtered.length>itemsPerPage&&<nav className={enhancements.pagination} aria-label="صفحات الفتاوى">
        <button type="button" onClick={()=>goToPage(currentPage-1)} disabled={currentPage===1}><ChevronRight size={17}/><span>السابق</span></button>
        <div>{Array.from({length:totalPages},(_,index)=>index+1).map(page=><button type="button" key={page} onClick={()=>goToPage(page)} className={currentPage===page?enhancements.currentPage:undefined} aria-current={currentPage===page?"page":undefined}>{toArabicDigits(page)}</button>)}</div>
        <button type="button" onClick={()=>goToPage(currentPage+1)} disabled={currentPage===totalPages}><span>التالي</span><ChevronLeft size={17}/></button>
      </nav>}

      <section id="ask" className={styles.askSection}><div className={styles.askIntro}><span><Send size={18}/>استقبال الأسئلة الجديدة</span><h2>أرسل مسألتك إلى فضيلة الشيخ</h2><p>يمر السؤال بمراحل مراجعة واضحة قبل اعتماده للنشر أو إرساله للسائل فقط.</p><ol>{questionSubmissionStages.map((stage,index)=><li key={stage}><i>{toArabicDigits(index+1)}</i><span>{stage}</span></li>)}</ol></div>
        <form className={styles.form} onSubmit={submitQuestion}>{submitted&&<div className={styles.success}><Check size={18}/><span><strong>تم استلام السؤال مبدئيًا</strong><small>سيُربط الإرسال بلوحة الإدارة في مرحلة الـAPI.</small></span></div>}<label><span>الاسم</span><input name="name" required placeholder="اسم الباحث أو طالب العلم"/></label><label><span>البريد الإلكتروني</span><input name="email" type="email" required placeholder="name@example.com"/></label><label><span>تصنيف السؤال</span><select name="category" required defaultValue=""><option value="" disabled>اختر الباب العلمي</option>{fatwaCategories.slice(1).map(item=><option key={item}>{item}</option>)}</select></label><label className={styles.full}><span>عنوان المسألة</span><input name="title" required placeholder="عنوان مختصر وواضح"/></label><label className={styles.full}><span>نص السؤال</span><textarea name="question" required rows={5} placeholder="اكتب السؤال مع المعلومات والسياق اللازمين..."/></label><label className={styles.consent}><input type="checkbox" required/><span>أوافق على مراجعة السؤال علميًا ونشره دون البيانات الشخصية عند اعتماده.</span></label><button type="submit"><Send size={17}/>إرسال السؤال للفريق العلمي</button></form>
      </section>
    </div></section>
  </>;
}
