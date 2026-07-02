"use client";

// 關注清單檢視:列出右滑(關注)與上滑(深入研究)的公司。
// 公司資料由伺服器頁抓好後透過 props 傳入;哪些被關注則從 localStorage 讀。

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useSwipeStore } from "@/store/useSwipeStore";
import { formatBigMoney, formatPercent, formatPrice } from "@/lib/format";
import StockDetail from "@/components/StockDetail";
import type { Company } from "@/lib/types";

export default function WatchlistView({ companies }: { companies: Company[] }) {
  const { hydrated, watchlist } = useSwipeStore();
  const [detail, setDetail] = useState<Company | null>(null);

  // 代碼 → 公司,查表用
  const byTicker = useMemo(
    () => new Map(companies.map((c) => [c.ticker, c])),
    [companies]
  );

  // 把關注紀錄對應回完整公司資料
  const items = useMemo(
    () =>
      watchlist
        .map((s) => ({ record: s, company: byTicker.get(s.ticker) }))
        .filter((x): x is { record: typeof x.record; company: Company } =>
          Boolean(x.company)
        ),
    [watchlist, byTicker]
  );

  if (!hydrated) return <div className="py-10" />;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <div className="text-5xl">💤</div>
        <h2 className="mt-4 text-lg font-bold">還沒有關注任何公司</h2>
        <p className="mt-1 text-sm text-slate-500">回去滑幾張卡片吧!</p>
        <Link
          href="/"
          className="mt-6 rounded-full bg-slate-800 px-6 py-3 font-semibold text-white dark:bg-white dark:text-slate-900"
        >
          開始滑卡
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6">
      <h1 className="mb-4 text-xl font-bold">
        關注清單{" "}
        <span className="text-sm font-normal text-slate-400">
          ({items.length})
        </span>
      </h1>

      <ul className="space-y-3">
        {items.map(({ record, company: c }) => {
          const up = c.price.changePercent >= 0;
          return (
            <li key={c.ticker}>
              <button
                onClick={() => setDetail(c)}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl dark:bg-slate-800">
                  {c.logo}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{c.name}</span>
                    <span className="text-xs text-slate-400">{c.ticker}</span>
                    {record.action === "super" && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                        ★ 深入研究
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-slate-500">{c.sector}</p>
                  <p className="text-xs text-slate-400">
                    市值 {formatBigMoney(c.fundamentals.marketCap, c.currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatPrice(c.price.current, c.currency)}
                  </p>
                  <p
                    className={`text-sm ${
                      up ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {up ? "▲" : "▼"} {formatPercent(c.price.changePercent)}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <AnimatePresence>
        {detail && (
          <StockDetail company={detail} onClose={() => setDetail(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
