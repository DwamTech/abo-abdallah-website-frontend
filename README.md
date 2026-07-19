# الموقع الرسمي للأستاذ الدكتور أبو عبد الله يحيى البكري الشهري

واجهة عربية مبنية بـ Next.js وTypeScript، ومصممة بهوية علمية هادئة تدعم اتجاه
الكتابة من اليمين إلى اليسار.

## التشغيل

```bash
npm install
npm run dev
```

ثم افتح `http://localhost:3000`.

لإنشاء نسخة الإنتاج:

```bash
npm run type-check
npm run build
npm start
```

## تنظيم المشروع

```text
app/
  layout.tsx
  page.tsx
  globals.css
components/
  home/
    HeroSection/
      HeroSection.tsx
      HeroSection.module.css
    MissionSection/
    CollectionsSection/
    FeaturedSection/
    MediaSection/
    BiographySection/
  layout/
    NewsTicker/
      NewsTicker.tsx
      NewsTicker.module.css
    Header/
    Footer/
```

كل قسم من الصفحة موجود داخل مكوّن مستقل، وملف التنسيق الخاص به موجود في المجلد
نفسه بصيغة CSS Module. يقتصر `globals.css` على متغيرات الهوية، وإعادة الضبط
العامة، والخطوط المشتركة.

## ملاحظات المحتوى

- النصوص الحالية تبني بوابات المحتوى دون نسبة عناوين كتب أو بحوث غير موثقة.
- الهوية الخطية داخل الواجهة نموذج رقمي أولي، ويمكن استبدالها لاحقًا بمخطوطة
  أصلية ينفذها خطاط متخصص.
- يمكن ربط الأقسام لاحقًا بلوحة إدارة أو مصدر بيانات من دون تغيير بنية التصميم.
