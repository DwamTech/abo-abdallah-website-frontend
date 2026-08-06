import Link from "next/link";
import { ArrowLeft, Feather } from "lucide-react";

import ArticleRouteState from "@/components/article/ArticleRouteState/ArticleRouteState";

export default function ArticleNotFound() {
  return (
    <ArticleRouteState
      title="المقال أو الدراسة غير موجودة"
      description="قد تكون حُذفت أو لم يحن موعد نشرها بعد."
      stateTitle="تعذّر العثور على المادة"
      stateDescription="يمكنك العودة إلى الأرشيف العلمي واختيار مادة أخرى."
      icon={<Feather size={30} />}
      action={
        <Link href="/articles">
          عرض جميع المقالات <ArrowLeft size={15} />
        </Link>
      }
    />
  );
}
