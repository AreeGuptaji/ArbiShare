"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import {
  MiniKit,
  type VerifyCommandInput,
  VerificationLevel,
  type ISuccessResult,
} from "@worldcoin/minikit-js";
import {
  mockMiniAppUser,
  mockArbitrageStats,
  mockLPStats,
  mockLPPositions,
} from "@/lib/mockData";
import { formatCurrency } from "@/lib/utils";
import {
  ScanningFlowScreens,
  type ScanningState,
  type OpportunityData,
} from "./ScanningScreens";
import {
  FiTrendingUp,
  FiZap,
  FiActivity,
  FiSearch,
  FiClock,
  FiUsers,
} from "react-icons/fi";

type DashboardMode = "arbitrage" | "lp";

export function MobileDashboard() {
  const [activeMode] = useState<DashboardMode>("arbitrage");
  const [activeTab, setActiveTab] = useState("Dashboard");

  const { isConnected, usdBalance, isLoading } = useWalletBalance();
  const user = mockMiniAppUser;
  const arbitrageStats = mockArbitrageStats;
  const lpStats = mockLPStats;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* User Header */}
      <div className="bg-white px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
              <span className="text-xl">{user.avatar}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{user.name}</span>
                {user.worldIdVerified && (
                  <span className="flex items-center gap-1 rounded-full bg-black px-2 py-1 text-xs text-white">
                    🌍 World ID
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-600">Verified</span>
            </div>
          </div>

          {/* Balance */}
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {isConnected ? (
                isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"></div>
                    Loading...
                  </div>
                ) : (
                  formatCurrency(usdBalance)
                )
              ) : (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button
                      onClick={openConnectModal}
                      className="text-sm underline hover:no-underline"
                    >
                      Connect Wallet
                    </button>
                  )}
                </ConnectButton.Custom>
              )}
            </div>
            <div className="text-sm text-green-600">+2.3% today</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "Dashboard" && activeMode === "arbitrage" && (
          <ArbitrageView stats={arbitrageStats} />
        )}
        {activeTab === "Portfolio" && (
          <LPView stats={lpStats} positions={mockLPPositions} />
        )}
        {activeTab === "Leaderboard" && <LeaderboardView />}
        {activeTab === "Settings" && <SettingsView />}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed right-0 bottom-0 left-0 border-t border-gray-200 bg-white">
        <div className="flex">
          {[
            { name: "Dashboard", emoji: "📊" },
            { name: "Portfolio", emoji: "💼" },
            { name: "Leaderboard", emoji: "🏆" },
            { name: "Settings", emoji: "⚙️" },
          ].map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex-1 py-3 text-center transition-all ${
                activeTab === tab.name ? "text-gray-900" : "text-gray-400"
              }`}
            >
              <div className="text-lg">{tab.emoji}</div>
              <div className="text-xs font-medium">{tab.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArbitrageView({
  stats: _stats,
}: {
  stats: typeof mockArbitrageStats;
}) {
  const [isVerified, setIsVerified] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [scanningState, setScanningState] = useState<ScanningState>("idle");
  const [opportunityData, setOpportunityData] =
    useState<OpportunityData | null>(null);

  // Mock data for demonstration
  const mockOpportunity: OpportunityData = {
    profit: 127.84,
    profitPercentage: 2.34,
    sourceChain: "Ethereum",
    destinationChain: "Polygon",
    tokenPair: {
      token1: { symbol: "ETH", amount: "5.0", value: "$14,236.60" },
      token2: { symbol: "USDC", amount: "14,364.44", value: "$14,364.44" },
    },
    gasCosts: 23.45,
    executionTime: 45,
    riskLevel: "Low",
    successRate: 94.2,
    strategy:
      "This arbitrage opportunity leverages price differences between Uniswap V3 on Ethereum and QuickSwap on Polygon. The strategy involves flash borrowing ETH, swapping for USDC on Ethereum, bridging to Polygon, swapping back to ETH, and repaying the loan.",
    keyFactors: [
      "Bridge fees: ~$8.20",
      "Slippage tolerance: 0.5%",
      "MEV protection: Enabled",
    ],
  };

  const handleStartScanning = () => {
    if (!isVerified) {
      setShowVerification(true);
      return;
    }

    setScanningState("scanning");

    // Simulate scanning process
    setTimeout(() => {
      // Randomly choose between finding opportunity or no opportunities
      const foundOpportunity = Math.random() > 0.3; // 70% chance of finding opportunity

      if (foundOpportunity) {
        setOpportunityData(mockOpportunity);
        setScanningState("opportunity-found");
      } else {
        setScanningState("no-opportunities");
      }
    }, 8000); // 8 second scanning simulation
  };

  const handleBackToIdle = () => {
    setScanningState("idle");
    setOpportunityData(null);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">24</div>
          <div className="text-xs text-gray-600">
            Today&apos;s Opportunities
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">94.2%</div>
          <div className="text-xs text-gray-600">Success Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">$3,247</div>
          <div className="text-xs text-gray-600">Total Profit</div>
        </div>
      </div>

      {/* Scan Button */}
      <button
        onClick={handleStartScanning}
        disabled={scanningState !== "idle"}
        className="flex w-full items-center justify-center gap-3 rounded-xl bg-slate-800 px-6 py-4 text-lg font-medium text-white transition-all hover:bg-slate-700 disabled:opacity-50"
      >
        <FiSearch className="h-5 w-5" />
        {isVerified ? "Scan for Opportunities" : "Verify with World ID to Scan"}
      </button>

      {/* World ID Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 z-50 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h2 className="text-lg font-semibold text-gray-900">
              World ID Verification
            </h2>
            <button
              onClick={() => setShowVerification(false)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            >
              ✕
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex h-[calc(100vh-64px)] flex-col overflow-y-auto bg-gray-50">
            {/* Hero Section */}
            <div className="px-6 pt-8 pb-6 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-800">
                <span className="text-3xl">🌍</span>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Verification Required
              </h3>
              <p className="text-gray-600">
                Verify your humanity to access MEV opportunities and prevent bot
                exploitation
              </p>
            </div>

            {/* Benefits Section */}
            <div className="flex-1 space-y-4 px-6">
              <div className="rounded-xl border border-gray-100 bg-white p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <FiUsers className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="mb-1 font-semibold text-gray-900">
                      Fair Access
                    </h4>
                    <p className="text-sm text-gray-600">
                      Each verified user gets equal access to profitable
                      arbitrage opportunities
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                    <FiZap className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="mb-1 font-semibold text-gray-900">
                      No Bot Competition
                    </h4>
                    <p className="text-sm text-gray-600">
                      Human verification prevents automated bots from
                      monopolizing trades
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                    <FiActivity className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="mb-1 font-semibold text-gray-900">
                      Secure & Anonymous
                    </h4>
                    <p className="text-sm text-gray-600">
                      World ID verification is private - no personal data is
                      stored
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6">
              <button
                onClick={async () => {
                  if (!MiniKit.isInstalled()) {
                    // Fallback for demo
                    setIsVerified(true);
                    setShowVerification(false);
                    return;
                  }

                  setIsVerifying(true);

                  try {
                    const verifyPayload: VerifyCommandInput = {
                      action: "scan-opportunities",
                      verification_level: VerificationLevel.Device,
                    };

                    const { finalPayload } =
                      await MiniKit.commandsAsync.verify(verifyPayload);

                    if (finalPayload.status === "error") {
                      console.log("Error payload from MiniKit:", finalPayload);
                      return;
                    }

                    // Verify the proof in the backend
                    const verifyResponse = await fetch("/api/verify-proof", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        payload: finalPayload as ISuccessResult,
                        action: "scan-opportunities",
                      }),
                    });

                    if (verifyResponse.ok) {
                      setIsVerified(true);
                      setShowVerification(false);
                    }
                  } catch (error) {
                    console.error("Verification failed:", error);
                    // Fallback for demo
                    setIsVerified(true);
                    setShowVerification(false);
                  } finally {
                    setIsVerifying(false);
                  }
                }}
                disabled={isVerifying}
                className="mb-3 flex w-full items-center justify-center gap-3 rounded-xl bg-slate-800 px-6 py-4 text-lg font-medium text-white transition-all hover:bg-slate-700 disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <span className="text-xl">🌍</span>
                    Verify with World ID
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsVerified(true);
                  setShowVerification(false);
                }}
                className="mb-2 w-full rounded-lg bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700"
              >
                Demo Mode (Skip Verification)
              </button>

              <p className="text-center text-xs text-gray-500">
                Powered by Worldcoin
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Scanning Flow Screens */}
      {scanningState !== "idle" && (
        <ScanningFlowScreens
          scanningState={scanningState}
          setScanningState={setScanningState}
          opportunityData={opportunityData}
          onBack={handleBackToIdle}
        />
      )}

      {/* Rate Limit */}
      <div className="rounded-lg bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiClock className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">
              Rate Limit
            </span>
          </div>
          <span className="text-sm text-gray-600">47/50 requests</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-slate-800"
            style={{ width: "94%" }}
          ></div>
        </div>
      </div>

      {/* Live Market Data */}
      <div className="rounded-lg bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <FiActivity className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">
            Live Market Data
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">ETH/USDC:</span>
            <div className="text-right">
              <span className="font-medium">$2,847.32</span>
              <span className="ml-2 text-sm text-green-600">+1.2%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">BTC/USDT:</span>
            <div className="text-right">
              <span className="font-medium">$67,234</span>
              <span className="ml-2 text-sm text-red-600">-0.8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg bg-white p-4">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Recent Activity
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <FiTrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  Arbitrage Executed
                </div>
                <div className="text-xs text-gray-600">
                  ETH/USDC - Uniswap → Sushiswap
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-green-600">+$127.43</div>
              <div className="text-xs text-gray-600">2 min ago</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                <FiSearch className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  Opportunity Scanned
                </div>
                <div className="text-xs text-gray-600">
                  WBTC/USDT - 3 pools analyzed
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-600">No profit</div>
              <div className="text-xs text-gray-600">5 min ago</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <FiTrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  Flash Loan Success
                </div>
                <div className="text-xs text-gray-600">
                  DAI/USDC - Compound → Aave
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-green-600">+$89.21</div>
              <div className="text-xs text-gray-600">12 min ago</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed right-4 bottom-20">
        <button className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-white shadow-lg">
          <FiZap className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

function LPView({
  stats: _stats,
  positions: _positions,
}: {
  stats: typeof mockLPStats;
  positions: typeof mockLPPositions;
}) {
  return (
    <div className="space-y-4 pb-20">
      {/* Mode Selector */}
      <div className="flex rounded-lg bg-gray-100 p-1">
        <button className="flex-1 rounded-md py-2 text-sm font-medium text-gray-600">
          Arbitrage
        </button>
        <button className="flex-1 rounded-md bg-white py-2 text-sm font-medium text-gray-900 shadow-sm">
          LP Mode
        </button>
      </div>

      {/* LP Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">$8,432.10</div>
          <div className="text-xs text-gray-600">Total LP Value</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">12.4%</div>
          <div className="text-xs text-gray-600">Current APY</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">$247.83</div>
          <div className="text-xs text-gray-600">Rewards Earned</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">5</div>
          <div className="text-xs text-gray-600">Active Pools</div>
        </div>
      </div>

      {/* 24h Yield Performance */}
      <div className="rounded-lg bg-white p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">
            24h Yield Performance
          </span>
          <span className="font-semibold text-green-600">+$34.21</span>
        </div>
      </div>

      {/* Active LP Positions */}
      <div className="rounded-lg bg-white p-4">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Active LP Positions
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                <span className="text-xs">💰</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">ETH/USDC</div>
                <div className="text-xs text-gray-600">
                  Uniswap V3 • 0.3% Fee
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">$3,247.50</div>
              <div className="text-xs text-green-600">+$12.43 today</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                <span className="text-xs">💰</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">WBTC/ETH</div>
                <div className="text-xs text-gray-600">
                  SushiSwap • 0.25% Fee
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">$2,184.60</div>
              <div className="text-xs text-green-600">+$8.92 today</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                <span className="text-xs">💰</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">DAI/USDC</div>
                <div className="text-xs text-gray-600">Curve • Stable Pool</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">$3,000.00</div>
              <div className="text-xs text-green-600">+$13.86 today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Claimable Rewards */}
      <div className="rounded-lg bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎁</span>
            <span className="font-medium text-gray-900">Claimable Rewards</span>
          </div>
          <button className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white">
            Claim All
          </button>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Trading Fees</span>
            <span className="font-semibold">$156.43</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Liquidity Mining</span>
            <span className="font-semibold">$91.40</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 text-center font-medium text-gray-900">
          <span className="text-lg">+</span>
          Add Liquidity
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 text-center font-medium text-gray-900">
          <span className="text-lg">−</span>
          Remove Liquidity
        </button>
      </div>

      {/* Floating Action Button */}
      <div className="fixed right-4 bottom-20">
        <button className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-white shadow-lg">
          <span className="text-xl">+</span>
        </button>
      </div>
    </div>
  );
}

function LeaderboardView() {
  return (
    <div className="space-y-4 pb-20">
      <div className="rounded-lg bg-white p-4">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Leaderboard
        </h3>
        <p className="text-center text-gray-600">Coming soon...</p>
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="space-y-4 pb-20">
      <div className="rounded-lg bg-white p-4">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Settings</h3>
        <p className="text-center text-gray-600">Coming soon...</p>
      </div>
    </div>
  );
}
