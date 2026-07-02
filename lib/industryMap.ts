// 證交所「產業別」是代碼(例如 "24"),這裡對應成中文名稱與代表 emoji(當卡片 Logo)。

interface Industry {
  name: string;
  emoji: string;
}

const INDUSTRY: Record<string, Industry> = {
  "01": { name: "水泥", emoji: "🏗️" },
  "02": { name: "食品", emoji: "🍜" },
  "03": { name: "塑膠", emoji: "🛢️" },
  "04": { name: "紡織纖維", emoji: "🧵" },
  "05": { name: "電機機械", emoji: "⚙️" },
  "06": { name: "電器電纜", emoji: "🔌" },
  "08": { name: "玻璃陶瓷", emoji: "🍶" },
  "09": { name: "造紙", emoji: "📄" },
  "10": { name: "鋼鐵", emoji: "🏭" },
  "11": { name: "橡膠", emoji: "🛞" },
  "12": { name: "汽車", emoji: "🚗" },
  "14": { name: "建材營造", emoji: "🏢" },
  "15": { name: "航運", emoji: "🚢" },
  "16": { name: "觀光餐旅", emoji: "🏨" },
  "17": { name: "金融保險", emoji: "🏦" },
  "18": { name: "貿易百貨", emoji: "🛍️" },
  "19": { name: "綜合", emoji: "🏢" },
  "20": { name: "其他", emoji: "🏢" },
  "21": { name: "化學", emoji: "⚗️" },
  "22": { name: "生技醫療", emoji: "💊" },
  "23": { name: "油電燃氣", emoji: "⚡" },
  "24": { name: "半導體", emoji: "💠" },
  "25": { name: "電腦及週邊", emoji: "💻" },
  "26": { name: "光電", emoji: "💡" },
  "27": { name: "通信網路", emoji: "📡" },
  "28": { name: "電子零組件", emoji: "🔧" },
  "29": { name: "電子通路", emoji: "🛒" },
  "30": { name: "資訊服務", emoji: "🖥️" },
  "31": { name: "其他電子", emoji: "📱" },
  "32": { name: "文化創意", emoji: "🎨" },
  "33": { name: "農業科技", emoji: "🌾" },
  "34": { name: "電子商務", emoji: "🛒" },
  "35": { name: "綠能環保", emoji: "♻️" },
  "36": { name: "數位雲端", emoji: "☁️" },
  "37": { name: "運動休閒", emoji: "🏅" },
  "38": { name: "居家生活", emoji: "🛋️" },
};

export function industryInfo(code: string): Industry {
  return INDUSTRY[code] ?? { name: "其他", emoji: "🏢" };
}
