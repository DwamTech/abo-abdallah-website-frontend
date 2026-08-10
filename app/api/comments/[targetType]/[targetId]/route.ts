import { API_BASE_URL } from "@/lib/api";
import { createCommentsBffProxyHeaders } from "@/lib/commentsBffProxyHeaders";
import { commentsModuleEnabled } from "@/lib/commentsFeature";
import {
  COMMENTS_PAGE_SIZE,
  parsePublicCommentRouteTarget,
  publicCommentsCollectionSchema,
  publicCommentSubmissionResponseSchema,
  publicCommentSubmissionSchema,
} from "@/lib/commentsContract";
import { isSameOriginMutation } from "@/lib/sameOriginRequest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ targetType: string; targetId: string }>;
};

const SAFE_UPSTREAM_STATUSES = new Set([400, 404, 413, 422, 429]);

function failure(status: number, message: string) {
  return Response.json(
    { success: false, message },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

async function routeTarget(context: RouteContext) {
  const { targetType, targetId } = await context.params;
  return parsePublicCommentRouteTarget(targetType, targetId);
}

function approvedPagination(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const rawPage = Number(searchParams.get("page"));
  const rawPerPage = Number(searchParams.get("per_page"));
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const perPage =
    Number.isInteger(rawPerPage) && rawPerPage > 0
      ? Math.min(rawPerPage, 30)
      : COMMENTS_PAGE_SIZE;
  return new URLSearchParams({ page: String(page), per_page: String(perPage) });
}

function upstreamPath(targetType: string, targetId: string) {
  return `/api/comments/${encodeURIComponent(targetType)}/${encodeURIComponent(targetId)}`;
}

export async function GET(request: Request, context: RouteContext) {
  if (!commentsModuleEnabled()) {
    return failure(404, "الخدمة المطلوبة غير متاحة.");
  }

  const target = await routeTarget(context);
  if (!target) return failure(404, "المادة المطلوبة غير موجودة.");

  const path = upstreamPath(target.type, target.targetId);
  const query = approvedPagination(request);
  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE_URL.replace(/\/api$/, "")}${path}?${query}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    return failure(503, "خدمة التعليقات غير متاحة الآن.");
  }

  const payload: unknown = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return failure(
      SAFE_UPSTREAM_STATUSES.has(upstream.status) ? upstream.status : 502,
      upstream.status === 404
        ? "المادة المطلوبة غير موجودة."
        : upstream.status === 429
          ? "تم إرسال طلبات كثيرة؛ حاول بعد قليل."
          : "تعذّر تحميل التعليقات الآن.",
    );
  }

  const parsed = publicCommentsCollectionSchema.safeParse(payload);
  if (!parsed.success) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Comments collection validation failed", parsed.error.issues);
    }
    return failure(502, "أعادت خدمة التعليقات بيانات غير متوافقة.");
  }

  return Response.json(parsed.data, {
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(request: Request, context: RouteContext) {
  if (!commentsModuleEnabled()) {
    return failure(404, "الخدمة المطلوبة غير متاحة.");
  }

  if (!isSameOriginMutation(request)) {
    return failure(403, "تعذر التحقق من مصدر الطلب.");
  }

  const target = await routeTarget(context);
  if (!target) return failure(404, "المادة المطلوبة غير موجودة.");

  const payload: unknown = await request.json().catch(() => null);
  const submission = publicCommentSubmissionSchema.safeParse(payload);
  if (!submission.success) {
    return failure(422, "راجع نص التعليق قبل الإرسال.");
  }

  const path = upstreamPath(target.type, target.targetId);
  const signedHeaders = createCommentsBffProxyHeaders(
    request.headers,
    process.env.COMMENTS_BFF_SHARED_SECRET,
    "POST",
    path,
  );

  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE_URL.replace(/\/api$/, "")}${path}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...signedHeaders,
      },
      body: JSON.stringify(submission.data),
      cache: "no-store",
    });
  } catch {
    return failure(503, "خدمة استقبال التعليقات غير متاحة الآن.");
  }

  const upstreamPayload: unknown = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return failure(
      SAFE_UPSTREAM_STATUSES.has(upstream.status) ? upstream.status : 502,
      upstream.status === 404
        ? "المادة المطلوبة غير موجودة."
        : upstream.status === 422
          ? "راجع نص التعليق قبل الإرسال."
          : upstream.status === 429
            ? "تم إرسال تعليقات كثيرة؛ حاول مرة أخرى لاحقًا."
            : "تعذّر إرسال التعليق الآن.",
    );
  }

  const parsed = publicCommentSubmissionResponseSchema.safeParse(upstreamPayload);
  if (!parsed.success) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Comment submission validation failed", parsed.error.issues);
    }
    return failure(502, "أعادت خدمة التعليقات استجابة غير متوافقة.");
  }

  return Response.json(parsed.data, {
    status: 201,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
