// 全 App 共用的資料型別定義。
// UI 元件只認識這些型別,不在乎資料是假的還是來自真實 API。

/** 使用者對一張卡片的動作 */
export type SwipeAction = "like" | "pass" | "super";

/** 股價走勢的單一資料點 */
export interface PricePoint {
  date: string; // YYYY-MM-DD
  close: number;
}

/** 一家公司的完整資料(= 一張卡片) */
export interface Company {
  ticker: string; // 股票代碼,例如 "AAPL"
  name: string; // 公司名稱
  logo: string; // 這裡先用 emoji 當 Logo,之後可換成圖片網址
  sector: string; // 產業別
  description: string; // 一句話簡介

  /** 即時股價 */
  price: {
    current: number; // 現價(美元)
    changePercent: number; // 當日漲跌幅(%)
  };

  /** 估值/基本面指標 */
  fundamentals: {
    marketCap: number; // 市值(美元)
    peRatio: number; // 本益比 P/E
    dividendYield: number; // 殖利率(%)
    eps: number; // 每股盈餘
  };

  /** 財務資料(年度) */
  financials: {
    revenue: number; // 營收(美元)
    netIncome: number; // 淨利(美元)
    grossMargin: number; // 毛利率(%)
    debtRatio: number; // 負債比(%)
    freeCashFlow: number; // 自由現金流(美元)
  };

  /** 公司基本資料 */
  basics: {
    founded: number; // 成立年份
    ceo: string; // 執行長
    headquarters: string; // 總部
    employees: number; // 員工數
  };

  /** 近一年股價走勢(demo 由程式產生) */
  history: PricePoint[];
}

/** JSON 檔裡儲存的原始公司資料:不含 history,history 由資料服務層產生 */
export type CompanyRaw = Omit<Company, "history">;

/** 一筆滑卡紀錄 */
export interface SwipeRecord {
  ticker: string;
  action: SwipeAction;
  timestamp: number;
}
