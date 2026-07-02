// 全 App 共用的資料型別定義。
// UI 元件只認識這些型別,不在乎資料是假的還是來自 API。

/** 使用者對一張卡片的動作 */
export type SwipeAction = "like" | "pass" | "super";

/** 幣別(台股 TWD、美股 USD),決定金額怎麼顯示 */
export type Currency = "TWD" | "USD";

/** 股價走勢的單一資料點 */
export interface PricePoint {
  date: string; // YYYY-MM-DD
  close: number;
}

/**
 * 一家公司的完整資料(= 一張卡片)。
 * 有些欄位是可選(?):不是每家公司、每個資料來源都有(例如金控股沒有毛利率)。
 * UI 遇到缺的欄位會顯示「—」。
 */
export interface Company {
  ticker: string; // 股票代碼,例如 "2330"
  name: string; // 公司簡稱,例如 "台積電"
  logo: string; // 這裡用 emoji 當 Logo(依產業對應)
  sector: string; // 產業別
  description: string; // 公司全名 / 一句話簡介
  currency: Currency; // 幣別

  website?: string; // 官網
  dataDate?: string; // 收盤資料日期,例如 "2026/07/01"
  financialPeriod?: string; // 財報期間,例如 "2026 Q1"

  /** 即時股價 */
  price: {
    current: number; // 現價
    changePercent: number; // 當日漲跌幅(%)
  };

  /** 估值/基本面指標 */
  fundamentals: {
    marketCap: number; // 市值
    peRatio?: number; // 本益比 P/E
    dividendYield?: number; // 殖利率(%)
    pbRatio?: number; // 股價淨值比 P/B
    eps?: number; // 每股盈餘
  };

  /** 財務資料 */
  financials: {
    revenue?: number; // 營收
    netIncome?: number; // 淨利
    grossMargin?: number; // 毛利率(%)
    operatingMargin?: number; // 營業利益率(%)
    netMargin?: number; // 稅後純益率(%)
    debtRatio?: number; // 負債比(%)
    freeCashFlow?: number; // 自由現金流
  };

  /** 公司基本資料 */
  basics: {
    founded?: number; // 成立年份
    ceo?: string; // 董事長 / 執行長
    headquarters?: string; // 總部 / 住址
    employees?: number; // 員工數
  };

  /** 近一年股價走勢(demo 由程式產生,非真實歷史) */
  history: PricePoint[];
}

/** 一筆滑卡紀錄 */
export interface SwipeRecord {
  ticker: string;
  action: SwipeAction;
  timestamp: number;
}
