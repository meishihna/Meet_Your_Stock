// ┌───────────────────────────────────────────────────────────────┐
// │  資料服務層 (Data Service)                                       │
// │  App 取得公司資料的唯一入口。目前接台灣證交所 OpenAPI。          │
// │  若之後要換資料來源(其他 API、加上美股…),只改這個檔即可。      │
// └───────────────────────────────────────────────────────────────┘

import type { Company } from "./types";
import { fetchTaiwanCompanies } from "./twse";

/** 取得所有公司(卡片來源) */
export async function getCompanies(): Promise<Company[]> {
  return fetchTaiwanCompanies();
}

/** 用代碼取得單一公司 */
export async function getCompanyByTicker(
  ticker: string
): Promise<Company | undefined> {
  const all = await fetchTaiwanCompanies();
  return all.find((c) => c.ticker === ticker);
}
