import { z } from "zod";
import { API_BASE_URL, BACKEND_ORIGIN } from "@/lib/api";
import { goldenVisitRecordSchema } from "@/lib/libraryIndexesContract";
import { resolveLibraryIndexImageUrl } from "@/lib/libraryIndexesProxy";

const detailSchema = z.object({ data: goldenVisitRecordSchema });

export async function getPublicGoldenVisit(id: string) {
  if (!/^[1-9]\d*$/.test(id)) return null;

  const response = await fetch(`${API_BASE_URL}/library-indexes/golden-visits/${id}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("تعذّر تحميل كلمة الزائر الآن.");

  const result = detailSchema.safeParse(await response.json());
  if (!result.success) throw new Error("تعذّر قراءة بيانات الزيارة.");

  return {
    ...result.data.data,
    image_url: resolveLibraryIndexImageUrl(result.data.data.image_url, BACKEND_ORIGIN),
  };
}
