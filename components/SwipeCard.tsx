"use client";

// 單張可滑動的卡片。用 framer-motion 做拖曳、旋轉、飛出動畫。
// 透過 ref 對外開放 swipe() 方法,讓下方按鈕也能觸發滑卡。

import {
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimationControls,
  type PanInfo,
} from "framer-motion";
import type { Company, SwipeAction } from "@/lib/types";
import StockCardFront from "./StockCardFront";

/** 對外開放的操作介面 */
export interface SwipeCardHandle {
  swipe: (action: SwipeAction) => void;
}

interface Props {
  company: Company;
  /** 拖曳/按鈕造成滑卡完成後呼叫 */
  onSwipe: (action: SwipeAction) => void;
  /** 點卡片(非拖曳)看詳情 */
  onTap: () => void;
}

// 超過這個水平距離就算「滑出去」
const SWIPE_THRESHOLD = 120;

const SwipeCard = forwardRef<SwipeCardHandle, Props>(function SwipeCard(
  { company, onSwipe, onTap },
  ref
) {
  const controls = useAnimationControls();
  const x = useMotionValue(0);
  const dragged = useRef(false); // 區分「拖曳」與「點擊」

  // 依水平位移旋轉卡片,做出手感
  const rotate = useTransform(x, [-200, 200], [-16, 16]);
  // LIKE / NOPE 印章的透明度
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -120], [0, 1]);

  // 讓卡片飛出畫面,動畫結束後回報結果
  async function flyOut(action: SwipeAction) {
    const toX =
      action === "pass" ? -window.innerWidth : action === "like" ? window.innerWidth : 0;
    const toY = action === "super" ? -window.innerHeight : 0;
    await controls.start({
      x: toX,
      y: toY,
      opacity: 0,
      transition: { duration: 0.35, ease: "easeOut" },
    });
    onSwipe(action);
  }

  // 對外開放:按鈕呼叫這個
  useImperativeHandle(ref, () => ({ swipe: (action) => flyOut(action) }));

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) {
      flyOut("like");
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      flyOut("pass");
    } else {
      // 沒滑到門檻,彈回中間
      controls.start({ x: 0, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } });
    }
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab touch-none overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl active:cursor-grabbing"
      style={{ x, rotate }}
      animate={controls}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragStart={() => (dragged.current = true)}
      onDragEnd={handleDragEnd}
      onTap={() => {
        // 拖曳後放開會觸發 tap,用旗標擋掉,只有真正點擊才看詳情
        if (dragged.current) {
          dragged.current = false;
          return;
        }
        onTap();
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* LIKE 印章 */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="pointer-events-none absolute left-6 top-8 z-10 -rotate-12 rounded-lg border-4 border-green-400 px-4 py-1 text-2xl font-black text-green-400"
      >
        LIKE
      </motion.div>
      {/* NOPE 印章 */}
      <motion.div
        style={{ opacity: nopeOpacity }}
        className="pointer-events-none absolute right-6 top-8 z-10 rotate-12 rounded-lg border-4 border-red-400 px-4 py-1 text-2xl font-black text-red-400"
      >
        NOPE
      </motion.div>

      <StockCardFront company={company} />
    </motion.div>
  );
});

export default SwipeCard;
