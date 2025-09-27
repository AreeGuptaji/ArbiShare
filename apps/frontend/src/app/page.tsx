"use client";

import { useAuth } from "@/hooks/useAuth";
import { WorldIDConnect } from "@/components/auth/WorldIDConnect";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { FiShield, FiZap, FiTrendingUp, FiUsers } from "react-icons/fi";
import Link from "next/link";

export default function HomePage() {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md space-y-6 rounded-xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <FiShield className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Welcome to FlashArb!
            </h1>
            <p className="text-gray-600">
              You&apos;re verified and ready to start arbitrage trading.
            </p>
          </div>
          <Link href="/dashboard">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-6xl">
              <span className="text-blue-600">Flash</span>Arb
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600 md:text-2xl">
              Sybil-resistant DeFi arbitrage for verified humans. Execute
              profitable trades across DEXs with World ID verification.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <WorldIDConnect onSuccess={login} />
              <p className="text-sm text-gray-500">
                Verify your humanity to get started
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <FiShield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Sybil Resistant</h3>
            <p className="text-sm text-gray-600">
              World ID verification ensures only verified humans can participate
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <FiZap className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Flash Loans</h3>
            <p className="text-sm text-gray-600">
              Execute arbitrage with Uniswap v4 hooks and atomic transactions
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <FiTrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">
              Real-time Opportunities
            </h3>
            <p className="text-sm text-gray-600">
              1inch API integration for live price discovery across DEXs
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <FiUsers className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Fair Access</h3>
            <p className="text-sm text-gray-600">
              One arbitrage per World ID per hour - democratizing DeFi profits
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
            <div>
              <div className="mb-2 text-3xl font-bold text-blue-400">$1M+</div>
              <div className="text-gray-300">Target Arbitrage Volume</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-green-400">
                5000+
              </div>
              <div className="text-gray-300">Target Active Users</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-purple-400">
                99.9%
              </div>
              <div className="text-gray-300">Sybil Resistance</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
