import { useAccount, useBalance } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { formatEther } from "viem";

// Simple ETH price fetching (you can replace with your preferred price API)
interface CoinGeckoResponse {
  ethereum: {
    usd: number;
  };
}

async function fetchETHPrice(): Promise<number> {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as CoinGeckoResponse;
    return data.ethereum.usd;
  } catch (error) {
    console.error("Failed to fetch ETH price:", error);
    return 2000; // Fallback price
  }
}

export function useWalletBalance() {
  const { address, isConnected } = useAccount();

  // Fetch ETH balance
  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useBalance({
    address,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
    },
  });

  // Fetch ETH price
  const { data: ethPrice, isLoading: isPriceLoading } = useQuery({
    queryKey: ["ethPrice"],
    queryFn: fetchETHPrice,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 30000,
  });

  // Calculate USD value
  const ethBalance = balanceData
    ? parseFloat(formatEther(balanceData.value))
    : 0;
  const usdBalance = ethPrice ? ethBalance * ethPrice : 0;

  return {
    address,
    isConnected,
    ethBalance,
    usdBalance,
    ethPrice,
    isLoading: isBalanceLoading || isPriceLoading,
    refetchBalance,
    balanceData,
  };
}
