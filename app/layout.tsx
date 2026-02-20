import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

/** 日本語フォント */
const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ランダムカレー生成器 🍛",
  description:
    "毎回違うカレーが完成する！ランダムカレー生成器。食材を選んでカレーを作ろう！",
  openGraph: {
    title: "ランダムカレー生成器 🍛",
    description: "毎回違うカレーが完成する！ランダムカレー生成器",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} antialiased`}>{children}</body>
    </html>
  );
}
