import "@/styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";
import { Providers } from "@/components/Providers";
import { type Metadata } from "next";
import { Geist } from "next/font/google";

export const metadata: Metadata = {
  title: "FlashArb - Cross-Chain Flash Loan Arbitrage",
  description:
    "Democratizing MEV extraction for verified humans through World ID",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <MiniKitProvider>
          <Providers>
            {/* <MiniKitProvider>{children}</MiniKitProvider> */}
            {children}
          </Providers>
        </MiniKitProvider>
      </body>
    </html>
  );
}
