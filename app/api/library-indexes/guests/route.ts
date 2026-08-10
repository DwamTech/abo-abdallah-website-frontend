import { API_BASE_URL } from "@/lib/api";
import {
  guestVisitSubmissionSchema,
  guestVisitCollectionSchema,
  libraryIndexSubmissionResponseSchema,
} from "@/lib/libraryIndexesApi";
import { createLibraryIndexesBffProxyHeaders } from "@/lib/libraryIndexesBffProxyHeaders";
import {
  approvedIndexQuery,
  libraryIndexFailure,
  validatedLibraryIndexResponse,
} from "@/lib/libraryIndexesProxy";
import { isSameOriginMutation } from "@/lib/sameOriginRequest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = approvedIndexQuery(new URL(request.url).searchParams);
  let upstream: Response;

  try {
    upstream = await fetch(
      `${API_BASE_URL}/library-indexes/guests?${query.toString()}`,
      { headers: { Accept: "application/json" }, cache: "no-store" },
    );
  } catch {
    return libraryIndexFailure(503, "خدمة سجل الضيوف غير متاحة الآن.");
  }

  return validatedLibraryIndexResponse(upstream, guestVisitCollectionSchema, {
    failureMessage: "تعذّر تحميل سجل الضيوف.",
  });
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return libraryIndexFailure(403, "تعذر التحقق من مصدر الطلب.");
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = guestVisitSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return libraryIndexFailure(422, "بيانات الضيف غير مكتملة.");
  }

  let upstream: Response;
  try {
    const trustedProxyHeaders = createLibraryIndexesBffProxyHeaders(
      request.headers,
      process.env.LIBRARY_INDEXES_BFF_SHARED_SECRET,
      "/api/library-indexes/guests",
    );
    upstream = await fetch(`${API_BASE_URL}/library-indexes/guests`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...trustedProxyHeaders,
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
  } catch {
    return libraryIndexFailure(503, "خدمة استقبال الضيوف غير متاحة الآن.");
  }

  return validatedLibraryIndexResponse(
    upstream,
    libraryIndexSubmissionResponseSchema,
    {
      failureMessage: "تعذّر إرسال طلب الضيف الآن.",
      successStatus: 201,
    },
  );
}
