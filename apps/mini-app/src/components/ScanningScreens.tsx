"use client";

import { useState, useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  FiArrowLeft,
  FiX,
  FiPause,
  FiPlay,
  FiSearch,
  FiBarChart,
  FiClock,
  FiBell,
  FiShare,
  FiChevronDown,
  FiCopy,
  FiExternalLink,
  FiCheck,
  FiAlertTriangle,
  FiZap,
  FiTrendingUp,
} from "react-icons/fi";

export type ScanningState =
  | "idle"
  | "scanning"
  | "no-opportunities"
  | "opportunity-found"
  | "executing-trade"
  | "trade-complete"
  | "trade-failed";

export interface OpportunityData {
  profit: number;
  profitPercentage: number;
  sourceChain: string;
  destinationChain: string;
  tokenPair: {
    token1: { symbol: string; amount: string; value: string };
    token2: { symbol: string; amount: string; value: string };
  };
  gasCosts: number;
  executionTime: number;
  riskLevel: "Low" | "Medium" | "High";
  successRate: number;
  strategy: string;
  keyFactors: string[];
}

interface NetworkProgress {
  name: string;
  icon: string;
  progress: number;
  poolsScanned: number;
}

interface ScanningFlowScreensProps {
  scanningState: ScanningState;
  setScanningState: (state: ScanningState) => void;
  opportunityData: OpportunityData | null;
  onBack: () => void;
}

export function ScanningFlowScreens({
  scanningState,
  setScanningState,
  opportunityData,
  onBack,
}: ScanningFlowScreensProps) {
  return (
    <div className="fixed inset-0 z-50 bg-gray-50">
      {scanningState === "scanning" && (
        <OpportunityScannerScreen onBack={onBack} />
      )}
      {scanningState === "no-opportunities" && (
        <NoOpportunitiesScreen
          onBack={onBack}
          onScanAgain={() => setScanningState("scanning")}
        />
      )}
      {scanningState === "opportunity-found" && opportunityData && (
        <ArbitrageOpportunityScreen
          data={opportunityData}
          onBack={onBack}
          onExecute={() => setScanningState("executing-trade")}
        />
      )}
      {scanningState === "executing-trade" && opportunityData && (
        <ExecutingTradeScreen
          data={opportunityData}
          onComplete={() => setScanningState("trade-complete")}
          onFailed={() => setScanningState("trade-failed")}
        />
      )}
      {scanningState === "trade-complete" && opportunityData && (
        <TradeCompleteScreen
          data={opportunityData}
          onFindNext={() => setScanningState("scanning")}
          onBack={onBack}
        />
      )}
      {scanningState === "trade-failed" && (
        <TransactionFailedScreen
          onScanAgain={() => setScanningState("scanning")}
          onBack={onBack}
        />
      )}
    </div>
  );
}

function OpportunityScannerScreen({ onBack }: { onBack: () => void }) {
  const [scanProgress, setScanProgress] = useState(0);
  const [networksProgress, setNetworksProgress] = useState<NetworkProgress[]>([
    { name: "Ethereum", icon: "⟠", progress: 0, poolsScanned: 0 },
    { name: "Polygon", icon: "⬟", progress: 0, poolsScanned: 0 },
    { name: "Arbitrum", icon: "🔵", progress: 0, poolsScanned: 0 },
  ]);
  const [totalPoolsScanned, setTotalPoolsScanned] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setScanProgress((prev) => Math.min(prev + 1, 100));
      setTimeElapsed((prev) => prev + 1);

      setNetworksProgress((prev) =>
        prev.map((network) => ({
          ...network,
          progress: Math.min(network.progress + Math.random() * 3, 100),
          poolsScanned: Math.floor(
            network.progress *
              (network.name === "Ethereum"
                ? 8.47
                : network.name === "Polygon"
                  ? 2.34
                  : 1.56),
          ),
        })),
      );

      setTotalPoolsScanned((prev) => prev + Math.floor(Math.random() * 15) + 5);
    }, 200);

    return () => clearInterval(interval);
  }, [isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, "0")}s`;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            Opportunity Scanner
          </h2>
        </div>
        <button
          onClick={onBack}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Status */}
        <div className="mb-6 text-center">
          <div className="mb-2 text-sm text-gray-600">
            🟢 Live scanning - {totalPoolsScanned.toLocaleString()} pools
            analyzed
          </div>
        </div>

        {/* Scanning Animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <DotLottieReact
              src="/lottiFiles/searching.json"
              loop
              autoplay
              style={{ width: 120, height: 120 }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full border-4 border-gray-200">
                <div
                  className="h-full rounded-full bg-slate-800 transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="mb-2 text-center">
          <h3 className="text-xl font-semibold text-gray-900">
            Scanning Cross-Chain Opportunities...
          </h3>
          <p className="text-gray-600">
            Analyzing liquidity pools across networks
          </p>
        </div>

        {/* Progress Section */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">
              Scanning Progress
            </span>
            <span className="text-sm text-gray-600">
              ETA: {formatTime(134 - timeElapsed)}
            </span>
          </div>

          <div className="space-y-4">
            {networksProgress.map((network) => (
              <div key={network.name} className="flex items-center gap-4">
                <div className="flex w-24 items-center gap-2">
                  <span className="text-lg">{network.icon}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {network.name}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      Scanning {network.poolsScanned} pools
                    </span>
                    <span className="text-xs font-medium text-gray-900">
                      {Math.round(network.progress)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-slate-800 transition-all duration-300"
                      style={{ width: `${network.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-Time Data Feeds */}
        <div className="mb-6">
          <h4 className="mb-4 text-sm font-medium text-gray-900">
            Real-Time Data Feeds
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-white p-3">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    ETH/USDC Pool
                  </div>
                  <div className="text-xs text-gray-600">
                    Uniswap V3 • $2,847.32
                  </div>
                </div>
              </div>
              <span className="text-sm font-medium text-green-600">
                +0.12% spread
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-white p-3">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    WBTC/USDT Pool
                  </div>
                  <div className="text-xs text-gray-600">
                    Sushiswap • $67,234.21
                  </div>
                </div>
              </div>
              <span className="text-sm font-medium text-green-600">
                +0.08% spread
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-white p-3">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    MATIC/USDC Pool
                  </div>
                  <div className="text-xs text-gray-600">
                    QuickSwap • $0.8947
                  </div>
                </div>
              </div>
              <span className="text-sm font-medium text-green-600">
                +0.15% spread
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 border-t border-gray-200 bg-white p-4">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 text-gray-700 hover:bg-gray-50"
        >
          {isPaused ? (
            <FiPlay className="h-4 w-4" />
          ) : (
            <FiPause className="h-4 w-4" />
          )}
          {isPaused ? "Resume Scan" : "Pause Scan"}
        </button>

        <button
          onClick={onBack}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 text-gray-700 hover:bg-gray-50"
        >
          <FiX className="h-4 w-4" />
          Cancel Scan
        </button>

        <div className="text-center text-xs text-gray-500">
          Blockchain Network
          <br />
          Cross-chain analysis active
        </div>
      </div>
    </div>
  );
}

function NoOpportunitiesScreen({
  onBack,
  onScanAgain,
}: {
  onBack: () => void;
  onScanAgain: () => void;
}) {
  const [countdown, setCountdown] = useState(2872); // 47:32 in seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <button
          onClick={onBack}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <button
          onClick={onBack}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Search Icon with Animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200">
              <FiSearch className="h-10 w-10 text-gray-400" />
            </div>
            {/* Animated dots */}
            <div className="absolute -top-2 -right-2 flex space-x-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400"></div>
              <div
                className="h-2 w-2 animate-pulse rounded-full bg-gray-400"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="h-2 w-2 animate-pulse rounded-full bg-gray-400"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="mb-6 text-center">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">
            No Profitable Opportunities
          </h2>
          <p className="text-gray-600">
            Market conditions are currently unfavorable for cross-chain
            arbitrage opportunities.
          </p>
        </div>

        {/* Market Insight */}
        <div className="mb-6 rounded-xl border border-gray-100 bg-white p-4">
          <div className="flex items-start gap-3">
            <FiBarChart className="mt-1 h-5 w-5 text-blue-600" />
            <div>
              <h3 className="mb-2 font-semibold text-gray-900">
                Market Insight
              </h3>
              <p className="text-sm text-gray-600">
                Competition is high right now. Most arbitrage opportunities are
                being captured by MEV bots within seconds.
              </p>
            </div>
          </div>
        </div>

        {/* Suggested Wait Time */}
        <div className="mb-6 rounded-xl border border-gray-100 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiClock className="h-5 w-5 text-gray-600" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  Suggested Wait Time
                </h3>
                <p className="text-sm text-gray-600">
                  Try again in 15-30 minutes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⏰</span>
            </div>
          </div>
        </div>

        {/* Pro Tip */}
        <div className="mb-6 rounded-xl border border-gray-100 bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100">
              <span className="text-sm">💡</span>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-gray-900">Pro Tip</h3>
              <p className="text-sm text-gray-600">
                Opportunities are more frequent during high volatility periods
                and major market events.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">1,247</div>
              <div className="text-xs text-gray-600">Pools Scanned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-xs text-gray-600">Networks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">2m 14s</div>
              <div className="text-xs text-gray-600">Scan Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 border-t border-gray-200 bg-white p-4">
        <button
          onClick={onScanAgain}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-6 py-4 text-lg font-medium text-white hover:bg-slate-700"
        >
          <FiSearch className="h-5 w-5" />
          Check Again Later
        </button>

        <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 text-gray-700 hover:bg-gray-50">
          <FiBell className="h-4 w-4" />
          Notify When Available
        </button>

        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">
            Next Opportunity
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCountdown(countdown)}
          </div>
          <div className="text-xs text-gray-600">
            Estimated time to next opportunity
            <br />
            Based on historical patterns and current market volatility
          </div>
        </div>
      </div>
    </div>
  );
}

function ArbitrageOpportunityScreen({
  data,
  onBack,
  onExecute,
}: {
  data: OpportunityData;
  onBack: () => void;
  onExecute: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [priceUpdated, setPriceUpdated] = useState(2);

  useEffect(() => {
    const interval = setInterval(() => {
      setPriceUpdated((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            Arbitrage Opportunity
          </h2>
        </div>
        <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <span className="text-lg">🔖</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Profit Display */}
        <div className="mb-6 rounded-xl bg-white p-6 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gray-400"></div>
            <span className="text-sm text-gray-600">
              Price updated {priceUpdated} seconds ago
            </span>
          </div>
          <div className="mb-2 text-4xl font-bold text-gray-900">
            ${data.profit.toFixed(2)}
          </div>
          <div className="mb-4 text-lg font-medium text-green-600">
            +{data.profitPercentage}%
          </div>
          <div className="text-sm text-gray-600">Estimated Profit</div>
          <div className="mt-2 flex items-center justify-center gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">Live pricing</span>
          </div>
        </div>

        {/* Chain Flow */}
        <div className="mb-6 rounded-xl bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">⟠</span>
              <div>
                <div className="font-medium text-gray-900">
                  {data.sourceChain}
                </div>
                <div className="text-sm text-gray-600">Source</div>
              </div>
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex items-center gap-2">
              <span className="text-lg">⬟</span>
              <div>
                <div className="font-medium text-gray-900">
                  {data.destinationChain}
                </div>
                <div className="text-sm text-gray-600">Destination</div>
              </div>
            </div>
          </div>
        </div>

        {/* Token Pair */}
        <div className="mb-6 rounded-xl bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Token Pair</h3>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-gray-400"></div>
              <span className="text-xs text-gray-600">Price updating</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-lg">ETH</div>
                <div>
                  <div className="font-medium text-gray-900">Ethereum</div>
                  <div className="text-sm text-gray-600">$2,847.32</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {data.tokenPair.token1.amount} ETH
                </div>
                <div className="text-sm text-gray-600">
                  {data.tokenPair.token1.value}
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="rounded-full bg-gray-100 p-2">
                <span className="text-gray-400">⇄</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-lg">USDC</div>
                <div>
                  <div className="font-medium text-gray-900">USD Coin</div>
                  <div className="text-sm text-gray-600">$1.00</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {data.tokenPair.token2.amount} USDC
                </div>
                <div className="text-sm text-gray-600">
                  {data.tokenPair.token2.value}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mb-6 rounded-xl bg-white p-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Gas Costs</span>
              <span className="font-medium">~${data.gasCosts.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Execution Time</span>
              <span className="font-medium">~{data.executionTime} seconds</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Risk Level</span>
              <span className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="font-medium">{data.riskLevel}</span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Success Rate</span>
              <span className="font-medium">{data.successRate}%</span>
            </div>
          </div>
        </div>

        {/* Learn More */}
        <div className="mb-6 rounded-xl bg-white p-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex w-full items-center justify-between"
          >
            <span className="font-medium text-gray-900">Learn More</span>
            <FiChevronDown
              className={`h-4 w-4 transition-transform ${showDetails ? "rotate-180" : ""}`}
            />
          </button>

          {showDetails && (
            <div className="mt-4 space-y-4 text-sm text-gray-600">
              <p>{data.strategy}</p>

              <div>
                <h4 className="mb-2 font-medium text-gray-900">Key Factors:</h4>
                <ul className="space-y-1">
                  {data.keyFactors.map((factor, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-xs">•</span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 border-t border-gray-200 bg-white p-4">
        <button
          onClick={onExecute}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-6 py-4 text-lg font-medium text-white hover:bg-slate-700"
        >
          <FiZap className="h-5 w-5" />
          Execute Trade
        </button>

        <div className="flex gap-3">
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 text-gray-700 hover:bg-gray-50">
            <span className="text-lg">📊</span>
            Simulate
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 text-gray-700 hover:bg-gray-50">
            <FiShare className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

function ExecutingTradeScreen({
  data,
  onComplete,
  onFailed,
}: {
  data: OpportunityData;
  onComplete: () => void;
  onFailed: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(45);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      if (currentStep <= 4) {
        setCompletedSteps((prev) => [...prev, currentStep]);
        setCurrentStep((prev) => prev + 1);
      }
    }, 12000); // 12 seconds per step

    const timeInterval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);

    // Simulate completion after all steps
    const completionTimeout = setTimeout(() => {
      // 80% chance of success
      if (Math.random() > 0.2) {
        onComplete();
      } else {
        onFailed();
      }
    }, 48000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(timeInterval);
      clearTimeout(completionTimeout);
    };
  }, [onComplete, onFailed]);

  const steps = [
    {
      id: 1,
      title: "Flash Loan Initiated",
      subtitle: "5.0 ETH borrowed successfully",
      detail: "Completed • 12 seconds ago",
    },
    {
      id: 2,
      title: "Cross-Chain Swap",
      subtitle: "ETH → USDC on Ethereum",
      detail: "In progress • ~15 seconds remaining",
    },
    {
      id: 3,
      title: "Arbitrage Execution",
      subtitle: "Bridge to Polygon & swap back",
      detail: "Pending",
    },
    {
      id: 4,
      title: "Profit Calculation",
      subtitle: "Repay loan & calculate profit",
      detail: "Pending",
    },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            Executing Trade
          </h2>
        </div>
        <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <span className="text-lg">⋮</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Current Profit */}
        <div className="mb-6 rounded-xl bg-white p-4">
          <div className="text-center">
            <div className="mb-1 text-sm text-gray-600">Current Profit</div>
            <div className="text-3xl font-bold text-gray-900">
              ${data.profit.toFixed(2)}
            </div>
            <div className="text-green-600">+{data.profitPercentage}%</div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6 rounded-xl bg-white p-4">
          <div className="mb-4 text-center">
            <div className="mb-2 text-xl font-semibold text-gray-900">
              Executing Arbitrage
            </div>
            <div className="text-sm text-gray-600">
              Step {Math.min(currentStep, 4)} of 4 in progress
            </div>
            <div className="text-xs text-gray-500">
              Estimated completion: {timeRemaining} seconds
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = currentStep === step.id;

              return (
                <div key={step.id} className="flex items-start gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      isCompleted
                        ? "bg-green-100"
                        : isCurrent
                          ? "bg-blue-100"
                          : "bg-gray-100"
                    }`}
                  >
                    {isCompleted ? (
                      <FiCheck className="h-4 w-4 text-green-600" />
                    ) : isCurrent ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    ) : (
                      <span className="text-sm font-medium text-gray-400">
                        {step.id}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {step.title}
                    </div>
                    <div className="text-sm text-gray-600">{step.subtitle}</div>
                    <div className="text-xs text-gray-500">{step.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transaction Details */}
        <div className="mb-6 rounded-xl bg-white p-4">
          <h3 className="mb-4 font-semibold text-gray-900">
            Transaction Details
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Flash Loan Hash</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">0x7a8b...9c2d</span>
                <FiCopy className="h-3 w-3 text-gray-400" />
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Swap Hash</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">0x4f1e...8a5b</span>
                <FiCopy className="h-3 w-3 text-gray-400" />
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gas Used</span>
              <span>~$18.32</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Network</span>
              <div className="flex items-center gap-1">
                <span className="text-lg">⟠</span>
                <span>Ethereum</span>
              </div>
            </div>
          </div>
        </div>

        {/* View on Blockchain */}
        <div className="mb-6 rounded-xl bg-white p-4">
          <h3 className="mb-4 font-semibold text-gray-900">
            View on Blockchain
          </h3>
          <div className="space-y-3">
            <button className="flex w-full items-center justify-between rounded-lg bg-gray-50 p-3 hover:bg-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-lg">⟠</span>
                <span className="text-sm font-medium">Etherscan</span>
              </div>
              <FiExternalLink className="h-4 w-4 text-gray-400" />
            </button>
            <button className="flex w-full items-center justify-between rounded-lg bg-gray-50 p-3 hover:bg-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-lg">⬟</span>
                <span className="text-sm font-medium">PolygonScan</span>
              </div>
              <FiExternalLink className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Live Updates */}
        <div className="rounded-xl bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Live Updates</h3>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600">Connected</span>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="text-gray-600">
              14:32:15 Flash loan initiated on Ethereum
            </div>
            <div className="text-gray-600">
              14:32:27 ETH swap confirmed, 14,364.44 USDC received
            </div>
            <div className="text-gray-600">
              14:32:35 Bridging to Polygon network...
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Button */}
      <div className="border-t border-gray-200 bg-white p-4">
        <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 py-3 text-red-700 hover:bg-red-50">
          <FiX className="h-4 w-4" />
          Cancel Transaction
        </button>
        <p className="mt-2 text-center text-xs text-gray-500">
          Cancellation may not be possible once the transaction is confirmed on
          the blockchain
        </p>
      </div>
    </div>
  );
}

function TradeCompleteScreen({
  data,
  onFindNext,
  onBack,
}: {
  data: OpportunityData;
  onFindNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            Trade Complete
          </h2>
        </div>
        <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <FiShare className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Success Animation & Profit */}
        <div className="mb-6 text-center">
          <div className="relative mb-4 flex justify-center">
            <DotLottieReact
              src="/lottiFiles/Confetti.json"
              loop={false}
              autoplay
              style={{ width: 120, height: 120 }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
                <FiCheck className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="mb-2 flex items-center justify-center gap-2">
            <span className="text-lg">💰</span>
            <span className="text-sm font-medium text-gray-600">
              Profit Earned
            </span>
          </div>
          <div className="mb-2 text-4xl font-bold text-gray-900">
            ${data.profit.toFixed(2)}
          </div>

          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Arbitrage Successful!
          </h2>
          <p className="text-gray-600">All steps completed in 42 seconds</p>

          <div className="mt-4 rounded-lg bg-green-50 p-4">
            <div className="text-2xl font-bold text-green-700">
              +${data.profit.toFixed(2)}
            </div>
            <div className="text-sm text-green-600">
              Net Profit (+{data.profitPercentage}%)
            </div>
          </div>
        </div>

        {/* Profit Breakdown */}
        <div className="mb-6 rounded-xl bg-white p-4">
          <h3 className="mb-4 font-semibold text-gray-900">Profit Breakdown</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Flash Loan Amount</span>
              <span className="font-medium">
                {data.tokenPair.token1.amount} ETH
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Initial Value</span>
              <span className="font-medium">$14,364.44</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Final Value</span>
              <span className="font-medium">$14,528.14</span>
            </div>
            <hr />
            <div className="flex justify-between text-green-600">
              <span>Gross Profit</span>
              <span className="font-medium">+$163.70</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Gas Fees</span>
              <span className="font-medium">-$24.32</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Flash Loan Fee</span>
              <span className="font-medium">-$11.54</span>
            </div>
            <hr />
            <div className="flex justify-between font-semibold">
              <span>Net Profit</span>
              <span className="text-green-600">+$127.84</span>
            </div>
          </div>
        </div>

        {/* Execution Summary */}
        <div className="mb-6 rounded-xl bg-white p-4">
          <h3 className="mb-4 font-semibold text-gray-900">
            Execution Summary
          </h3>
          <div className="space-y-4">
            {[
              {
                title: "Flash Loan Initiated",
                subtitle: "5.0 ETH borrowed from Aave",
                time: "8 seconds",
              },
              {
                title: "Cross-Chain Swap",
                subtitle: "ETH → USDC on Ethereum",
                time: "15 seconds",
              },
              {
                title: "Arbitrage Execution",
                subtitle: "Bridge to Polygon & swap back",
                time: "12 seconds",
              },
              {
                title: "Loan Repayment",
                subtitle: "Flash loan repaid with profit",
                time: "7 seconds",
              },
            ].map((step, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <FiCheck className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{step.title}</div>
                  <div className="text-sm text-gray-600">{step.subtitle}</div>
                </div>
                <div className="text-xs text-gray-500">
                  Completed in {step.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction Hashes */}
        <div className="mb-6 rounded-xl bg-white p-4">
          <h3 className="mb-4 font-semibold text-gray-900">
            Transaction Hashes
          </h3>
          <div className="space-y-3 text-sm">
            {[
              { label: "Flash Loan", hash: "0x7a8b...9c2d" },
              { label: "Ethereum Swap", hash: "0x4f1e...8a5b" },
              { label: "Polygon Bridge", hash: "0x9d2c...7f4e" },
              { label: "Final Swap", hash: "0x3b8a...5e9f" },
            ].map((tx, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-600">{tx.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">{tx.hash}</span>
                  <FiCopy className="h-3 w-3 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Stats */}
        <div className="rounded-xl bg-white p-4">
          <h3 className="mb-4 font-semibold text-gray-900">
            Performance Stats
          </h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">42s</div>
              <div className="text-xs text-gray-600">Execution Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">2.34%</div>
              <div className="text-xs text-gray-600">ROI</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">$35.86</div>
              <div className="text-xs text-gray-600">Total Fees</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">4</div>
              <div className="text-xs text-gray-600">Transactions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 border-t border-gray-200 bg-white p-4">
        <button
          onClick={onFindNext}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-6 py-4 text-lg font-medium text-white hover:bg-slate-700"
        >
          <FiSearch className="h-5 w-5" />
          Find Next Opportunity
        </button>

        <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 text-gray-700 hover:bg-gray-50">
          <FiShare className="h-4 w-4" />
          Share Success
        </button>
      </div>
    </div>
  );
}

function TransactionFailedScreen({
  onScanAgain,
  onBack,
}: {
  onScanAgain: () => void;
  onBack: () => void;
}) {
  const [countdown, setCountdown] = useState(2852); // 47:32 in seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            Transaction Failed
          </h2>
        </div>
        <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <span className="text-lg">⋮</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Failed Status */}
        <div className="mb-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
              <FiAlertTriangle className="h-8 w-8 text-gray-600" />
            </div>
          </div>

          <div className="mb-2">
            <span className="text-sm font-medium text-gray-600">
              Protected Loss
            </span>
          </div>
          <div className="mb-2 text-3xl font-bold text-gray-900">$0.00</div>
          <div className="text-sm text-gray-600">Gas covered</div>

          <h2 className="mt-4 mb-2 text-xl font-semibold text-gray-900">
            MEV Opportunity Expired
          </h2>
          <p className="text-gray-600">
            Competition is fierce in the MEV space!
          </p>
          <p className="text-sm text-gray-500">
            Transaction automatically rolled back
          </p>
        </div>

        {/* What Happened */}
        <div className="mb-6 rounded-xl bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg">💡</span>
            <h3 className="font-semibold text-gray-900">What Happened?</h3>
          </div>
          <p className="text-sm text-gray-600">
            Another MEV bot executed this arbitrage opportunity before us. In
            the fast-paced world of MEV, timing is everything. Our transaction
            was reverted to protect you from losses.
          </p>
        </div>

        {/* Rollback Process */}
        <div className="mb-6 rounded-xl bg-white p-4">
          <h3 className="mb-4 font-semibold text-gray-900">Rollback Process</h3>
          <div className="space-y-4">
            {[
              {
                title: "Flash Loan Initiated",
                subtitle: "5.0 ETH borrowed successfully",
                status: "completed",
              },
              {
                title: "Arbitrage Failed",
                subtitle: "Price differential no longer exists",
                status: "failed",
              },
              {
                title: "Loan Repaid",
                subtitle: "5.0 ETH returned automatically",
                status: "completed",
              },
              {
                title: "Funds Protected",
                subtitle: "No loss to your capital",
                status: "completed",
              },
            ].map((step, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    step.status === "completed"
                      ? "bg-green-100"
                      : step.status === "failed"
                        ? "bg-red-100"
                        : "bg-gray-100"
                  }`}
                >
                  {step.status === "completed" ? (
                    <FiCheck className="h-4 w-4 text-green-600" />
                  ) : step.status === "failed" ? (
                    <FiX className="h-4 w-4 text-red-600" />
                  ) : (
                    <span className="text-sm font-medium text-gray-400">
                      {index + 1}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{step.title}</div>
                  <div className="text-sm text-gray-600">{step.subtitle}</div>
                  <div className="text-xs text-gray-500 capitalize">
                    {step.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="mb-6 rounded-xl bg-white p-4">
          <h3 className="mb-4 font-semibold text-gray-900">Cost Breakdown</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Gas Fees</span>
              <span className="font-medium">$12.47</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Protocol Coverage</span>
              <span className="font-medium text-green-600">-$12.47</span>
            </div>
            <hr />
            <div className="flex justify-between font-semibold">
              <span>Your Cost</span>
              <span className="text-green-600">$0.00</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <span className="text-lg">🛡️</span>
            Gas costs covered by our protocol insurance fund
          </div>
        </div>

        {/* Learn From This */}
        <div className="mb-6 rounded-xl bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg">🎓</span>
            <h3 className="font-semibold text-gray-900">Learn From This</h3>
          </div>
          <p className="mb-3 text-sm text-gray-600">
            MEV competition is intense. Successful arbitrageurs use faster
            infrastructure, better algorithms, and strategic timing. This
            failure teaches us about market dynamics.
          </p>
          <button className="text-sm text-blue-600 underline">
            Read more about MEV strategies
          </button>
        </div>

        {/* MEV Stats */}
        <div className="rounded-xl bg-white p-4">
          <h3 className="mb-4 font-semibold text-gray-900">Your MEV Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">73%</div>
              <div className="text-xs text-gray-600">Success Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">$2,847</div>
              <div className="text-xs text-gray-600">Total Profit</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">156</div>
              <div className="text-xs text-gray-600">Executions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 border-t border-gray-200 bg-white p-4">
        <button
          onClick={onScanAgain}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-6 py-4 text-lg font-medium text-white hover:bg-slate-700"
        >
          <FiSearch className="h-5 w-5" />
          Scan for New Opportunities
        </button>

        <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 text-gray-700 hover:bg-gray-50">
          <FiBarChart className="h-4 w-4" />
          View Market Analysis
        </button>

        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">
            Next Opportunity
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCountdown(countdown)}
          </div>
          <div className="text-xs text-gray-600">
            Estimated time to next opportunity
            <br />
            Based on historical patterns and current market volatility
          </div>
        </div>
      </div>
    </div>
  );
}

