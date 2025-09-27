"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArbitrageOpportunity } from "@/types";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { FiClock, FiZap, FiArrowRight } from "react-icons/fi";
import { useState, useEffect } from "react";

interface OpportunityCardProps {
  opportunity: ArbitrageOpportunity;
  onExecute?: (opportunityId: string) => void;
  isExecuting?: boolean;
}

export function OpportunityCard({
  opportunity,
  onExecute,
  isExecuting,
}: OpportunityCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(opportunity.expiresAt).getTime();
      const difference = expiry - now;

      if (difference > 0) {
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60),
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      } else {
        setTimeLeft("Expired");
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [opportunity.expiresAt]);

  const isExpired = timeLeft === "Expired";
  const chainName =
    opportunity.chainId === 8453
      ? "Base"
      : opportunity.chainId === 10
        ? "Optimism"
        : "Ethereum";

  return (
    <Card
      className={`w-full transition-all duration-200 hover:shadow-lg ${isExpired ? "opacity-60" : ""}`}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">
              {opportunity.tokenA}/{opportunity.tokenB}
            </span>
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
              {chainName}
            </span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">
              {formatPercentage(opportunity.profitPercentage)}
            </div>
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <FiClock className="h-3 w-3" />
              {timeLeft}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
          <div className="text-center">
            <p className="text-muted-foreground text-xs">{opportunity.dexA}</p>
            <p className="font-semibold">
              {formatCurrency(opportunity.priceA)}
            </p>
          </div>
          <FiArrowRight className="text-muted-foreground h-4 w-4" />
          <div className="text-center">
            <p className="text-muted-foreground text-xs">{opportunity.dexB}</p>
            <p className="font-semibold">
              {formatCurrency(opportunity.priceB)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Est. Profit:</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(opportunity.profit)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Gas Cost:</span>
            <span className="font-semibold">${opportunity.gasEstimate}</span>
          </div>
        </div>

        <Button
          onClick={() => onExecute?.(opportunity.id)}
          className="w-full"
          variant="default"
          disabled={isExpired || isExecuting}
        >
          {isExecuting ? (
            <div className="flex items-center gap-2">
              <FiZap className="h-4 w-4 animate-spin" />
              Executing...
            </div>
          ) : isExpired ? (
            "Opportunity Expired"
          ) : (
            <div className="flex items-center gap-2">
              <FiZap className="h-4 w-4" />
              Execute Arbitrage
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
