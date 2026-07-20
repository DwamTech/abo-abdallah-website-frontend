import { toArabicDigits } from "@/lib/arabicNumbers";

export type ListeningSession = {
  slug: string;
  number: number;
  title: string;
  date: string;
  duration: string;
  description: string;
  audioUrl?: string;
};

export type ListeningSeries = {
  slug: string;
  title: string;
  shortTitle: string;
  category: string;
  description: string;
  date: string;
  accent: string;
  initials: string;
  pdfUrl?: string;
  sessions: ListeningSession[];
};

const sessions = (
  titles: string[],
  descriptions: string[],
): ListeningSession[] =>
  titles.map((title, index) => ({
    slug: `session-${index + 1}`,
    number: index + 1,
    title,
    date: `${toArabicDigits(12 + index)} رجب ١٤٤٦هـ`,
    duration: `${index === 0 ? "٥٢" : index === 1 ? "٤٨" : "٥٦"} دقيقة`,
    description: descriptions[index] ?? descriptions[0],
  }));

export const listeningSeries: ListeningSeries[] = [
  {
    slug: "sahih-al-bukhari",
    title: "مجالس سماع صحيح البخاري",
    shortTitle: "صحيح البخاري",
    category: "كتب الصحاح",
    description:
      "مجالس علمية متسلسلة لقراءة صحيح الإمام البخاري، مع تعليقات حديثية ومنهجية تعين طالب العلم على المتابعة والضبط.",
    date: "١٤٤٦هـ",
    accent: "#a67a35",
    initials: "خ",
    sessions: sessions(
      [
        "المجلس الأول: بدء الوحي وكتاب الإيمان",
        "المجلس الثاني: تتمة كتاب الإيمان",
        "المجلس الثالث: كتاب العلم",
        "المجلس الرابع: كتاب الوضوء",
      ],
      [
        "افتتاح السلسلة والتعريف بمنهج الإمام البخاري، ثم قراءة أحاديث بدء الوحي وكتاب الإيمان.",
        "استكمال قراءة كتاب الإيمان مع الوقوف على أهم الفوائد الإسنادية والحديثية.",
        "قراءة كتاب العلم وبيان جملة من مسائل الرواية والتحمل وآداب طالب الحديث.",
        "قراءة كتاب الوضوء مع تعليقات موجزة على تراجم الأبواب وطرق الروايات.",
      ],
    ),
  },
  {
    slug: "sahih-muslim",
    title: "مجالس سماع صحيح مسلم",
    shortTitle: "صحيح مسلم",
    category: "كتب الصحاح",
    description:
      "قراءة مرتبة لأحاديث صحيح الإمام مسلم، مع عناية بترتيب الطرق والروايات وإبراز منهجه في التصنيف.",
    date: "١٤٤٥هـ",
    accent: "#64735d",
    initials: "م",
    sessions: sessions(
      [
        "المجلس الأول: المقدمة وكتاب الإيمان",
        "المجلس الثاني: تتمة كتاب الإيمان",
        "المجلس الثالث: كتاب الطهارة",
      ],
      [
        "مدخل إلى صحيح مسلم ومقدمته، والتعريف بمنهج الكتاب قبل بدء القراءة.",
        "استكمال أحاديث كتاب الإيمان وبيان أبرز المسائل المتعلقة بطرق الرواية.",
        "قراءة كتاب الطهارة مع تنبيهات على اختلاف الألفاظ والأسانيد.",
      ],
    ),
  },
  {
    slug: "sunan-and-masanid",
    title: "مجالس السنن والمسانيد",
    shortTitle: "السنن والمسانيد",
    category: "دواوين السنة",
    description:
      "مجالس منتقاة من دواوين السنة والمسانيد، تُعنى بالقراءة والإسناد والتعريف بمناهج المصنفين.",
    date: "١٤٤٥هـ",
    accent: "#7b5b4a",
    initials: "س",
    sessions: sessions(
      [
        "المجلس الأول: مدخل إلى كتب السنن",
        "المجلس الثاني: من سنن أبي داود",
        "المجلس الثالث: من مسند الإمام أحمد",
      ],
      [
        "تعريف بكتب السنن وخصائص ترتيبها ومكانتها بين مصادر الحديث.",
        "قراءة منتقاة من سنن أبي داود مع فوائد حديثية.",
        "قراءة منتقاة من مسند الإمام أحمد والتعريف بطريقة ترتيبه.",
      ],
    ),
  },
  {
    slug: "hadith-terminology",
    title: "مجالس كتب المصطلح",
    shortTitle: "كتب المصطلح",
    category: "علوم الحديث",
    description:
      "قراءات وشروح في أمهات كتب مصطلح الحديث، تبني الملكة العلمية وتوضح مراتب الأخبار وقواعد المحدثين.",
    date: "١٤٤٤هـ",
    accent: "#8b6f43",
    initials: "ص",
    sessions: sessions(
      [
        "المجلس الأول: مبادئ علم المصطلح",
        "المجلس الثاني: الصحيح والحسن",
        "المجلس الثالث: الضعيف وأقسامه",
      ],
      [
        "مدخل تأسيسي إلى نشأة المصطلح وأهم موضوعاته وكتبه.",
        "قراءة في تعريف الصحيح والحسن وشروط كل منهما.",
        "بيان مفهوم الحديث الضعيف وأشهر أقسامه وأسباب الضعف.",
      ],
    ),
  },
  {
    slug: "hadith-lessons",
    title: "الدروس والشروح الحديثية",
    shortTitle: "الشروح الحديثية",
    category: "دروس علمية",
    description:
      "دروس موضوعية وشروح مختارة في الحديث وعلومه، مرتبة في سلاسل يسهل الرجوع إليها ومتابعتها.",
    date: "متجدد",
    accent: "#596a72",
    initials: "د",
    sessions: sessions(
      [
        "المجلس الأول: مناهج شراح الحديث",
        "المجلس الثاني: فقه التراجم",
        "المجلس الثالث: التعامل مع اختلاف الروايات",
      ],
      [
        "عرض لأهم مناهج شراح الحديث وخصائص كل منهج.",
        "بيان أثر تراجم الأبواب في فهم فقه المصنف ومقاصده.",
        "قواعد عملية في جمع الروايات وفهم اختلاف ألفاظها.",
      ],
    ),
  },
];

export function getListeningSeries(slug: string) {
  return listeningSeries.find((series) => series.slug === slug);
}

export function getListeningSession(seriesSlug: string, sessionSlug: string) {
  const series = getListeningSeries(seriesSlug);
  const session = series?.sessions.find((item) => item.slug === sessionSlug);

  return { series, session };
}

export const totalListeningSessions = listeningSeries.reduce(
  (total, series) => total + series.sessions.length,
  0,
);
