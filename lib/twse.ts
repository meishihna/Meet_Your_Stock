// ┌───────────────────────────────────────────────────────────────┐
// │  台灣證交所 (TWSE) OpenAPI 整合                                   │
// │  官方免費、免金鑰。資料為「每日收盤」(非即時逐筆)。             │
// │  這裡把 4 個端點的資料合併、對應成 App 的 Company 型別。          │
// │                                                                 │
// │  這是在「伺服器端」執行的(在 Server Component 裡被 await),      │
// │  所以不會有瀏覽器 CORS 問題,也能被 Next.js 的 fetch 快取。       │
// └───────────────────────────────────────────────────────────────┘

import type { Company, PricePoint } from "./types";
import { industryInfo } from "./industryMap";

const BASE = "https://openapi.twse.com.tw/v1";

// 想在 App 裡出現的股票(知名上市公司,涵蓋多種產業)
const TICKERS = [
  "2330", // 台積電
  "2317", // 鴻海
  "2454", // 聯發科
  "2308", // 台達電
  "2382", // 廣達
  "2412", // 中華電
  "2881", // 富邦金
  "2882", // 國泰金
  "2891", // 中信金
  "2603", // 長榮
  "1301", // 台塑
  "2002", // 中鋼
  "3008", // 大立光
  "2357", // 華碩
  "1216", // 統一
];

// 證交所回傳的每一列都是「欄位名 → 字串」
type Row = Record<string, string>;

/** 抓一個端點的 JSON。revalidate: 3600 = 每小時最多重抓一次(收盤資料不用更頻繁) */
async function fetchRows(path: string): Promise<Row[]> {
  const res = await fetch(`${BASE}${path}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TWSE ${path} 回應 ${res.status}`);
  return res.json();
}

/** 把可能含逗號的字串轉數字;空字串/無法解析回傳 undefined */
function num(s: string | undefined): number | undefined {
  if (s == null || s === "") return undefined;
  const n = parseFloat(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

/** 民國日期 "1150701" → "2026/07/01" */
function rocToDate(roc: string): string {
  const year = parseInt(roc.slice(0, 3), 10) + 1911;
  return `${year}/${roc.slice(3, 5)}/${roc.slice(5, 7)}`;
}

// ---- 走勢圖:目前用程式產生的模擬資料(非真實歷史) ----
function pseudoRandom(seed: number): () => number {
  let value = seed || 1;
  return () => {
    value = (value * 1103515245 + 12345) % 2147483648;
    return value / 2147483648;
  };
}
function generateHistory(ticker: string, currentPrice: number): PricePoint[] {
  let seed = 0;
  for (let i = 0; i < ticker.length; i++) seed = (seed * 31 + ticker.charCodeAt(i)) % 100000;
  const rand = pseudoRandom(seed);
  const points: PricePoint[] = [];
  const weeks = 52;
  let price = currentPrice * (0.7 + rand() * 0.4);
  const today = new Date();
  for (let i = weeks - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i * 7);
    const drift = (currentPrice - price) / (i + 1);
    const noise = (rand() - 0.5) * currentPrice * 0.05;
    price = Math.max(1, price + drift + noise);
    points.push({ date: date.toISOString().slice(0, 10), close: Number(price.toFixed(2)) });
  }
  points[points.length - 1].close = currentPrice;
  return points;
}

/**
 * 抓取「真實」近一年週線收盤價(Yahoo Finance chart API,免金鑰)。
 * 一檔一次呼叫,回傳約 52 週的收盤點。失敗回傳 null(讓呼叫端退回模擬資料)。
 */
async function fetchRealHistory(
  ticker: string,
  currentPrice: number
): Promise<PricePoint[] | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}.TW?range=1y&interval=1wk`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }, // Yahoo 會擋沒有 UA 的請求
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      chart?: {
        result?: {
          timestamp?: number[];
          indicators?: { quote?: { close?: (number | null)[] }[] };
        }[];
      };
    };

    const result = data.chart?.result?.[0];
    const timestamps = result?.timestamp;
    const closes = result?.indicators?.quote?.[0]?.close;
    if (!timestamps || !closes) return null;

    const points: PricePoint[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      const close = closes[i];
      if (close == null) continue; // 略過沒有成交(null)的週
      points.push({
        date: new Date(timestamps[i] * 1000).toISOString().slice(0, 10),
        close: Number(close.toFixed(2)),
      });
    }
    if (points.length < 4) return null;

    // 讓最後一點對齊卡片顯示的收盤價(證交所現價),避免圖尾與現價對不上
    points[points.length - 1].close = currentPrice;
    return points;
  } catch {
    return null;
  }
}

/**
 * 抓取並組裝台股公司資料。
 * 四個端點:
 *  - STOCK_DAY_ALL:每日收盤(價格、漲跌)
 *  - BWIBBU_ALL:本益比、殖利率、股價淨值比
 *  - t187ap03_L:上市公司基本資料(名稱、產業、董事長、成立日、股數)
 *  - t187ap17_L:營益分析(營收、毛利率、稅後純益率)
 */
export async function fetchTaiwanCompanies(): Promise<Company[]> {
  const [day, bwibbu, info, profit] = await Promise.all([
    fetchRows("/exchangeReport/STOCK_DAY_ALL"),
    fetchRows("/exchangeReport/BWIBBU_ALL"),
    fetchRows("/opendata/t187ap03_L"),
    fetchRows("/opendata/t187ap17_L"),
  ]);

  // 以股票代碼為 key 建索引,查表 O(1)
  const dayMap = new Map(day.map((r) => [r.Code, r]));
  const bwMap = new Map(bwibbu.map((r) => [r.Code, r]));
  const infoMap = new Map(info.map((r) => [r["公司代號"], r]));
  const profitMap = new Map(profit.map((r) => [r["公司代號"], r]));

  const companies: Company[] = [];

  for (const code of TICKERS) {
    const d = dayMap.get(code);
    const i = infoMap.get(code);
    if (!d || !i) continue; // 沒有收盤價或基本資料就跳過

    const b = bwMap.get(code);
    const f = profitMap.get(code);

    const close = num(d.ClosingPrice);
    if (close == null) continue;

    // 漲跌幅 = 漲跌價差 / 昨收。注意:漲跌 0 是有效值,不能當成缺值
    const change = num(d.Change) ?? 0;
    const prevClose = close - change;
    const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

    // 市值 = 已發行股數 × 收盤價
    const shares = num(i["已發行普通股數或TDR原股發行股數"]);
    const marketCap = shares != null ? shares * close : 0;

    const pe = num(b?.PEratio);

    // 營收(百萬元 → 元)、淨利(= 營收 × 稅後純益率)
    const revenueMillions = f ? num(f["營業收入(百萬元)"]) : undefined;
    const revenue = revenueMillions != null ? revenueMillions * 1e6 : undefined;
    const netMargin = f
      ? num(f["稅後純益率(%)(稅後純益)/(營業收入)"])
      : undefined;
    const netIncome =
      revenue != null && netMargin != null ? (revenue * netMargin) / 100 : undefined;

    const industry = industryInfo(i["產業別"] ?? "");

    companies.push({
      ticker: code,
      name: i["公司簡稱"] || code,
      logo: industry.emoji,
      sector: industry.name,
      description: i["公司名稱"] || "",
      currency: "TWD",
      website: i["網址"] || undefined,
      dataDate: d.Date ? rocToDate(d.Date) : undefined,
      financialPeriod: f
        ? `${parseInt(f["年度"], 10) + 1911} Q${f["季別"]}`
        : undefined,
      price: { current: close, changePercent },
      fundamentals: {
        marketCap,
        peRatio: pe,
        dividendYield: num(b?.DividendYield),
        pbRatio: num(b?.PBratio),
        eps: pe != null && pe > 0 ? Number((close / pe).toFixed(2)) : undefined,
      },
      financials: {
        revenue,
        netIncome,
        grossMargin: f ? num(f["毛利率(%)(營業毛利)/(營業收入)"]) : undefined,
        operatingMargin: f
          ? num(f["營業利益率(%)(營業利益)/(營業收入)"])
          : undefined,
        netMargin,
      },
      basics: {
        founded: i["成立日期"] ? parseInt(i["成立日期"].slice(0, 4), 10) : undefined,
        ceo: i["董事長"] || undefined,
        headquarters: i["住址"] || undefined,
      },
      history: generateHistory(code, close), // 先放模擬走勢當備援
      historySource: "simulated",
    });
  }

  // 平行抓每檔的真實週線;抓到就覆蓋掉模擬走勢,抓不到就保留備援
  const histories = await Promise.allSettled(
    companies.map((c) => fetchRealHistory(c.ticker, c.price.current))
  );
  histories.forEach((h, idx) => {
    if (h.status === "fulfilled" && h.value) {
      companies[idx].history = h.value;
      companies[idx].historySource = "real";
    }
  });

  return companies;
}
