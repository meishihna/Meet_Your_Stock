"use client";

// 滑卡狀態管理:記錄使用者滑過哪些卡、關注了哪些公司。
// 現在存在瀏覽器的 localStorage;之後階段 3 可改成打後端 API 雲端同步。

import { useCallback, useEffect, useState } from "react";
import type { SwipeAction, SwipeRecord } from "@/lib/types";

const STORAGE_KEY = "mys:swipes";

function loadSwipes(): SwipeRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SwipeRecord[]) : [];
  } catch {
    return [];
  }
}

export function useSwipeStore() {
  const [swipes, setSwipes] = useState<SwipeRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // 首次載入時,從 localStorage 讀回紀錄
  useEffect(() => {
    setSwipes(loadSwipes());
    setHydrated(true);
  }, []);

  // 每次 swipes 改變就寫回 localStorage
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(swipes));
  }, [swipes, hydrated]);

  /** 記錄一次滑卡 */
  const recordSwipe = useCallback((ticker: string, action: SwipeAction) => {
    setSwipes((prev) => [
      ...prev.filter((s) => s.ticker !== ticker), // 同一家只留最新一筆
      { ticker, action, timestamp: Date.now() },
    ]);
  }, []);

  /** 清空所有紀錄(重新開始滑) */
  const reset = useCallback(() => setSwipes([]), []);

  /** 已滑過的代碼集合(拿來過濾掉已看過的卡) */
  const swipedTickers = new Set(swipes.map((s) => s.ticker));

  /** 關注清單 = 右滑(like)或上滑(super)的公司,最新在前 */
  const watchlist = [...swipes]
    .filter((s) => s.action === "like" || s.action === "super")
    .sort((a, b) => b.timestamp - a.timestamp);

  return { swipes, hydrated, recordSwipe, reset, swipedTickers, watchlist };
}
