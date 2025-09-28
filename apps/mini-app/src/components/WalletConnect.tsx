"use client";

import { useState } from "react";
import { FiCheck, FiExternalLink } from "react-icons/fi";

interface WalletConnectProps {
  onConnected: (address: string) => void;
}

export function WalletConnect({ onConnected }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("Please install MetaMask or another Web3 wallet");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        onConnected(address);
      } else {
        setError("No accounts found. Please check your wallet.");
      }
    } catch (err: any) {
      if (err.code === 4001) {
        setError("Please connect your wallet to continue");
      } else {
        setError("Failed to connect wallet. Please try again.");
      }
      console.error("Wallet connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  };

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
              <FiWallet className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Connect Your Wallet
            </h1>
            <p className="text-sm text-gray-600">
              Connect your wallet to start earning from flash loan arbitrage
            </p>
          </div>

          <div className="mb-6 space-y-3 text-sm">
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
              <FiCheck className="h-4 w-4 flex-shrink-0 text-green-600" />
              <span className="text-gray-700">✅ World ID Verified</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
              <FiCheck className="h-4 w-4 flex-shrink-0 text-green-600" />
              <span className="text-gray-700">Secure wallet connection</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
              <FiCheck className="h-4 w-4 flex-shrink-0 text-green-600" />
              <span className="text-gray-700">No upfront capital required</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {isConnecting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Connecting...
              </>
            ) : (
              <>
                <FiWallet className="h-4 w-4" />
                Connect Wallet
              </>
            )}
          </button>

          <div className="mt-4 text-center">
            <p className="mb-2 text-xs text-gray-500">Don't have a wallet?</p>
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
            >
              Download MetaMask
              <FiExternalLink className="h-3 w-3" />
            </a>
          </div>

          <p className="mt-4 text-center text-xs text-gray-500">
            Your wallet address will be used to receive arbitrage profits
          </p>
        </div>
      </div>
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
