"use client";
import {
  MiniKit,
  type VerifyCommandInput,
  VerificationLevel,
  type ISuccessResult,
} from "@worldcoin/minikit-js";
import { useState } from "react";
import { FiShield, FiUsers, FiZap, FiLock } from "react-icons/fi";

interface WorldIDVerifyParams {
  onVerified: () => void;
}

export function WorldIDVerify({ onVerified }: WorldIDVerifyParams) {
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyPayload: VerifyCommandInput = {
    action: "app-entry",
    verification_level: VerificationLevel.Device,
  };

  const handleVerify = async () => {
    if (!MiniKit.isInstalled()) {
      console.log("MiniKit is not installed");
      return;
    }

    setIsVerifying(true);

    try {
      console.log("Starting verification process...");

      // World App will open a drawer prompting the user to confirm the operation, promise is resolved once user confirms or cancels
      const { finalPayload } =
        await MiniKit.commandsAsync.verify(verifyPayload);
      console.log("MiniKit verification result:", finalPayload);

      if (finalPayload.status === "error") {
        console.log("Error payload from MiniKit:", finalPayload);
        setIsVerifying(false);
        return;
      }

      console.log("Sending verification to backend...");

      // Verify the proof in the backend
      const verifyResponse = await fetch("/api/verify-proof", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: finalPayload as ISuccessResult, // Parses only the fields we need to verify
          action: "app-entry",
        }),
      });

      if (verifyResponse.ok) {
        console.log("Verification successful!");
        onVerified();
      } else {
        console.log("Verification failed:");
        // Handle verification failure
      }
    } catch (error) {
      console.error("Verification process error:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="pt-16 pb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Flash Arbitrage
        </h1>

        {/* Large Shield Icon */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-800">
          <FiShield className="h-10 w-10 text-white" />
        </div>

        <h2 className="mb-3 text-xl font-semibold text-gray-900">
          Verification Required
        </h2>
        <p className="px-6 leading-relaxed text-gray-600">
          To ensure fair access and prevent abuse, we require World ID
          verification before you can access arbitrage opportunities.
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
              <h3 className="mb-1 font-semibold text-gray-900">
                Limited Opportunities Per Person
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Each verified user gets fair access to profitable arbitrage
                opportunities without unlimited exploitation.
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
              <h3 className="mb-1 font-semibold text-gray-900">
                No Bot Competition
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Human verification prevents automated bots from monopolizing
                profitable trades and ensures real users benefit.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <svg
                className="h-5 w-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l-3-9m3 9l3-9"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="mb-1 font-semibold text-gray-900">
                Fair Access to Everyone
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Equal opportunity distribution ensures all verified users have
                the same chance at profitable arbitrage trades.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="px-6 py-4">
        <div className="mb-6 flex items-center gap-3">
          <FiLock className="h-5 w-5 text-gray-600" />
          <div>
            <h4 className="font-medium text-gray-900">
              Your Privacy is Protected
            </h4>
            <p className="text-sm text-gray-600">
              World ID verification is anonymous and secure. We only confirm
              you&apos;re human - no personal data is stored or shared.
            </p>
          </div>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={isVerifying}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-slate-800 px-6 py-4 text-lg font-medium text-white transition-all hover:bg-slate-700 disabled:opacity-50"
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

        <p className="mt-4 text-center text-sm text-gray-500">
          Powered by Worldcoin
        </p>
      </div>
    </div>
  );
}
