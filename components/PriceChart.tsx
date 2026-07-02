// 用 SVG 把股價走勢畫成折線圖。上漲用綠色、下跌用紅色。
// 圖表會「填滿它的容器」——由父層決定高度(所以父層必須有高度)。

import type { PricePoint } from "@/lib/types";

// 內部座標系(path 用):實際顯示大小由容器決定,preserveAspectRatio="none" 會拉伸填滿
const W = 300;
const H = 100;

export default function PriceChart({
  data,
  className,
}: {
  data: PricePoint[];
  className?: string;
}) {
  if (data.length < 2) return null;

  const closes = data.map((d) => d.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;

  // 上下各留 8% 邊界,線才不會貼到頂/底
  const pad = H * 0.08;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - pad - ((d.close - min) / range) * (H - pad * 2);
    return { x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L ${W} ${H} L 0 ${H} Z`;

  const isUp = closes[closes.length - 1] >= closes[0];
  const color = isUp ? "#16a34a" : "#dc2626"; // 綠 / 紅
  const gradientId = `grad-${isUp ? "up" : "down"}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={`h-full w-full ${className ?? ""}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke" // 拉伸時線寬維持一致,不會變粗
      />
    </svg>
  );
}
