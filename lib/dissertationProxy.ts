const SAFE_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "application/octet-stream",
]);

const FORWARDED_HEADERS = [
  "content-type",
  "content-length",
  "content-range",
  "accept-ranges",
  "etag",
  "last-modified",
  "content-disposition",
  "cache-control",
] as const;

function publicStatus(status: number) {
  return [403, 404, 416, 429].includes(status) ? status : 502;
}

export async function createDissertationReadResponse(upstream: Response) {
  const contentType = upstream.headers
    .get("content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();
  const validDocument =
    (upstream.status === 200 || upstream.status === 206) &&
    upstream.body !== null &&
    Boolean(contentType && SAFE_DOCUMENT_TYPES.has(contentType));

  if (!validDocument) {
    await upstream.body?.cancel().catch(() => undefined);
    const status = publicStatus(upstream.status);
    const message =
      status === 403
        ? "قراءة ملف الرسالة غير متاحة."
        : status === 404
          ? "ملف الرسالة غير موجود."
          : status === 416
            ? "نطاق الملف المطلوب غير صالح."
            : status === 429
              ? "طلبات القراءة كثيرة حاليًا؛ حاول بعد قليل."
              : "تعذّر تحميل ملف الرسالة.";
    return Response.json(
      { message },
      {
        status,
        headers: {
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  }

  const headers = new Headers();
  for (const name of FORWARDED_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("X-Content-Type-Options", "nosniff");

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}
