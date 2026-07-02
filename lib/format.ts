// 數字格式化工具,讓卡片上的財務數字好讀。

/** 把大金額轉成 $1.23T / $45.6B / $789M 這種讀法 */
export function formatMarketCap(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

/** 一般金額(帶千分位),例如 $172.50 */
export function formatMoney(n: number): string {
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** 百分比,帶正負號,例如 +2.34% */
export function formatPercent(n: number, withSign = true): string {
  const sign = withSign && n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

/** 員工數之類的整數,帶千分位 */
export function formatInt(n: number): string {
  return n.toLocaleString("en-US");
}
