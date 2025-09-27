"use client";

import { useState } from "react";
import { MobileDashboard } from "@/components/MobileDashboard";
import { WorldIDVerify } from "@/components/WorldIDVerify";
import { isMiniApp } from "@/utils/miniapp.utils";

export default function MiniAppPage() {
  const [isVerified, setIsVerified] = useState(false);
  const inMiniApp = isMiniApp();

  // For demo purposes, you can toggle this to test different states
  const showVerificationFlow = !isVerified;

  if (showVerificationFlow) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-sm">
          {inMiniApp && (
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-black px-3 py-1 text-sm text-white">
                🌍 <span className="font-medium">Worldcoin Mini App</span>
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <span className="text-2xl">⚡</span>
              </div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
                FlashArb
              </h1>
              <p className="text-sm text-gray-600">
                Sybil-resistant arbitrage trading for verified humans
              </p>
            </div>

            <WorldIDVerify />

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Powered by World ID verification
              </p>
            </div>

            {/* Demo Button - Remove in production */}
            <button
              onClick={() => setIsVerified(true)}
              className="mt-4 w-full rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-600"
            >
              Skip Verification (Demo)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <MobileDashboard />;
}
