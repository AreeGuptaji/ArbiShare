"use client";

import { useAuth } from "@/hooks/useAuth";
import { useArbitrage } from "@/hooks/useArbitrage";
import { OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { TradeHistory } from "@/components/dashboard/TradeHistory";
import { UserStats } from "@/components/dashboard/UserStats";
import { Loading } from "@/components/ui/Loading";
import { mockTrades, mockUserStats } from "@/lib/mockData";
import { FiRefreshCw } from "react-icons/fi";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { opportunities, loadingOpportunities, executeArbitrage, isExecuting } =
    useArbitrage();

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            Please verify your World ID to access the dashboard.
          </p>
          <Button onClick={() => (window.location.href = "/")}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              FlashArb Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back,{" "}
              {user?.walletAddress
                ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
                : "Trader"}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <FiRefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Overview */}
        <UserStats stats={mockUserStats} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Arbitrage Opportunities */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Live Arbitrage Opportunities
              </h2>
              {loadingOpportunities && <Loading size="sm" />}
            </div>

            {loadingOpportunities ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-48 animate-pulse rounded-lg bg-white"
                  />
                ))}
              </div>
            ) : opportunities.length === 0 ? (
              <div className="rounded-lg bg-white p-8 text-center">
                <p className="text-gray-500">
                  No arbitrage opportunities available right now.
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  Check back in a few minutes for new opportunities.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {opportunities.map((opportunity) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    onExecute={executeArbitrage}
                    isExecuting={isExecuting}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Trade History Sidebar */}
          <div className="space-y-4">
            <TradeHistory trades={mockTrades} />
          </div>
        </div>
      </div>
    </div>
  );
}
