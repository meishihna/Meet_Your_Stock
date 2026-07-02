// 數字格式化工具,讓卡片上的財務數字好讀,並依幣別切換(台股 NT$、美股 $)。

import type { Currency } from "./types";

/** 一般股價,例如 NT$2,505.00 或 $214.29 */
export function formatPrice(n: number, currency: Currency = "TWD"): string {
  const symbol = currency === "USD" ? "$" : "NT$";
  return `${symbol}${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** 大金額(市值、營收)。台股用 兆/億/萬,美股用 T/B/M */
export function formatBigMoney(n: number, currency: Currency = "TWD"): string {
  const abs = Math.abs(n);
  if (currency === "USD") {
    if (abs >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (abs >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
    if (abs >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
    return `$${n.toLocaleString()}`;
  }
  // 台股
  if (abs >= 1e12) return `NT$${(n / 1e12).toFixed(2)} 兆`;
  if (abs >= 1e8) return `NT$${Math.round(n / 1e8).toLocaleString()} 億`;
  if (abs >= 1e4) return `NT$${Math.round(n / 1e4).toLocaleString()} 萬`;
  return `NT$${Math.round(n).toLocaleString()}`;
}

/** 百分比,帶正負號,例如 +2.34% */
export function formatPercent(n: number, withSign = true): string {
  const sign = withSign && n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

/** 整數(員工數等),帶千分位 */
export function formatInt(n: number): string {
  return n.toLocaleString("en-US");
}

/** 缺值時顯示「—」的小幫手:有值就套用格式,沒值就回傳破折號 */
export function orDash(
  v: number | null | undefined,
  fn: (n: number) => string
): string {
  return v == null || Number.isNaN(v) ? "—" : fn(v);
}
