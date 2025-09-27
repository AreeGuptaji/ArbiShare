"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/trpc";
import { ArbitrageOpportunity } from "@/types";

export function useArbitrage() {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>(
    [],
  );
  const [loadingOpportunities, setLoadingOpportunities] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const data = await api.arbitrage.getOpportunities();
        setOpportunities(data);
      } catch (error) {
        console.error("Failed to fetch opportunities:", error);
      } finally {
        setLoadingOpportunities(false);
      }
    };

    fetchOpportunities();
    // Refresh opportunities every 30 seconds
    const interval = setInterval(fetchOpportunities, 30000);
    return () => clearInterval(interval);
  }, []);

  const executeArbitrage = async (opportunityId: string) => {
    setIsExecuting(true);
    try {
      const result = await api.arbitrage.executeArbitrage(opportunityId);
      console.log("Arbitrage executed:", result);
      // Remove executed opportunity from list
      setOpportunities((prev) =>
        prev.filter((opp) => opp.id !== opportunityId),
      );
    } catch (error) {
      console.error("Arbitrage execution failed:", error);
    } finally {
      setIsExecuting(false);
    }
  };

  return {
    opportunities,
    loadingOpportunities,
    executeArbitrage,
    isExecuting,
  };
}
