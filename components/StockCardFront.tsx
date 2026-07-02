// 卡面:滑動時看到的濃縮資訊(Logo、名稱、現價、走勢、3 個關鍵指標)。

import type { Company } from "@/lib/types";
import { formatMarketCap, formatMoney, formatPercent } from "@/lib/format";
import PriceChart from "./PriceChart";

export default function StockCardFront({ company }: { company: Company }) {
  const up = company.price.changePercent >= 0;

  return (
    <div className="flex h-full flex-col p-6 text-white">
      {/* 上半:Logo + 名稱 + 產業 */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-4xl backdrop-blur">
          {company.logo}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-2xl font-bold">{company.ticker}</h2>
          </div>
          <p className="truncate text-sm text-white/70">{company.name}</p>
          <span className="mt-1 inline-block rounded-full bg-white/15 px-2 py-0.5 text-xs">
            {company.sector}
          </span>
        </div>
      </div>

      {/* 現價 + 漲跌幅 */}
      <div className="mt-6 flex items-end justify-between">
        <div>
          <p className="text-4xl font-extrabold tracking-tight">
            {formatMoney(company.price.current)}
          </p>
          <p
            className={`mt-1 text-lg font-semibold ${
              up ? "text-green-300" : "text-red-300"
            }`}
          >
            {up ? "▲" : "▼"} {formatPercent(company.price.changePercent)}
          </p>
        </div>
      </div>

      {/* 走勢圖 */}
      <div className="mt-4">
        <PriceChart data={company.history} height={90} />
      </div>

      {/* 一句話簡介 */}
      <p className="mt-4 text-sm leading-relaxed text-white/80">
        {company.description}
      </p>

      {/* 底部:3 個關鍵指標 */}
      <div className="mt-auto grid grid-cols-3 gap-2 pt-4">
        <Metric label="市值" value={formatMarketCap(company.fundamentals.marketCap)} />
        <Metric label="本益比" value={company.fundamentals.peRatio.toFixed(1)} />
        <Metric
          label="殖利率"
          value={`${company.fundamentals.dividendYield.toFixed(2)}%`}
        />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 px-2 py-3 text-center backdrop-blur">
      <p className="text-xs text-white/60">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}
