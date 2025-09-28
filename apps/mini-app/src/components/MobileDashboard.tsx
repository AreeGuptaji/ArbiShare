"use client";

import { useState } from "react";
import {
  mockMiniAppUser,
  mockArbitrageStats,
  mockLPStats,
  mockRecentActivity,
  mockRateLimit,
  mockMarketData,
  mockLPPositions,
} from "@/lib/mockData";
import {
  formatCurrency,
  formatChange,
  formatCompactCurrency,
} from "@/lib/utils";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiSearch,
  FiZap,
  FiActivity,
  FiSettings,
  FiPieChart,
  FiBell,
} from "react-icons/fi";

type DashboardMode = "arbitrage" | "lp";

export function MobileDashboard() {
  const [activeMode, setActiveMode] = useState<DashboardMode>("arbitrage");
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isScanning, setIsScanning] = useState(false);
  const [showMEVAlert, setShowMEVAlert] = useState(false);

  const user = mockMiniAppUser;
  const arbitrageStats = mockArbitrageStats;
  const lpStats = mockLPStats;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with MEV-Share Branding */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-6 text-white">
        {/* App Title */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
              <span className="text-lg">⚡</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">MEV-Share</h1>
              <p className="text-xs text-blue-100">
                Democratizing MEV Extraction
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white/20 p-2">
              <FiBell className="h-4 w-4" />
            </div>
            <div className="rounded-full bg-white/20 p-2">
              <FiSettings className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{user.avatar}</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{user.name}</span>
                {user.worldIdVerified && (
                  <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-xs">
                    🌍 Verified
                  </span>
                )}
              </div>
              <div className="text-xl font-bold text-white">
                {formatCurrency(user.totalBalance)}
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-blue-100">
                  {formatChange(user.dailyChange)} today
                </span>
              </div>
            </div>
          </div>

          {/* Live Status Indicator */}
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-blue-100">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
              Live on Sepolia
            </div>
            <div className="text-xs text-blue-200">0x4444...00cc</div>
          </div>
        </div>

        {/* Enhanced Mode Selector */}
        <div className="mt-4 flex rounded-lg bg-white/10 p-1 backdrop-blur-sm">
          <button
            onClick={() => setActiveMode("arbitrage")}
            className={`flex-1 rounded-md py-3 text-sm font-medium transition-all ${
              activeMode === "arbitrage"
                ? "bg-white text-blue-600 shadow-lg"
                : "text-white/80 hover:text-white"
            }`}
          >
            ⚡ MEV Arbitrage
          </button>
          <button
            onClick={() => setActiveMode("lp")}
            className={`flex-1 rounded-md py-3 text-sm font-medium transition-all ${
              activeMode === "lp"
                ? "bg-white text-purple-600 shadow-lg"
                : "text-white/80 hover:text-white"
            }`}
          >
            💰 LP Revenue
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeMode === "arbitrage" ? (
          <ArbitrageView stats={arbitrageStats} />
        ) : (
          <LPView stats={lpStats} positions={mockLPPositions} />
        )}
      </div>

      {/* Enhanced Bottom Navigation */}
      <div className="fixed right-0 bottom-0 left-0 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="flex">
          {[
            { name: "Dashboard", icon: <FiActivity />, emoji: "📊" },
            { name: "Portfolio", icon: <FiPieChart />, emoji: "💼" },
            { name: "Leaderboard", icon: <FiTrendingUp />, emoji: "🏆" },
            { name: "Settings", icon: <FiSettings />, emoji: "⚙️" },
          ].map((tab) => {
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex-1 py-3 text-center transition-all ${
                  activeTab === tab.name
                    ? "scale-105 bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <div className="text-lg">{tab.emoji}</div>
                <div className="text-xs font-medium">{tab.name}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ArbitrageView({ stats }: { stats: typeof mockArbitrageStats }) {
  const rateLimit = mockRateLimit;
  const recentActivity = mockRecentActivity;
  const marketData = mockMarketData;

  return (
    <div className="space-y-4 pb-20">
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-white p-4">
          <div className="text-2xl font-bold text-gray-900">
            {stats.todaysOpportunities}
          </div>
          <div className="text-xs text-gray-600">
            Today&apos;s Opportunities
          </div>
          <div className="text-xs text-green-600">
            +{stats.opportunitiesChange}%
          </div>
        </div>

        <div className="rounded-lg bg-white p-4">
          <div className="text-2xl font-bold text-gray-900">
            {stats.successRate}%
          </div>
          <div className="text-xs text-gray-600">Success Rate</div>
          <div className="text-xs text-green-600">
            +{stats.successRateChange}%
          </div>
        </div>

        <div className="rounded-lg bg-white p-4">
          <div className="text-2xl font-bold text-gray-900">
            {formatCompactCurrency(stats.totalProfit)}
          </div>
          <div className="text-xs text-gray-600">Total Profit</div>
          <div className="text-xs text-green-600">+{stats.profitChange}%</div>
        </div>
      </div>

      {/* Enhanced Scan Button with Demo Interaction */}
      <button
        onClick={() => {
          setIsScanning(true);
          setTimeout(() => {
            setIsScanning(false);
            setShowMEVAlert(true);
            setTimeout(() => setShowMEVAlert(false), 5000);
          }, 2000);
        }}
        disabled={isScanning}
        className={`flex w-full items-center justify-center gap-3 rounded-xl py-5 font-semibold text-white shadow-lg transition-all ${
          isScanning
            ? "animate-pulse bg-gradient-to-r from-orange-500 to-red-500"
            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
        }`}
      >
        {isScanning ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            Scanning Cross-Chain Prices...
          </>
        ) : (
          <>
            <FiZap className="h-5 w-5" />
            🔍 Scan for MEV Opportunities
          </>
        )}
      </button>
      <div className="animate-bounce rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-4 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <span className="font-bold">MEV Opportunity Found!</span>
            </div>
            <div className="text-sm opacity-90">
              ETH → ARB Cross-Chain Arbitrage
            </div>
            <div className="text-lg font-bold">Expected Profit: $127.50</div>
          </div>
          <button className="rounded-lg bg-white/20 px-4 py-2 text-sm font-medium">
            Execute
          </button>
        </div>
      </div>

      {/* Rate Limit */}
      <div className="rounded-lg bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">Rate Limit</span>
          <span className="text-sm text-gray-600">
            {rateLimit.used}/{rateLimit.total} requests
          </span>
        </div>
        <div className="mb-2 h-2 rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-gray-600"
            style={{ width: `${(rateLimit.used / rateLimit.total) * 100}%` }}
          />
        </div>
        <div className="text-xs text-gray-600">
          Resets in {rateLimit.resetTime}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg bg-white p-4">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-full p-1 ${activity.success ? "bg-green-100" : "bg-red-100"}`}
                >
                  {activity.success ? (
                    <FiTrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <FiTrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {activity.pair} Arbitrage
                  </div>
                  <div className="text-xs text-gray-600">
                    {activity.timestamp}
                  </div>
                </div>
              </div>
              <div
                className={`font-semibold ${activity.success ? "text-green-600" : "text-red-600"}`}
              >
                {activity.success ? "+" : ""}
                {formatCurrency(activity.profit)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Market Data */}
      <div className="rounded-lg bg-gray-900 p-4 text-white">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm font-medium">Live Market Data</span>
          <FiZap className="h-4 w-4" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm">
              ETH: {formatCurrency(marketData.eth.price)}
            </span>
            <span
              className={`ml-2 text-sm ${marketData.eth.change >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              ({formatChange(marketData.eth.change)})
            </span>
          </div>
          <div>
            <span className="text-sm">
              BTC: {formatCurrency(marketData.btc.price)}
            </span>
            <span
              className={`ml-2 text-sm ${marketData.btc.change >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              ({formatChange(marketData.btc.change)})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LPView({
  stats,
  positions,
}: {
  stats: typeof mockLPStats;
  positions: typeof mockLPPositions;
}) {
  return (
    <div className="space-y-4 pb-20">
      {/* LP Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-white p-4">
          <div className="text-xl font-bold text-gray-900">
            {formatCompactCurrency(stats.totalLPValue)}
          </div>
          <div className="text-xs text-gray-600">Total LP Value</div>
        </div>

        <div className="rounded-lg bg-white p-4">
          <div className="text-xl font-bold text-gray-900">
            {stats.currentAPY}%
          </div>
          <div className="text-xs text-gray-600">Current APY</div>
        </div>

        <div className="rounded-lg bg-white p-4">
          <div className="text-xl font-bold text-gray-900">
            {formatCurrency(stats.rewardsEarned)}
          </div>
          <div className="text-xs text-gray-600">Rewards Earned</div>
        </div>

        <div className="rounded-lg bg-white p-4">
          <div className="text-xl font-bold text-gray-900">
            {stats.activePools}
          </div>
          <div className="text-xs text-gray-600">Active Pools</div>
        </div>
      </div>

      {/* 24h Yield Performance */}
      <div className="rounded-lg bg-white p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">
            24h Yield Performance
          </span>
          <span className="font-semibold text-green-600">
            +{formatCurrency(stats.dailyYield)}
          </span>
        </div>
      </div>

      {/* Active LP Positions */}
      <div className="rounded-lg bg-white p-4">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Active LP Positions
        </h3>
        <div className="space-y-4">
          {positions.map((position) => (
            <div
              key={position.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                  <span className="text-xs">💰</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {position.pair}
                  </div>
                  <div className="text-xs text-gray-600">
                    {position.protocol} • {position.fee} Fee
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {formatCurrency(position.value)}
                </div>
                <div className="text-xs text-green-600">
                  +{formatCurrency(position.dailyEarnings)} today
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Claimable Rewards */}
      <div className="rounded-lg bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎁</span>
            <span className="font-medium text-gray-900">Claimable Rewards</span>
          </div>
          <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white">
            Claim All
          </button>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Trading Fees</span>
            <span className="font-semibold">{formatCurrency(156.43)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Liquidity Mining</span>
            <span className="font-semibold">{formatCurrency(91.4)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="flex-1 rounded-lg border border-gray-300 py-3 text-center font-medium text-gray-900">
          <span className="mr-2 text-lg">+</span>
          Add Liquidity
        </button>
        <button className="flex-1 rounded-lg border border-gray-300 py-3 text-center font-medium text-gray-900">
          <span className="mr-2 text-lg">−</span>
          Remove Liquidity
        </button>
      </div>
    </div>
  );
}
