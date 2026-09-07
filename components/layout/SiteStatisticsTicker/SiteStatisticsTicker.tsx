import { getSiteStatisticsOrEmpty } from "@/lib/siteStatisticsApi";
import SiteStatisticsTickerMotion from "./SiteStatisticsTickerMotion";

export default async function SiteStatisticsTicker() {
  const items = await getSiteStatisticsOrEmpty();

  if (items.length === 0) return null;

  return <SiteStatisticsTickerMotion items={items} />;
}
