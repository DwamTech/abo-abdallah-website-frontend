import { getScientificLibrarySetCookieValues } from "./scientificLibraryCookies.ts";

const FORWARDED_PDF_HEADERS = [
  "content-type",
  "content-length",
  "content-range",
  "accept-ranges",
  "etag",
  "last-modified",
  "content-disposition",
  "cache-control",
] as const;

const SAFE_FILE_CONTENT_TYPES = new Set([
  "application/pdf",
  "application/octet-stream",
]);

function sanitizedStatus(status: number) {
  return [403, 404, 416, 429].includes(status) ? status : 502;
}

function sanitizedMessage(status: number) {
  if (status === 403) return "قراءة هذا المصنَّف غير متاحة.";
  if (status === 404) return "ملف المصنَّف غير موجود.";
  if (status === 416) return "نطاق الملف المطلوب غير صالح.";
  if (status === 429) return "طلبات القراءة كثيرة حاليًا؛ حاول بعد قليل.";
  return "تعذّر تحميل ملف المصنَّف.";
}

/**
 * Converts the fixed backend file response into an iframe-safe response.
 * Only successful PDF/octet-stream bodies cross the same-origin boundary;
 * backend HTML/error pages and their global frame policy never do.
 */
export async function createScientificLibraryReadResponse(upstream: Response) {
  const contentType = upstream.headers
    .get("content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();
  const isSuccessfulFile =
    (upstream.status === 200 || upstream.status === 206) &&
    upstream.body !== null &&
    Boolean(contentType && SAFE_FILE_CONTENT_TYPES.has(contentType));

  if (!isSuccessfulFile) {
    await upstream.body?.cancel().catch(() => undefined);
    const status = sanitizedStatus(upstream.status);
    const headers = new Headers({
      "Cache-Control": "private, no-store",
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
    });
    for (const value of getScientificLibrarySetCookieValues(
      upstream.headers,
      false,
    )) {
      headers.append("Set-Cookie", value);
    }

    return Response.json(
      { message: sanitizedMessage(status) },
      {
        status,
        headers,
      },
    );
  }

  const headers = new Headers();
  for (const name of FORWARDED_PDF_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  for (const value of getScientificLibrarySetCookieValues(
    upstream.headers,
    false,
  )) {
    headers.append("Set-Cookie", value);
  }

  // Deliberately do not forward the backend's global X-Frame-Options/CSP:
  // this fixed same-origin endpoint exists specifically for the PDF iframe.
  headers.set("X-Content-Type-Options", "nosniff");

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}

function sanitizedViewStatus(status: number) {
  return [403, 404, 429].includes(status) ? status : 502;
}

function sanitizedViewMessage(status: number) {
  if (status === 403) return "تسجيل المشاهدة غير متاح.";
  if (status === 404) return "المصنَّف المطلوب غير موجود.";
  if (status === 429) return "طلبات المشاهدة كثيرة حاليًا؛ حاول بعد قليل.";
  return "تعذّر تسجيل مشاهدة المصنَّف.";
}

/** Keeps backend debug/error bodies outside the public same-origin boundary. */
export async function createScientificLibraryViewResponse(upstream: Response) {
  const contentType = upstream.headers
    .get("content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();
  const isJson =
    contentType === "application/json" ||
    Boolean(contentType?.endsWith("+json"));
  const isEmptySuccess = upstream.status === 204 && upstream.body === null;
  const isSuccessfulJson = upstream.ok && upstream.body !== null && isJson;

  const headers = new Headers({
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  });
  for (const value of getScientificLibrarySetCookieValues(
    upstream.headers,
    true,
  )) {
    headers.append("Set-Cookie", value);
  }

  if (isEmptySuccess) {
    return new Response(null, { status: 204, headers });
  }

  if (isSuccessfulJson) {
    headers.set("Content-Type", upstream.headers.get("content-type")!);
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  }

  await upstream.body?.cancel().catch(() => undefined);
  const status = sanitizedViewStatus(upstream.status);
  headers.set("Content-Type", "application/json");
  return Response.json(
    { message: sanitizedViewMessage(status) },
    { status, headers },
  );
}
