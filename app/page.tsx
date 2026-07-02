// 首頁:滑卡主畫面。

import CardStack from "@/components/CardStack";

export default function Home() {
  return (
    <div className="flex flex-col items-center py-6">
      <p className="mb-6 text-center text-sm text-slate-500">
        滑動卡片,認識一家公司
      </p>
      <CardStack />
    </div>
  );
}
