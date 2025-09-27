"use client";

import { Button } from "@/components/ui/Button";

interface WorldIDConnectProps {
  onSuccess?: () => void;
}

export function WorldIDConnect({ onSuccess }: WorldIDConnectProps) {
  // TODO: Implement WorldCoin IDKit integration
  // - Install @worldcoin/idkit package
  // - Setup IDKitWidget with app_id from env
  // - Handle verification flow with backend
  
  const handleConnect = () => {
    // Placeholder for WorldCoin verification
    console.log("WorldCoin verification would happen here");
    onSuccess?.();
  };

  return (
    <Button onClick={handleConnect} className="w-full">
      Verify with World ID
    </Button>
  );
}
