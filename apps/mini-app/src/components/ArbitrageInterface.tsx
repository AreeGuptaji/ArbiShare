"use client";

import { useState } from "react";
import { formatCurrency, formatChange } from "@/lib/utils";
import { FiZap, FiClock, FiTrendingUp } from "react-icons/fi";

interface ArbitrageOpportunity {
  id: string;
  pair: string;
  profit: number;
  profitPercent: number;
  gasEstimate: number;
  dexA: string;
  dexB: string;
  timeLeft: string;
  priceA: number;
  priceB: number;
}

const mockOpportunities: ArbitrageOpportunity[] = [
  {
    id: "1",
    pair: "ETH/USDC",
    profit: 234.56,
    profitPercent: 3.2,
    gasEstimate: 18,
    dexA: "Uniswap V3",
    dexB: "Curve",
    timeLeft: "2:45",
    priceA: 3247.82,
    priceB: 3151.26,
  },
  {
    id: "2",
    pair: "WBTC/ETH",
    profit: 187.43,
    profitPercent: 2.8,
    gasEstimate: 22,
    dexA: "SushiSwap",
    dexB: "Balancer",
    timeLeft: "4:12",
    priceA: 20.67,
    priceB: 20.09,
  },
];

export function ArbitrageInterface() {
  const [executingId, setExecutingId] = useState<string | null>(null);

  const handleExecute = async (opportunityId: string) => {
    setExecutingId(opportunityId);

    // TODO: Implement actual arbitrage execution
    // - Connect to smart contracts
    // - Execute flash loan arbitrage
    // - Handle success/failure states

    // Simulate execution
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setExecutingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Live Opportunities
        </h2>
        <div className="flex items-center gap-1 text-sm text-green-600">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-600" />
          Live
        </div>
      </div>

      <div className="space-y-3">
        {mockOpportunities.map((opportunity) => (
          <div
            key={opportunity.id}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">
                  {opportunity.pair}
                </span>
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                  Base
                </span>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600">
                  +{formatChange(opportunity.profitPercent / 100)}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <FiClock className="h-3 w-3" />
                  {opportunity.timeLeft}
                </div>
              </div>
            </div>

            <div className="mb-3 flex items-center justify-between text-sm">
              <div>
                <div className="text-gray-600">{opportunity.dexA}</div>
                <div className="font-medium">
                  {formatCurrency(opportunity.priceA)}
                </div>
              </div>
              <FiTrendingUp className="h-4 w-4 text-gray-400" />
              <div className="text-right">
                <div className="text-gray-600">{opportunity.dexB}</div>
                <div className="font-medium">
                  {formatCurrency(opportunity.priceB)}
                </div>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-gray-600">Est. Profit:</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(opportunity.profit)}
              </span>
            </div>

            <button
              onClick={() => handleExecute(opportunity.id)}
              disabled={executingId === opportunity.id}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-colors hover:bg-green-700 disabled:bg-gray-400"
            >
              {executingId === opportunity.id ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Executing...
                </>
              ) : (
                <>
                  <FiZap className="h-4 w-4" />
                  Execute Arbitrage
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="py-4 text-center">
        <p className="text-sm text-gray-500">
          Scanning for new opportunities...
        </p>
      </div>
    </div>
  );
}
