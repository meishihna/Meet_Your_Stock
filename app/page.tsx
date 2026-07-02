// 首頁:滑卡主畫面(伺服器元件,負責抓台股資料)。

import CardStack from "@/components/CardStack";
import { getCompanies } from "@/lib/dataService";

export default async function Home() {
  const companies = await getCompanies();

  return (
    <div className="flex flex-col items-center py-6">
      <p className="mb-6 text-center text-sm text-slate-500">
        滑動卡片,認識一家台股公司
      </p>
      <CardStack companies={companies} />
    </div>
  );
}
