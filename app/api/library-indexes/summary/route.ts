import { API_BASE_URL } from "@/lib/api";
import { libraryIndexSummarySchema } from "@/lib/libraryIndexesApi";
import {
  libraryIndexFailure,
  validatedLibraryIndexResponse,
} from "@/lib/libraryIndexesProxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE_URL}/library-indexes/summary`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    return libraryIndexFailure(503, "خدمة إحصاءات سجلات المكتبة غير متاحة الآن.");
  }

  return validatedLibraryIndexResponse(upstream, libraryIndexSummarySchema, {
    failureMessage: "تعذّر تحميل أعداد سجلات المكتبة.",
  });
}
