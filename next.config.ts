import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // 明確指定專案根目錄,避免 Next.js 誤把上層資料夾的 lockfile 當成 workspace 根
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
