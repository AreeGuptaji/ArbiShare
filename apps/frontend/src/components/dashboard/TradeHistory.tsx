"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Trade } from "@/types";
import { formatCurrency, truncateAddress } from "@/lib/utils";

interface TradeHistoryProps {
  trades: Trade[];
}

export function TradeHistory({ trades }: TradeHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Trades</CardTitle>
      </CardHeader>
      <CardContent>
        {trades.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No trades yet. Execute your first arbitrage!
          </p>
        ) : (
          <div className="space-y-3">
            {trades.map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="space-y-1">
                  <p className="font-medium">
                    {truncateAddress(trade.txHash)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(trade.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="text-right space-y-1">
                  <p className={`font-semibold ${
                    trade.status === "success" 
                      ? "text-green-600" 
                      : trade.status === "failed" 
                      ? "text-red-600" 
                      : "text-yellow-600"
                  }`}>
                    {formatCurrency(trade.profit)}
                  </p>
                  <p className="text-sm capitalize text-muted-foreground">
                    {trade.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
