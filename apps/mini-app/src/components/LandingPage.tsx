"use client";

import React, { useState } from "react";
import {
  FiZap,
  FiShield,
  FiCpu,
  FiGlobe,
  FiTrendingUp,
  FiUsers,
  FiArrowRight,
  FiPlay,
  FiMenu,
  FiX,
} from "react-icons/fi";

export function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLaunchApp = () => {
    // Simply navigate to the dashboard - no verification needed upfront
    localStorage.setItem("miniapp-mode", "true");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header
        className="relative border-b border-gray-100 bg-white"
        style={{ zIndex: 100 }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black">
                <FiZap className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">FlashArb</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden items-center space-x-8 md:flex">
              <a
                href="#features"
                className="text-gray-600 transition-colors hover:text-gray-900"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 transition-colors hover:text-gray-900"
              >
                How It Works
              </a>
              <a
                href="#stats"
                className="text-gray-600 transition-colors hover:text-gray-900"
              >
                Stats
              </a>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden items-center space-x-4 md:flex">
              <button className="rounded-lg bg-gray-900 px-4 py-2 text-white transition-colors hover:bg-gray-800">
                Only on World Coin App
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100 md:hidden"
            >
              {isMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu - Fixed z-index issue */}
          {isMenuOpen && (
            <div
              className="absolute top-full right-0 left-0 z-50 border-b border-gray-100 bg-white shadow-lg md:hidden"
              style={{ position: "absolute", zIndex: 50 }}
            >
              <div className="space-y-4 px-4 py-4">
                <a
                  href="#features"
                  className="block text-gray-600 transition-colors hover:text-gray-900"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="block text-gray-600 transition-colors hover:text-gray-900"
                >
                  How It Works
                </a>
                <a
                  href="#stats"
                  className="block text-gray-600 transition-colors hover:text-gray-900"
                >
                  Stats
                </a>
                <a
                  href="#pricing"
                  className="block text-gray-600 transition-colors hover:text-gray-900"
                >
                  Pricing
                </a>
                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <button className="block w-full text-left text-gray-600 transition-colors hover:text-gray-900">
                    Login
                  </button>
                  <button className="block w-full rounded-lg bg-gray-900 px-4 py-2 text-white transition-colors hover:bg-gray-800">
                    Go to App
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left Content */}
            <div
              className="space-y-8"
              style={{ position: "relative", zIndex: 1 }}
            >
              <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                <FiShield className="mr-2 h-4 w-4" />
                Secured by World ID
              </div>

              <div className="space-y-6">
                <h1 className="text-4xl leading-tight font-bold text-gray-900 lg:text-6xl">
                  Cross-Chain <span className="text-gray-500">Flash</span>
                  <br />
                  <span className="text-gray-500">Loan</span> Arbitrage
                </h1>

                <p className="max-w-lg text-lg text-gray-600">
                  Discover and execute profitable arbitrage opportunities across
                  multiple blockchains in real-time. No capital required -
                  powered by flash loans.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={handleLaunchApp}
                  className="flex items-center justify-center rounded-lg bg-gray-900 px-6 py-3 text-white transition-colors hover:bg-gray-800"
                >
                  <FiZap className="mr-2 h-5 w-5" />
                  Launch App
                </button>
                <button className="flex items-center justify-center rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50">
                  <FiPlay className="mr-2 h-5 w-5" />
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center">
                  <FiUsers className="mr-1 h-4 w-4" />
                  1,000+ Active Users
                </div>
                <div className="flex items-center">
                  <FiTrendingUp className="mr-1 h-4 w-4" />
                  $2.4M+ Profits Generated
                </div>
              </div>
            </div>

            {/* Right Content - Dashboard Preview */}
            <div className="relative">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">
                {/* User Profile Section */}
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
                      <span className="font-semibold text-white">A</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        Alex eth
                      </div>
                      <div className="flex items-center text-sm text-green-600">
                        <div className="mr-1 h-2 w-2 rounded-full bg-green-500"></div>
                        World ID Verified
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      $24,567
                    </div>
                    <div className="text-sm text-gray-500">Total Balance</div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="mb-6 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">18</div>
                    <div className="text-xs text-gray-500">Today Ops</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">94%</div>
                    <div className="text-xs text-gray-500">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">
                      $1,847
                    </div>
                    <div className="text-xs text-gray-500">Today Profit</div>
                  </div>
                </div>

                {/* Scan Button */}
                <button className="mb-4 flex w-full items-center justify-center rounded-lg bg-gray-800 py-3 text-white">
                  <FiZap className="mr-2 h-4 w-4" />
                  Scan for Opportunities
                </button>

                {/* Opportunities List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500">
                        <span className="text-xs font-bold text-white">B</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">BTC/ETH</div>
                        <div className="text-xs text-gray-500">
                          1h 30m Arbitrage
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">+$247</div>
                      <div className="text-xs text-gray-500">Est. Profit</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500">
                        <span className="text-xs font-bold text-white">E</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">ETH/USDC</div>
                        <div className="text-xs text-gray-500">
                          45m 2h Arbitrage
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">+$156</div>
                      <div className="text-xs text-gray-500">Est. Profit</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose FlashArb Section */}
      <section id="features" className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
              Why Choose FlashArb?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Advanced algorithms, real-time monitoring, and seamless execution
              across multiple chains
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Lightning Fast */}
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
                <FiZap className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900">
                Lightning Fast
              </h3>
              <p className="text-gray-600">
                Execute arbitrage opportunities in milliseconds across Ethereum,
                Polygon, BSC, and more.
              </p>
            </div>

            {/* Zero Capital Risk */}
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <FiShield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900">
                Zero Capital Risk
              </h3>
              <p className="text-gray-600">
                Use flash loans to execute trades without upfront capital. Only
                pay gas fees on successful trades.
              </p>
            </div>

            {/* AI-Powered */}
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <FiCpu className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900">
                AI-Powered
              </h3>
              <p className="text-gray-600">
                Advanced ML algorithms identify profitable opportunities and
                optimize execution strategies.
              </p>
            </div>

            {/* Multi-Chain */}
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <FiGlobe className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900">
                Multi-Chain
              </h3>
              <p className="text-gray-600">
                Support for 8+ blockchains including Ethereum, Polygon,
                Arbitrum, Optimism, and more.
              </p>
            </div>

            {/* Real-Time Analytics */}
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
                <FiTrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900">
                Real-Time Analytics
              </h3>
              <p className="text-gray-600">
                Comprehensive dashboard with live market data, profit tracking,
                and performance metrics.
              </p>
            </div>

            {/* Community Driven */}
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                <FiUsers className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900">
                Community Driven
              </h3>
              <p className="text-gray-600">
                Join a community of arbitrageurs, share strategies, and compete
                on the leaderboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple 3-step process to start earning
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900">
                Connect Wallet
              </h3>
              <p className="text-gray-600">
                Connect your wallet and verify with World ID for enhanced
                security and higher rate limits.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900">
                Scan Markets
              </h3>
              <p className="text-gray-600">
                Our AI continuously scans DEXs across multiple chains to
                identify profitable arbitrage opportunities.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900">
                Execute & Earn
              </h3>
              <p className="text-gray-600">
                Execute trades with one click using flash loans. Profits are
                automatically deposited to your wallet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section id="stats" className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
              Platform Statistics
            </h2>
            <p className="text-lg text-gray-600">
              Real numbers from our growing community
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-gray-900 lg:text-5xl">
                $2.4M+
              </div>
              <div className="text-gray-600">Total Profits Generated</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-gray-900 lg:text-5xl">
                1,200+
              </div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-gray-900 lg:text-5xl">
                47K+
              </div>
              <div className="text-gray-600">Successful Trades</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-gray-900 lg:text-5xl">
                8
              </div>
              <div className="text-gray-600">Supported Chains</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-white lg:text-4xl">
            Ready to Start Earning?
          </h2>
          <p className="mb-8 text-xl text-gray-300">
            Join thousands of users already profiting from cross-chain arbitrage
            opportunities
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              onClick={handleLaunchApp}
              className="flex items-center justify-center rounded-lg bg-white px-8 py-4 font-semibold text-gray-900 transition-colors hover:bg-gray-100"
            >
              <FiZap className="mr-2 h-5 w-5" />
              Launch FlashArb App
            </button>
            <button className="flex items-center justify-center rounded-lg border border-gray-600 px-8 py-4 text-white transition-colors hover:bg-gray-800">
              <FiArrowRight className="mr-2 h-5 w-5" />
              Read Documentation
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="mb-4 flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                  <FiZap className="h-4 w-4 text-gray-900" />
                </div>
                <span className="text-xl font-bold text-white">FlashArb</span>
              </div>
              <p className="text-sm text-gray-400">
                The future of cross-chain arbitrage trading.
              </p>
              <div className="mt-4 flex space-x-4">
                <div className="h-6 w-6 rounded bg-gray-700"></div>
                <div className="h-6 w-6 rounded bg-gray-700"></div>
                <div className="h-6 w-6 rounded bg-gray-700"></div>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="mb-4 font-semibold text-white">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="mb-4 font-semibold text-white">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="mb-4 font-semibold text-white">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            © 2024 FlashArb. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
