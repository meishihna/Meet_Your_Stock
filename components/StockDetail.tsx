"use client";

// 卡片詳情:點卡片後從底部滑出的面板,顯示完整基本資料與財務資料。

import { motion } from "framer-motion";
import type { Company } from "@/lib/types";
import {
  formatBigMoney,
  formatInt,
  formatPercent,
  formatPrice,
  orDash,
} from "@/lib/format";
import PriceChart from "./PriceChart";

export default function StockDetail({
  company,
  onClose,
}: {
  company: Company;
  onClose: () => void;
}) {
  const up = company.price.changePercent >= 0;
  const cur = company.currency;

  return (
    // 半透明遮罩,點空白處關閉
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 text-slate-800 shadow-2xl sm:rounded-3xl dark:bg-slate-900 dark:text-slate-100"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        onClick={(e) => e.stopPropagation()} // 避免點面板內部也關閉
      >
        {/* 頂部握把 */}
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-600" />

        {/* 標題 */}
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-3xl dark:bg-slate-800">
            {company.logo}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold">
              {company.name}{" "}
              <span className="text-sm font-normal text-slate-400">
                {company.ticker}
              </span>
            </h2>
            <p className="truncate text-sm text-slate-500">
              {company.description}
            </p>
          </div>
        </div>

        {/* 現價 */}
        <div className="mt-4 flex items-end gap-3">
          <span className="text-3xl font-extrabold">
            {formatPrice(company.price.current, cur)}
          </span>
          <span
            className={`pb-1 font-semibold ${
              up ? "text-green-600" : "text-red-600"
            }`}
          >
            {up ? "▲" : "▼"} {formatPercent(company.price.changePercent)}
          </span>
        </div>

        {/* 走勢圖 */}
        <div className="mt-3 rounded-xl bg-slate-50 p-2 dark:bg-slate-800/50">
          <div className="h-32">
            <PriceChart data={company.history} />
          </div>
          <p className="mt-1 text-center text-xs text-slate-400">
            {company.historySource === "real"
              ? "近一年週線(Yahoo Finance)"
              : "近一年走勢(模擬備援)"}
            {company.dataDate && `・收盤 ${company.dataDate}`}
          </p>
        </div>

        {/* 估值 */}
        <Section title="估值指標">
          <Row
            label="市值"
            value={formatBigMoney(company.fundamentals.marketCap, cur)}
          />
          <Row
            label="本益比 P/E"
            value={orDash(company.fundamentals.peRatio, (n) => n.toFixed(2))}
          />
          <Row
            label="股價淨值比 P/B"
            value={orDash(company.fundamentals.pbRatio, (n) => n.toFixed(2))}
          />
          <Row
            label="每股盈餘 EPS"
            value={orDash(company.fundamentals.eps, (n) => formatPrice(n, cur))}
          />
          <Row
            label="殖利率"
            value={orDash(
              company.fundamentals.dividendYield,
              (n) => `${n.toFixed(2)}%`
            )}
          />
        </Section>

        {/* 財務資料 */}
        <Section
          title={`財務資料${
            company.financialPeriod ? `(${company.financialPeriod})` : ""
          }`}
        >
          <Row
            label="營業收入"
            value={orDash(company.financials.revenue, (n) => formatBigMoney(n, cur))}
          />
          <Row
            label="稅後淨利"
            value={orDash(company.financials.netIncome, (n) =>
              formatBigMoney(n, cur)
            )}
          />
          <Row
            label="毛利率"
            value={orDash(company.financials.grossMargin, (n) => `${n.toFixed(1)}%`)}
          />
          <Row
            label="營業利益率"
            value={orDash(
              company.financials.operatingMargin,
              (n) => `${n.toFixed(1)}%`
            )}
          />
          <Row
            label="稅後純益率"
            value={orDash(company.financials.netMargin, (n) => `${n.toFixed(1)}%`)}
          />
        </Section>

        {/* 基本資料 */}
        <Section title="公司基本資料">
          <Row
            label="成立年份"
            value={orDash(company.basics.founded, (n) => String(n))}
          />
          <Row label="董事長" value={company.basics.ceo ?? "—"} />
          <Row label="總部" value={company.basics.headquarters ?? "—"} />
          <Row label="產業別" value={company.sector} />
          {company.basics.employees != null && (
            <Row label="員工數" value={formatInt(company.basics.employees)} />
          )}
        </Section>

        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block text-center text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            前往公司官網 ↗
          </a>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-slate-800 py-3 font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
        >
          關閉
        </button>
      </motion.div>
    </motion.div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <h3 className="mb-2 text-sm font-bold text-slate-400">{title}</h3>
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 dark:divide-slate-800 dark:border-slate-800">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
