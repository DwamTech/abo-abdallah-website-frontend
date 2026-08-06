import { API_BASE_URL } from "@/lib/api";
import {
  scientificFatwaQuestionSchema,
  scientificFatwaSubmissionResponseSchema,
} from "@/lib/scientificFatwaApi";
import { isSameOriginMutation } from "@/lib/sameOriginRequest";

export const runtime = "nodejs";

function failure(status: number, message: string) {
  return Response.json(
    { success: false, message },
    { status, headers: { "cache-control": "private, no-store" } },
  );
}

export async function POST(request: Request): Promise<Response> {
  if (!isSameOriginMutation(request))
    return failure(403, "تعذر التحقق من مصدر الطلب.");

  const body: unknown = await request.json().catch(() => null);
  const parsed = scientificFatwaQuestionSchema.safeParse(body);
  if (!parsed.success) return failure(422, "بيانات السؤال غير مكتملة.");

  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE_URL}/scientific-fatwas/questions`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(request.headers.get("user-agent")
          ? { "User-Agent": request.headers.get("user-agent") as string }
          : {}),
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
  } catch {
    return failure(503, "خدمة استقبال الأسئلة غير متاحة الآن.");
  }

  const payload: unknown = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return failure(
      upstream.status,
      upstream.status === 429
        ? "تم إرسال عدد كبير من الأسئلة. حاول لاحقًا."
        : upstream.status === 422
          ? "بيانات السؤال غير مكتملة."
          : "تعذر إرسال السؤال الآن.",
    );
  }
  const validated = scientificFatwaSubmissionResponseSchema.safeParse(payload);
  if (!validated.success)
    return failure(502, "أعادت الخدمة استجابة غير متوافقة.");
  return Response.json(validated.data, {
    status: 201,
    headers: { "cache-control": "private, no-store" },
  });
}
