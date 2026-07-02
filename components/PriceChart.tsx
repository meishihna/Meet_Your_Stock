// 用 SVG 把股價走勢畫成折線圖。上漲用綠色、下跌用紅色。
// 無外部圖表套件,純 SVG,輕量又好懂。

import type { PricePoint } from "@/lib/types";

interface Props {
  data: PricePoint[];
  width?: number;
  height?: number;
  className?: string;
}

export default function PriceChart({
  data,
  width = 300,
  height = 80,
  className,
}: Props) {
  if (data.length === 0) return null;

  const closes = data.map((d) => d.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;

  // 把每個資料點換算成 SVG 座標
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.close - min) / range) * height;
    return { x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  // 折線下方的漸層填色路徑
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  const isUp = closes[closes.length - 1] >= closes[0];
  const color = isUp ? "#16a34a" : "#dc2626"; // 綠 / 紅
  const gradientId = `grad-${isUp ? "up" : "down"}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      className={className}
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
      />
    </svg>
  );
}
