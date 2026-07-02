"use client";

// 卡片堆疊:管理目前這疊卡、處理左右滑、下方操作按鈕、以及詳情面板。

import { useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { Company, SwipeAction } from "@/lib/types";
import { useSwipeStore } from "@/store/useSwipeStore";
import SwipeCard, { type SwipeCardHandle } from "./SwipeCard";
import StockDetail from "./StockDetail";

// 公司資料由伺服器元件(page.tsx)抓好後,透過 props 傳進來
export default function CardStack({ companies }: { companies: Company[] }) {
  const { hydrated, recordSwipe, reset, swipedTickers, watchlist } =
    useSwipeStore();
  const topCardRef = useRef<SwipeCardHandle>(null);

  // 詳情面板要顯示哪一家(null 代表關閉)
  const [detail, setDetail] = useState<Company | null>(null);

  // 還沒滑過的公司才留在牌堆裡
  const deck = useMemo(
    () => companies.filter((c) => !swipedTickers.has(c.ticker)),
    [companies, swipedTickers]
  );

  // localStorage 還沒讀回來前先不畫,避免畫面閃動
  if (!hydrated) {
    return <div className="h-[560px] w-full max-w-sm" />;
  }

  // 牌堆滑完 → 顯示總結
  if (deck.length === 0) {
    return (
      <div className="flex h-[560px] w-full max-w-sm flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
        <div className="text-6xl">🎉</div>
        <h2 className="mt-4 text-xl font-bold">看完全部了!</h2>
        <p className="mt-2 text-slate-500">
          你關注了 {watchlist.length} 家公司。
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-full bg-slate-800 px-6 py-3 font-semibold text-white dark:bg-white dark:text-slate-900"
        >
          重新開始
        </button>
      </div>
    );
  }

  function handleSwipe(company: Company, action: SwipeAction) {
    recordSwipe(company.ticker, action);
  }

  // 只顯示牌堆最上面 3 張(最上面那張可滑)
  const visible = deck.slice(0, 3);

  return (
    <div className="flex w-full max-w-sm flex-col items-center">
      {/* 卡片堆疊區 */}
      <div className="relative h-[560px] w-full">
        {visible
          .map((company, i) => {
            const isTop = i === 0;
            // 後面的卡片往下、縮小一點,做出堆疊層次
            const scale = 1 - i * 0.04;
            const translateY = i * 12;

            if (isTop) {
              return (
                <SwipeCard
                  key={company.ticker}
                  ref={topCardRef}
                  company={company}
                  onSwipe={(action) => handleSwipe(company, action)}
                  onTap={() => setDetail(company)}
                />
              );
            }

            return (
              <div
                key={company.ticker}
                className="absolute inset-0 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl"
                style={{
                  transform: `translateY(${translateY}px) scale(${scale})`,
                  zIndex: -i,
                }}
              >
                {/* 背景卡只需視覺存在,不放內容以省效能 */}
              </div>
            );
          })
          // 反轉讓最上面那張畫在最後(DOM 最上層)
          .reverse()}
      </div>

      {/* 操作按鈕 */}
      <div className="mt-6 flex items-center gap-5">
        <ActionButton
          label="略過"
          onClick={() => topCardRef.current?.swipe("pass")}
          className="border-red-400 text-red-500 hover:bg-red-50"
        >
          ✕
        </ActionButton>
        <ActionButton
          label="深入研究"
          onClick={() => topCardRef.current?.swipe("super")}
          className="border-blue-400 text-blue-500 hover:bg-blue-50"
          small
        >
          ★
        </ActionButton>
        <ActionButton
          label="關注"
          onClick={() => topCardRef.current?.swipe("like")}
          className="border-green-400 text-green-500 hover:bg-green-50"
        >
          ♥
        </ActionButton>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        左滑略過 · 右滑關注 · 點卡片看財務詳情
      </p>

      {/* 詳情面板 */}
      <AnimatePresence>
        {detail && (
          <StockDetail company={detail} onClose={() => setDetail(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionButton({
  children,
  label,
  onClick,
  className = "",
  small = false,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex items-center justify-center rounded-full border-2 bg-white shadow-md transition active:scale-90 dark:bg-slate-800 ${
        small ? "h-12 w-12 text-xl" : "h-16 w-16 text-2xl"
      } ${className}`}
    >
      {children}
    </button>
  );
}
