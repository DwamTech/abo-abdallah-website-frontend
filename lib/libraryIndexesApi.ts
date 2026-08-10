import { z } from "zod";

import { ApiError } from "@/lib/api";
import {
  goldenVisitCollectionSchema,
  guestVisitCollectionSchema,
  guestVisitSubmissionSchema,
  libraryIndexSubmissionResponseSchema,
  libraryIndexSummarySchema,
  type GuestVisitSubmission,
} from "@/lib/libraryIndexesContract";

export {
  goldenVisitCollectionSchema,
  goldenVisitRecordSchema,
  guestVisitCollectionSchema,
  guestVisitRecordSchema,
  guestVisitSubmissionSchema,
  libraryIndexSubmissionResponseSchema,
  libraryIndexSummarySchema,
} from "@/lib/libraryIndexesContract";
export type {
  GoldenVisitCollection,
  GoldenVisitRecord,
  GuestVisitCollection,
  GuestVisitRecord,
  LibraryIndexCollection,
  LibraryIndexSummary,
} from "@/lib/libraryIndexesContract";

type IndexKind = "golden-visits" | "guests";

function clientUrl(
  path: string,
  params?: Record<string, string | number | undefined>,
) {
  const url = new URL(
    `/api/library-indexes/${path.replace(/^\/+/, "")}`,
    typeof window === "undefined" ? "http://localhost" : window.location.origin,
  );

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return `${url.pathname}${url.search}`;
}

async function parseClientResponse<T>(
  response: Response,
  schema: z.ZodType<T>,
  fallbackMessage: string,
): Promise<T> {
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const safeMessage = z
      .object({ message: z.string().min(1) })
      .safeParse(payload);
    throw new ApiError(
      safeMessage.success ? safeMessage.data.message : fallbackMessage,
      response.status,
    );
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Library indexes response validation failed", parsed.error.issues);
    }
    throw new ApiError("صيغة بيانات سجلات المكتبة غير متوافقة.", response.status, {
      cause: parsed.error,
    });
  }

  return parsed.data;
}

async function clientFetch(input: string, init: RequestInit) {
  try {
    return await fetch(input, init);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError("تعذّر الاتصال بخدمة سجلات المكتبة.", undefined, {
      cause: error,
    });
  }
}

export async function getLibraryIndexSummary(signal?: AbortSignal) {
  const response = await clientFetch(clientUrl("summary"), {
    headers: { Accept: "application/json" },
    cache: "no-store",
    credentials: "same-origin",
    signal,
  });
  const result = await parseClientResponse(
    response,
    libraryIndexSummarySchema,
    "تعذّر تحميل أعداد سجلات المكتبة.",
  );
  return result.data;
}

export async function getLibraryIndexRecords(
  kind: IndexKind,
  params: { search?: string; page?: number; per_page?: number } = {},
  signal?: AbortSignal,
) {
  const response = await clientFetch(clientUrl(kind, params), {
    headers: { Accept: "application/json" },
    cache: "no-store",
    credentials: "same-origin",
    signal,
  });
  return parseClientResponse(
    response,
    kind === "golden-visits"
      ? goldenVisitCollectionSchema
      : guestVisitCollectionSchema,
    "تعذّر تحميل سجل المكتبة.",
  );
}

export async function submitGoldenVisit(values: {
  name: string;
  visitDate?: string;
  image: File;
}) {
  const body = new FormData();
  body.set("name", values.name.trim());
  if (values.visitDate) body.set("visit_date", values.visitDate);
  body.set("image", values.image);

  const response = await clientFetch(clientUrl("golden-visits"), {
    method: "POST",
    headers: { Accept: "application/json" },
    body,
    cache: "no-store",
    credentials: "same-origin",
  });
  return parseClientResponse(
    response,
    libraryIndexSubmissionResponseSchema,
    "تعذّر إرسال طلب الزيارة الآن.",
  );
}

export async function submitGuestVisit(values: GuestVisitSubmission) {
  const parsed = guestVisitSubmissionSchema.safeParse(values);
  if (!parsed.success) throw new ApiError("راجع بيانات الضيف قبل الإرسال.", 422);

  const response = await clientFetch(clientUrl("guests"), {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
    cache: "no-store",
    credentials: "same-origin",
  });
  return parseClientResponse(
    response,
    libraryIndexSubmissionResponseSchema,
    "تعذّر إرسال طلب الضيف الآن.",
  );
}
