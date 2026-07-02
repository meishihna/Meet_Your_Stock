// 卡面:滑動時看到的濃縮資訊(Logo、名稱、現價、走勢、3 個關鍵指標)。

import type { Company } from "@/lib/types";
import { formatBigMoney, formatPercent, formatPrice, orDash } from "@/lib/format";
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
          <h2 className="truncate text-2xl font-bold">{company.name}</h2>
          <p className="text-sm text-white/70">
            {company.ticker}
            <span className="ml-2 rounded-full bg-white/15 px-2 py-0.5 text-xs">
              {company.sector}
            </span>
          </p>
        </div>
      </div>

      {/* 現價 + 漲跌幅 */}
      <div className="mt-6">
        <p className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {formatPrice(company.price.current, company.currency)}
        </p>
        <p
          className={`mt-1 text-lg font-semibold ${
            up ? "text-green-300" : "text-red-300"
          }`}
        >
          {up ? "▲" : "▼"} {formatPercent(company.price.changePercent)}
          {company.dataDate && (
            <span className="ml-2 text-xs font-normal text-white/50">
              收盤 {company.dataDate}
            </span>
          )}
        </p>
      </div>

      {/* 公司全名 / 簡介 */}
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/70">
        {company.description}
      </p>

      {/* 走勢圖(主角:撐滿中間剩餘空間) */}
      <div className="mt-3 min-h-0 flex-1">
        <PriceChart data={company.history} />
      </div>

      {/* 底部:3 個關鍵指標 */}
      <div className="grid grid-cols-3 gap-2 pt-4">
        <Metric
          label="市值"
          value={formatBigMoney(company.fundamentals.marketCap, company.currency)}
        />
        <Metric
          label="本益比"
          value={orDash(company.fundamentals.peRatio, (n) => n.toFixed(1))}
        />
        <Metric
          label="殖利率"
          value={orDash(
            company.fundamentals.dividendYield,
            (n) => `${n.toFixed(2)}%`
          )}
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
