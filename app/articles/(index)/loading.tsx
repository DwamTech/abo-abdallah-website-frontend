import { LoaderCircle } from "lucide-react";

import ArticleRouteState from "@/components/article/ArticleRouteState/ArticleRouteState";

export default function ArticlesLoading() {
  return (
    <ArticleRouteState
      title="جارٍ تحميل المقالات والدراسات"
      description="لحظات ونستدعي المواد المنشورة من الخادم."
      stateTitle="جارٍ تجهيز الأرشيف العلمي"
      icon={<LoaderCircle className="article-route-spinner" size={30} />}
      busy
    />
  );
}
