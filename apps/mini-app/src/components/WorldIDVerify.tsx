"use client";
import {
  MiniKit,
  type VerifyCommandInput,
  VerificationLevel,
  type ISuccessResult,
} from "@worldcoin/minikit-js";
import { useState } from "react";
import { FiShield, FiCheck } from "react-icons/fi";

interface WorldIDVerifyParams {
  setIsVerified: React.Dispatch<React.SetStateAction<boolean>>;
}

interface VerifyResponse {
  verifyRes: {
    success: boolean;
  };
  status: number;
  error?: string;
  message?: string;
}

export function WorldIDVerify({ setIsVerified }: WorldIDVerifyParams) {
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyPayload: VerifyCommandInput = {
    action: "app-entry action",
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
      const verifyResponse = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: finalPayload as ISuccessResult, // Parses only the fields we need to verify
          action: "app-entry action",
        }),
      });

      const verifyResponseJson =
        (await verifyResponse.json()) as VerifyResponse;

      console.log("API Response:", verifyResponseJson);
      console.log("HTTP Status:", verifyResponse.status);

      if (verifyResponse.ok && verifyResponseJson.status === 200) {
        console.log("Verification successful!");
        setIsVerified(true);
      } else {
        console.log(
          "Verification failed:",
          verifyResponseJson.error ?? verifyResponseJson.message,
        );
        // Handle verification failure
      }
    } catch (error) {
      console.error("Verification process error:", error);
    } finally {
      setIsVerifying(false);
    }
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
