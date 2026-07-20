export type LibraryContentType =
  | "الكتب والمؤلفات"
  | "التحقيقات العلمية"
  | "الأبحاث المحكمة"
  | "المقالات والدراسات"
  | "المحاضرات المكتوبة"
  | "المواد التعليمية"
  | "الإصدارات الحديثة";

export type HadithField =
  | "مصطلح الحديث"
  | "علم الرجال"
  | "الجرح والتعديل"
  | "علل الحديث"
  | "التخريج ودراسة الأسانيد"
  | "مختلف الحديث"
  | "شروح الحديث"
  | "مناهج المحدثين"
  | "الدراسات الحديثية المعاصرة";

export type LibraryWork = {
  slug: string;
  title: string;
  shortTitle: string;
  contentType: LibraryContentType;
  field: HadithField;
  description: string;
  publication: string;
  pages: number;
  edition: string;
  keywords: string[];
  contents: string[];
  accent: string;
  pdfUrl?: string;
  downloadAllowed: boolean;
  isPlaceholder: boolean;
};

export const libraryContentTypes: Array<LibraryContentType | "الكل"> = [
  "الكل",
  "الكتب والمؤلفات",
  "التحقيقات العلمية",
  "الأبحاث المحكمة",
  "المقالات والدراسات",
  "المحاضرات المكتوبة",
  "المواد التعليمية",
  "الإصدارات الحديثة",
];

export const hadithFields: Array<HadithField | "الكل"> = [
  "الكل",
  "مصطلح الحديث",
  "علم الرجال",
  "الجرح والتعديل",
  "علل الحديث",
  "التخريج ودراسة الأسانيد",
  "مختلف الحديث",
  "شروح الحديث",
  "مناهج المحدثين",
  "الدراسات الحديثية المعاصرة",
];

export const libraryWorks: LibraryWork[] = [
  {
    slug: "hadith-terminology-work",
    title: "عنوان مصنَّف في مصطلح الحديث",
    shortTitle: "مصطلح الحديث",
    contentType: "الكتب والمؤلفات",
    field: "مصطلح الحديث",
    description:
      "نموذج لعرض بيانات المصنَّف وملخصه، ويُستبدل بالعنوان والوصف الموثقين عند تزويد المكتبة بالبيانات الرسمية.",
    publication: "بيانات النشر قيد التوثيق",
    pages: 248,
    edition: "الطبعة الأولى — نموذج",
    keywords: ["مصطلح الحديث", "الرواية", "الدراية"],
    contents: [
      "مقدمة المصنَّف",
      "مدخل إلى علم المصطلح",
      "أقسام الخبر",
      "الصحيح والحسن",
      "الضعيف وأقسامه",
    ],
    accent: "#8a6638",
    downloadAllowed: false,
    isPlaceholder: true,
  },
  {
    slug: "narrators-study",
    title: "عنوان دراسة في علم الرجال",
    shortTitle: "علم الرجال",
    contentType: "الأبحاث المحكمة",
    field: "علم الرجال",
    description:
      "بطاقة تجريبية لدراسة علمية في تراجم الرواة ومناهج الأئمة، تمهيدًا لإضافة البحث الموثق وملفه.",
    publication: "بيانات المجلة قيد التوثيق",
    pages: 64,
    edition: "بحث محكّم — نموذج",
    keywords: ["الرواة", "التراجم", "علم الرجال"],
    contents: [
      "ملخص البحث",
      "إشكالية الدراسة",
      "المنهج والمصادر",
      "المباحث",
      "النتائج والتوصيات",
    ],
    accent: "#5f725e",
    downloadAllowed: false,
    isPlaceholder: true,
  },
  {
    slug: "criticism-verification",
    title: "عنوان تحقيق في الجرح والتعديل",
    shortTitle: "الجرح والتعديل",
    contentType: "التحقيقات العلمية",
    field: "الجرح والتعديل",
    description:
      "نموذج لصفحة تحقيق علمي يعرض وصف النسخة، وبيانات النشر، والفهرس، وملف القراءة عند اعتماده.",
    publication: "بيانات التحقيق قيد التوثيق",
    pages: 312,
    edition: "تحقيق علمي — نموذج",
    keywords: ["الجرح والتعديل", "النقد", "الرواة"],
    contents: [
      "مقدمة التحقيق",
      "وصف النسخ الخطية",
      "منهج التحقيق",
      "النص المحقق",
      "الفهارس العلمية",
    ],
    accent: "#765246",
    downloadAllowed: false,
    isPlaceholder: true,
  },
  {
    slug: "hidden-defects-paper",
    title: "عنوان بحث في علل الحديث",
    shortTitle: "علل الحديث",
    contentType: "الأبحاث المحكمة",
    field: "علل الحديث",
    description:
      "نموذج لبحث متخصص في مناهج النقاد وكشف العلل، يُستكمل بالبيانات العلمية الرسمية عند توفرها.",
    publication: "بيانات النشر قيد التوثيق",
    pages: 82,
    edition: "دراسة محكّمة — نموذج",
    keywords: ["علل الحديث", "النقد الحديثي", "الأسانيد"],
    contents: [
      "تمهيد",
      "مفهوم العلة",
      "مناهج النقاد",
      "نماذج تطبيقية",
      "الخاتمة",
    ],
    accent: "#516a72",
    downloadAllowed: false,
    isPlaceholder: true,
  },
  {
    slug: "isnad-training-material",
    title: "عنوان مادة تعليمية في دراسة الأسانيد",
    shortTitle: "دراسة الأسانيد",
    contentType: "المواد التعليمية",
    field: "التخريج ودراسة الأسانيد",
    description:
      "مادة تعليمية تجريبية توضّح أسلوب عرض المذكرات والملفات المساندة داخل المكتبة الرقمية.",
    publication: "إصدار تعليمي قيد التوثيق",
    pages: 126,
    edition: "مذكرة تعليمية — نموذج",
    keywords: ["التخريج", "الأسانيد", "التطبيق"],
    contents: [
      "مبادئ التخريج",
      "مصادر الحديث",
      "رسم شجرة الإسناد",
      "دراسة الرواة",
      "نماذج تدريبية",
    ],
    accent: "#8a7046",
    downloadAllowed: false,
    isPlaceholder: true,
  },
  {
    slug: "contemporary-hadith-article",
    title: "عنوان دراسة حديثية معاصرة",
    shortTitle: "دراسة معاصرة",
    contentType: "المقالات والدراسات",
    field: "الدراسات الحديثية المعاصرة",
    description:
      "نموذج لدراسة مكتوبة تعالج قضية حديثية معاصرة وتتيح قراءتها مباشرة داخل الموقع.",
    publication: "بيانات الإصدار قيد التوثيق",
    pages: 38,
    edition: "مقالة علمية — نموذج",
    keywords: ["دراسات معاصرة", "السنة النبوية", "مناهج البحث"],
    contents: [
      "مدخل الدراسة",
      "تحرير محل البحث",
      "المناقشة العلمية",
      "النتائج",
      "المراجع",
    ],
    accent: "#6f5a73",
    downloadAllowed: false,
    isPlaceholder: true,
  },
];

export function getLibraryWork(slug: string) {
  return libraryWorks.find((work) => work.slug === slug);
}

export function getRelatedWorks(work: LibraryWork) {
  return libraryWorks
    .filter(
      (item) =>
        item.slug !== work.slug &&
        (item.field === work.field || item.contentType === work.contentType),
    )
    .slice(0, 3);
}
