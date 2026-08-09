import type { ZodType } from "zod";

import type { GoldenVisitCollection } from "./libraryIndexesApi.ts";

const SAFE_UPSTREAM_STATUSES = new Set([400, 413, 422, 429]);

export function libraryIndexFailure(status: number, message: string) {
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

export function approvedIndexQuery(searchParams: URLSearchParams) {
  const query = new URLSearchParams();
  const search = searchParams.get("search")?.trim().slice(0, 180);
  const pageValue = Number(searchParams.get("page"));
  const perPageValue = Number(searchParams.get("per_page"));
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const perPage =
    Number.isInteger(perPageValue) && perPageValue > 0
      ? Math.min(perPageValue, 50)
      : 12;

  if (search) query.set("search", search);
  query.set("page", String(page));
  query.set("per_page", String(perPage));
  return query;
}

export function resolveLibraryIndexImageUrl(
  value: string | null | undefined,
  backendOrigin: string,
) {
  if (!value) return null;

  try {
    const parsed = new URL(value, `${backendOrigin.replace(/\/+$/, "")}/`);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function normalizeLibraryIndexCollectionImages(
  collection: GoldenVisitCollection,
  backendOrigin: string,
): GoldenVisitCollection {
  return {
    ...collection,
    data: collection.data.map((record) => ({
      ...record,
      image_url: resolveLibraryIndexImageUrl(record.image_url, backendOrigin),
    })),
  };
}

export async function validatedLibraryIndexResponse<T>(
  upstream: Response,
  schema: ZodType<T>,
  options: {
    failureMessage: string;
    transform?: (payload: T) => T;
    successStatus?: number;
  },
) {
  const payload: unknown = await upstream.json().catch(() => null);

  if (!upstream.ok) {
    return libraryIndexFailure(
      SAFE_UPSTREAM_STATUSES.has(upstream.status) ? upstream.status : 502,
      upstream.status === 413
        ? "حجم الملف المرفوع أكبر من المسموح."
        : upstream.status === 422
          ? "راجع البيانات المرسلة ثم حاول مرة أخرى."
          : upstream.status === 429
            ? "تم إرسال طلبات كثيرة؛ حاول مرة أخرى بعد قليل."
            : options.failureMessage,
    );
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "Library indexes upstream response validation failed",
        parsed.error.issues,
      );
    }
    return libraryIndexFailure(502, "أعادت خدمة سجلات المكتبة بيانات غير متوافقة.");
  }

  return Response.json(options.transform?.(parsed.data) ?? parsed.data, {
    status: options.successStatus ?? upstream.status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
