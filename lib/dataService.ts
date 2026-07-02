// ┌───────────────────────────────────────────────────────────────┐
// │  資料服務層 (Data Service)                                       │
// │  這是「假資料」與「真實 API」的唯一交界。                          │
// │  現在:讀取本地 companies.json,並用程式產生一年份的股價走勢。      │
// │  未來:把下面函式改成 fetch(真財經 API) 即可,UI 完全不用改。      │
// └───────────────────────────────────────────────────────────────┘

import rawCompanies from "@/data/companies.json";
import type { Company, CompanyRaw, PricePoint } from "@/lib/types";

/** 用 ticker 產生一個穩定的種子,讓同一家公司每次走勢圖都一樣(deterministic) */
function seedFromTicker(ticker: string): number {
  let seed = 0;
  for (let i = 0; i < ticker.length; i++) {
    seed = (seed * 31 + ticker.charCodeAt(i)) % 100000;
  }
  return seed;
}

/** 簡易可重現的偽隨機產生器 */
function pseudoRandom(seed: number): () => number {
  let value = seed || 1;
  return () => {
    value = (value * 1103515245 + 12345) % 2147483648;
    return value / 2147483648;
  };
}

/**
 * 根據現價,往回產生近一年(每週一點,共 52 點)的模擬股價走勢。
 * 註:demo 用途,並非真實歷史資料。
 */
function generateHistory(ticker: string, currentPrice: number): PricePoint[] {
  const rand = pseudoRandom(seedFromTicker(ticker));
  const points: PricePoint[] = [];
  const weeks = 52;

  // 從一年前某個價位開始,逐週隨機漲跌,最後收在現價附近
  let price = currentPrice * (0.7 + rand() * 0.4); // 一年前的起點
  const today = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i * 7);

    const drift = (currentPrice - price) / (i + 1); // 慢慢拉回現價
    const noise = (rand() - 0.5) * currentPrice * 0.05; // 每週波動
    price = Math.max(1, price + drift + noise);

    points.push({
      date: date.toISOString().slice(0, 10),
      close: Number(price.toFixed(2)),
    });
  }

  // 確保最後一點就是現價
  points[points.length - 1].close = currentPrice;
  return points;
}

/** 把原始資料補上走勢圖,組成完整的 Company */
function withHistory(raw: CompanyRaw): Company {
  return { ...raw, history: generateHistory(raw.ticker, raw.price.current) };
}

/** 取得所有公司(卡片來源)。之後可改成 async fetch。 */
export function getCompanies(): Company[] {
  return (rawCompanies as CompanyRaw[]).map(withHistory);
}

/** 用代碼取得單一公司(詳情頁用) */
export function getCompanyByTicker(ticker: string): Company | undefined {
  const raw = (rawCompanies as CompanyRaw[]).find((c) => c.ticker === ticker);
  return raw ? withHistory(raw) : undefined;
}
