import { z } from "zod";

import { ApiError } from "@/lib/api";
import {
  COMMENTS_PAGE_SIZE,
  publicCommentsCollectionSchema,
  publicCommentSubmissionResponseSchema,
  publicCommentSubmissionSchema,
  publicCommentTargetSegments,
  type PublicCommentSubmission,
  type PublicCommentTarget,
} from "@/lib/commentsContract";

function clientEndpoint(
  target: PublicCommentTarget,
  query?: Record<string, number>,
) {
  const path = publicCommentTargetSegments(target)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    search.set(key, String(value));
  }
  return `/api/comments/${path}${search.size ? `?${search.toString()}` : ""}`;
}

async function fetchCommentsResponse<T>(
  response: Response,
  schema: z.ZodType<T>,
  fallbackMessage: string,
) {
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const errorPayload = z
      .object({ message: z.string().trim().min(1) })
      .safeParse(payload);
    throw new ApiError(
      errorPayload.success ? errorPayload.data.message : fallbackMessage,
      response.status,
    );
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Public comments response validation failed", parsed.error.issues);
    }
    throw new ApiError("أعادت خدمة التعليقات بيانات غير متوافقة.", 502, {
      cause: parsed.error,
    });
  }
  return parsed.data;
}

export async function getPublicComments(
  target: PublicCommentTarget,
  page = 1,
  signal?: AbortSignal,
) {
  let response: Response;
  try {
    response = await fetch(
      clientEndpoint(target, { page, per_page: COMMENTS_PAGE_SIZE }),
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
        credentials: "same-origin",
        signal,
      },
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError("تعذّر الاتصال بخدمة التعليقات.", undefined, {
      cause: error,
    });
  }

  return fetchCommentsResponse(
    response,
    publicCommentsCollectionSchema,
    "تعذّر تحميل التعليقات الآن.",
  );
}

export async function submitPublicComment(
  target: PublicCommentTarget,
  values: PublicCommentSubmission,
) {
  const parsed = publicCommentSubmissionSchema.safeParse(values);
  if (!parsed.success) throw new ApiError("راجع نص التعليق قبل الإرسال.", 422);

  let response: Response;
  try {
    response = await fetch(clientEndpoint(target), {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
      credentials: "same-origin",
    });
  } catch (error) {
    throw new ApiError("تعذّر الاتصال بخدمة التعليقات.", undefined, {
      cause: error,
    });
  }

  return fetchCommentsResponse(
    response,
    publicCommentSubmissionResponseSchema,
    "تعذّر إرسال التعليق الآن.",
  );
}
