"use client";

import { useState } from "react";
import {
  FiShield,
  FiZap,
  FiUsers,
  FiGlobe,
  FiDollarSign,
  FiClock,
  FiArrowRight,
  FiGithub,
  FiExternalLink,
} from "react-icons/fi";

export function DesktopLanding() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <span className="text-2xl">🌍</span>,
      title: "Native Worldcoin Integration",
      description:
        "Seamless World ID verification within the Worldcoin ecosystem",
      detail:
        "Built specifically for Worldcoin Mini Apps with native SDK integration and optimized user experience",
    },
    {
      icon: <span className="text-2xl">📱</span>,
      title: "Mobile-First MEV Interface",
      description:
        "Touch-optimized interface designed for mobile MEV extraction",
      detail:
        "Intuitive mobile dashboard with one-tap arbitrage execution and real-time opportunity scanning",
    },
    {
      icon: <FiZap className="h-8 w-8" />,
      title: "Real-time MEV Detection",
      description: "Automatic MEV opportunity detection during regular swaps",
      detail:
        "Uniswap v4 hooks analyze cross-chain prices in real-time with Pyth Network oracles",
    },
    {
      icon: <FiShield className="h-8 w-8" />,
      title: "Sybil Resistant Architecture",
      description: "World ID verification with 1-hour rate limiting per human",
      detail:
        "Prevents bot exploitation while ensuring fair access for verified humans across all supported chains",
    },
  ];

  const stats = [
    { label: "Smart Contract Lines", value: "2000+", icon: <FiUsers /> },
    { label: "Supported Chains", value: "5", icon: <FiGlobe /> },
    { label: "MEV Detection", value: "Real-time", icon: <FiClock /> },
    { label: "Profit Share", value: "75%", icon: <FiDollarSign /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Mini App Promotion Banner */}
      <div className="border-b border-blue-500/30 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                <span className="text-sm">🌍</span>
              </div>
              <div>
                <span className="font-medium text-white">
                  Best Experience:{" "}
                </span>
                <span className="text-blue-300">
                  Use MEV-Share in the Worldcoin Mini App
                </span>
              </div>
            </div>

            <a
              href="https://worldcoin.org/mini-apps"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:from-blue-700 hover:to-purple-700"
            >
              🚀 Open Mini App
              <FiExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-xl">⚡</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              <span className="text-blue-400">MEV</span>-Share
            </h1>
            <p className="text-xs text-gray-400">
              Democratizing MEV Extraction
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/your-repo/mev-share"
            className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700"
          >
            <FiGithub className="h-4 w-4" />
            GitHub
          </a>

          <a
            href="https://worldcoin.org/mini-apps"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:from-blue-700 hover:to-purple-700"
          >
            🌍 Worldcoin App
            <FiExternalLink className="h-4 w-4" />
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-6 flex items-center gap-2">
                <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium text-green-400">
                  ✅ Live on Testnet
                </span>
                <span className="rounded-full bg-blue-500/20 px-3 py-1 text-sm font-medium text-blue-400">
                  🏆 ETH Global New Delhi
                </span>
              </div>

              <h1 className="mb-6 text-5xl leading-tight font-bold text-white lg:text-6xl">
                Democratize{" "}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  MEV Extraction
                </span>{" "}
                for Humans
              </h1>

              <p className="mb-8 text-xl text-gray-300">
                The first sybil-resistant MEV protocol that enables verified
                humans to participate in and profit from cross-chain arbitrage
                opportunities through Uniswap v4 hooks and World ID
                verification.
              </p>

              <div className="mb-8 space-y-4">
                {/* Primary CTA - Mini App */}
                <div className="rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-2">
                      <span className="text-xl">📱</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Best Experience: Worldcoin Mini App
                      </h3>
                      <p className="text-sm text-gray-300">
                        Full MEV-Share functionality with World ID integration
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <a
                      href="https://worldcoin.org/mini-apps"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-base font-medium text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
                    >
                      🌍 Open in Worldcoin App
                      <FiExternalLink className="h-4 w-4" />
                    </a>

                    <button className="flex items-center gap-2 rounded-lg border border-gray-500 bg-gray-800/50 px-6 py-3 text-base font-medium text-gray-300 transition-colors hover:bg-gray-700/50">
                      🖥️ Try Desktop Demo
                      <FiArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Secondary options */}
                <div className="flex flex-wrap gap-4">
                  <a
                    href="#features"
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
                  >
                    Learn More About MEV-Share
                    <FiArrowRight className="h-4 w-4" />
                  </a>

                  <a
                    href="https://github.com/your-repo/mev-share"
                    className="flex items-center gap-2 text-gray-400 hover:text-gray-300"
                  >
                    View Source Code
                    <FiGithub className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="mb-2 flex justify-center text-blue-400">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini App Preview */}
            <div className="relative">
              <div className="relative rounded-2xl bg-gray-800/50 p-6 shadow-2xl backdrop-blur-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="ml-4 text-sm text-gray-400">
                      MEV-Share Mini App
                    </span>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-black px-2 py-1 text-xs text-white">
                    🌍 <span>Worldcoin</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* World ID Verification Status */}
                  <div className="rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                        <span className="text-sm">✓</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          World ID Verified
                        </div>
                        <div className="text-xs text-gray-400">
                          Sybil resistance active
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-gradient-to-r from-green-500/20 to-blue-500/20 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-400">
                          MEV Opportunity Detected
                        </div>
                        <div className="text-xl font-bold text-white">
                          $127.50 Profit
                        </div>
                        <div className="text-sm text-green-400">
                          ETH → ARB Cross-Chain
                        </div>
                      </div>
                      <div className="text-3xl">⚡</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-gray-700/50 p-3 text-center">
                      <div className="text-lg font-bold text-white">23</div>
                      <div className="text-xs text-gray-400">
                        Today&apos;s Ops
                      </div>
                    </div>
                    <div className="rounded-lg bg-gray-700/50 p-3 text-center">
                      <div className="text-lg font-bold text-white">94%</div>
                      <div className="text-xs text-gray-400">Success Rate</div>
                    </div>
                    <div className="rounded-lg bg-gray-700/50 p-3 text-center">
                      <div className="text-lg font-bold text-white">$2.1K</div>
                      <div className="text-xs text-gray-400">Total Profit</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-3 shadow-lg">
                <span className="text-white">🌍</span>
              </div>
              <div className="absolute -bottom-4 -left-4 rounded-lg bg-green-600 p-3 shadow-lg">
                <FiZap className="h-6 w-6 text-white" />
              </div>

              {/* Mobile frame indicator */}
              <div className="absolute top-1/2 -left-2 h-8 w-1 -translate-y-1/2 rounded-full bg-gray-600"></div>
              <div className="absolute top-1/3 -right-2 h-12 w-1 -translate-y-1/2 rounded-full bg-gray-600"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-white">
              Why Use the Worldcoin Mini App?
            </h2>
            <p className="text-xl text-gray-300">
              The mini app provides the complete MEV-Share experience with
              seamless World ID integration
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`cursor-pointer rounded-lg border p-6 transition-all ${
                    activeFeature === index
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`rounded-lg p-2 ${
                        activeFeature === index ? "bg-blue-600" : "bg-gray-700"
                      }`}
                    >
                      <div className="text-white">{feature.icon}</div>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-semibold text-white">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-blue-600 p-2">
                  <div className="text-white">
                    {features[activeFeature]?.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {features[activeFeature]?.title}
                </h3>
              </div>
              <p className="mb-6 text-gray-300">
                {features[activeFeature]?.detail}
              </p>

              {/* Mini App Benefits */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  Native World ID integration with Worldcoin SDK
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  Mobile-optimized for touch interactions
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                  Seamless onboarding within Worldcoin ecosystem
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                  Full MEV functionality: Arbitrage + LP modes
                </div>
              </div>

              {/* CTA for Mini App */}
              <div className="mt-6">
                <a
                  href="https://worldcoin.org/mini-apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:from-blue-700 hover:to-purple-700"
                >
                  🌍 Open in Worldcoin App
                  <FiExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-4xl font-bold text-white">
            Ready to Extract MEV Fairly?
          </h2>
          <p className="mb-8 text-xl text-gray-300">
            Join the revolution in democratized MEV extraction. Verify your
            humanity and start earning.
          </p>

          <div className="space-y-6">
            {/* Primary CTA */}
            <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-8">
              <div className="mb-4 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  Experience MEV-Share in Worldcoin
                </h3>
                <p className="text-gray-300">
                  Get the full experience with World ID verification and
                  mobile-optimized interface
                </p>
              </div>

              <a
                href="https://worldcoin.org/mini-apps"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-medium text-white shadow-xl transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-2xl"
              >
                🌍 Open MEV-Share in Worldcoin App
                <FiExternalLink className="h-5 w-5" />
              </a>
            </div>

            {/* Secondary CTA */}
            <div className="text-center">
              <button className="inline-flex items-center gap-2 rounded-lg border border-gray-600 bg-gray-800/50 px-8 py-3 text-base font-medium text-gray-300 transition-colors hover:bg-gray-700/50">
                🖥️ Try Desktop Demo Instead
                <FiArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-2 text-sm text-gray-500">
                Limited functionality • For demonstration purposes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
                <span className="text-sm">⚡</span>
              </div>
              <span className="font-medium text-white">MEV-Share</span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-400">
                ETH Global New Delhi 2025
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a
                href="https://worldcoin.org/mini-apps"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-white"
              >
                🌍 Mini App
              </a>
              <a href="#" className="hover:text-white">
                GitHub
              </a>
              <a href="#" className="hover:text-white">
                Docs
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
