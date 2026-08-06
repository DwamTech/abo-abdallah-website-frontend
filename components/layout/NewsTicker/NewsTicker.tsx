import { getNewsTickerOrEmpty } from "@/lib/newsTickerApi";
import NewsTickerMotion from "./NewsTickerMotion";

export default async function NewsTicker() {
  const items = await getNewsTickerOrEmpty();

  if (items.length === 0) return null;

  return <NewsTickerMotion items={items} />;
}
