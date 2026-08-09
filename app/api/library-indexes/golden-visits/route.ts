import { z } from "zod";

import { API_BASE_URL, BACKEND_ORIGIN } from "@/lib/api";
import {
  goldenVisitCollectionSchema,
  libraryIndexSubmissionResponseSchema,
} from "@/lib/libraryIndexesApi";
import { createLibraryIndexesBffProxyHeaders } from "@/lib/libraryIndexesBffProxyHeaders";
import {
  approvedIndexQuery,
  libraryIndexFailure,
  normalizeLibraryIndexCollectionImages,
  validatedLibraryIndexResponse,
} from "@/lib/libraryIndexesProxy";
import { isSameOriginMutation } from "@/lib/sameOriginRequest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const goldenFieldsSchema = z.object({
  name: z.string().trim().min(2).max(180),
  visit_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export async function GET(request: Request) {
  const query = approvedIndexQuery(new URL(request.url).searchParams);
  let upstream: Response;

  try {
    upstream = await fetch(
      `${API_BASE_URL}/library-indexes/golden-visits?${query.toString()}`,
      { headers: { Accept: "application/json" }, cache: "no-store" },
    );
  } catch {
    return libraryIndexFailure(503, "خدمة السجل الذهبي غير متاحة الآن.");
  }

  return validatedLibraryIndexResponse(upstream, goldenVisitCollectionSchema, {
    failureMessage: "تعذّر تحميل السجل الذهبي.",
    transform: (payload) =>
      normalizeLibraryIndexCollectionImages(payload, BACKEND_ORIGIN),
  });
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return libraryIndexFailure(403, "تعذر التحقق من مصدر الطلب.");
  }

  const body = await request.formData().catch(() => null);
  if (!body) return libraryIndexFailure(422, "بيانات الزيارة غير مكتملة.");

  const rawDate = body.get("visit_date");
  const parsed = goldenFieldsSchema.safeParse({
    name: body.get("name"),
    ...(typeof rawDate === "string" && rawDate ? { visit_date: rawDate } : {}),
  });
  const image = body.get("image");

  if (
    !parsed.success ||
    !(image instanceof File) ||
    image.size === 0 ||
    image.size > MAX_IMAGE_BYTES ||
    !ALLOWED_IMAGE_TYPES.has(image.type)
  ) {
    return libraryIndexFailure(422, "راجع الاسم والصورة وتاريخ الزيارة.");
  }

  const upstreamBody = new FormData();
  upstreamBody.set("name", parsed.data.name);
  if (parsed.data.visit_date) {
    upstreamBody.set("visit_date", parsed.data.visit_date);
  }
  upstreamBody.set("image", image, image.name);

  let upstream: Response;
  try {
    const trustedProxyHeaders = createLibraryIndexesBffProxyHeaders(
      request.headers,
      process.env.LIBRARY_INDEXES_BFF_SHARED_SECRET,
      "/api/library-indexes/golden-visits",
    );
    upstream = await fetch(`${API_BASE_URL}/library-indexes/golden-visits`, {
      method: "POST",
      headers: { Accept: "application/json", ...trustedProxyHeaders },
      body: upstreamBody,
      cache: "no-store",
    });
  } catch {
    return libraryIndexFailure(503, "خدمة استقبال الزيارات غير متاحة الآن.");
  }

  return validatedLibraryIndexResponse(
    upstream,
    libraryIndexSubmissionResponseSchema,
    {
      failureMessage: "تعذّر إرسال طلب الزيارة الآن.",
      successStatus: 201,
    },
  );
}
