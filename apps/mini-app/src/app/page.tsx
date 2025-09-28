"use client";

import { useState } from "react";
import { MobileDashboard } from "@/components/MobileDashboard";
import { WorldIDVerify } from "@/components/WorldIDVerify";
import { WalletConnect } from "@/components/WalletConnect";
import { LandingPage } from "@/components/LandingPage";
import { isMiniApp } from "@/utils/miniapp.utils";

export default function MEVShareApp() {
  const [isVerified, setIsVerified] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const inMiniApp = isMiniApp();

  // If user is not in the World ID mini-app, show the landing page
  if (!inMiniApp) {
    return <LandingPage />;
  }

  // If in mini-app but not verified, show verification flow
  if (!isVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-black px-3 py-1 text-sm text-white">
              🌍 <span className="font-medium">Worldcoin Mini App</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <span className="text-2xl">⚡</span>
              </div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
                <span className="text-blue-600">Flash</span>Arb
              </h1>
              <p className="text-sm text-gray-600">
                Cross-chain flash loan arbitrage for verified humans
              </p>
              <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-500">
                <span className="rounded bg-green-100 px-2 py-1 text-green-700">
                  ✅ Deployed
                </span>
                <span className="rounded bg-blue-100 px-2 py-1 text-blue-700">
                  🌍 8 Chains
                </span>
              </div>
            </div>

            <WorldIDVerify onVerified={() => setIsVerified(true)} />

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Powered by World ID verification
              </p>
            </div>

            {/* Demo Button - Enhanced for presentation */}
            <button
              onClick={() => setIsVerified(true)}
              className="mt-4 w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-sm font-medium text-white shadow-lg transition-all hover:from-blue-600 hover:to-purple-700"
            >
              🚀 Enter Demo Mode
            </button>
            <p className="mt-2 text-xs text-gray-400">
              Skip World ID for hackathon demo
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If verified but wallet not connected, show wallet connection
  if (isVerified && !walletAddress) {
    return <WalletConnect onConnected={setWalletAddress} />;
  }

  // If verified and wallet connected, show the mobile dashboard
  return <MobileDashboard />;
}
