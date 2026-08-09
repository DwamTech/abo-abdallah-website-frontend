import { API_BASE_URL } from "@/lib/api";
import { proxyPublicView } from "@/lib/publicViewProxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ seriesSlug: string }> };

export async function POST(request: Request, context: Context) {
  const { seriesSlug } = await context.params;
  return proxyPublicView(
    request,
    `${API_BASE_URL}/listening/series/${encodeURIComponent(seriesSlug)}/view`,
  );
}
