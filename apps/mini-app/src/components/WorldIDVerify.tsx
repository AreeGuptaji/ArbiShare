"use client";

import { useState } from "react";
import { FiShield, FiCheck } from "react-icons/fi";

export function WorldIDVerify() {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);

    // TODO: Implement actual WorldCoin verification
    // - Use Worldcoin Mini-App SDK
    // - Handle verification flow in mini-app context
    // - Connect with backend API

    // Simulate verification process
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsVerifying(false);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <FiShield className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          Verify Your Identity
        </h3>
        <p className="text-sm text-gray-600">
          Prove you&apos;re human with World ID to access sybil-resistant
          arbitrage trading
        </p>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
          <FiCheck className="h-4 w-4 flex-shrink-0 text-green-600" />
          <span className="text-gray-700">
            One arbitrage per human per hour
          </span>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
          <FiCheck className="h-4 w-4 flex-shrink-0 text-green-600" />
          <span className="text-gray-700">No bot competition</span>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
          <FiCheck className="h-4 w-4 flex-shrink-0 text-green-600" />
          <span className="text-gray-700">Fair access to opportunities</span>
        </div>
      </div>

      <button
        onClick={handleVerify}
        disabled={isVerifying}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 font-medium text-white disabled:opacity-50"
      >
        {isVerifying ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Verifying...
          </>
        ) : (
          <>🌍 Verify with World ID</>
        )}
      </button>

      <p className="text-center text-xs text-gray-500">
        Your privacy is protected. Only proof of humanity is verified.
      </p>
    </div>
  );
}
