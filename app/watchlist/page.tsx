// 關注清單頁(伺服器元件:抓資料後交給 WatchlistView 顯示)。

import WatchlistView from "@/components/WatchlistView";
import { getCompanies } from "@/lib/dataService";

export default async function WatchlistPage() {
  const companies = await getCompanies();
  return <WatchlistView companies={companies} />;
}
