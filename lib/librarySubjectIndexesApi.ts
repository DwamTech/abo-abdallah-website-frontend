import { API_BASE_URL, ApiError } from "./api.ts";
import {
  publicSubjectIndexDetailResponseSchema,
  publicSubjectIndexListResponseSchema,
  type PublicSubjectIndexDetail,
  type PublicSubjectIndexEntry,
  type LibraryIndexType,
} from "./librarySubjectIndexesContract.ts";

async function fetchPublicSubjectIndexes<T>(
  path: string,
  schema: { safeParse: (value: unknown) => { success: boolean; data?: T } },
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch (error) {
    throw new ApiError("تعذّر الاتصال بخادم الفهارس الموضوعية.", undefined, {
      cause: error,
    });
  }

  if (!response.ok) {
    throw new ApiError(
      response.status === 404
        ? "الفهرس المطلوب غير موجود."
        : "تعذّر تحميل بيانات الفهارس الموضوعية.",
      response.status,
    );
  }

  const payload: unknown = await response.json().catch(() => null);
  const parsed = schema.safeParse(payload);
  if (!parsed.success || !parsed.data) {
    throw new ApiError("صيغة بيانات الفهارس الموضوعية غير متوافقة.", response.status);
  }

  return parsed.data;
}

export async function getPublicSubjectIndexes(type: LibraryIndexType = "subject_index"): Promise<
  PublicSubjectIndexEntry[]
> {
  const response = await fetchPublicSubjectIndexes(
    `/library-subject-indexes?type=${encodeURIComponent(type)}`,
    publicSubjectIndexListResponseSchema,
  );
  return response.data;
}

export async function getPublicSubjectIndex(
  number: number,
  type: LibraryIndexType = "subject_index",
): Promise<PublicSubjectIndexDetail> {
  const response = await fetchPublicSubjectIndexes(
    `/library-subject-indexes/${number}?type=${encodeURIComponent(type)}`,
    publicSubjectIndexDetailResponseSchema,
  );
  return response.data;
}
