"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { UserStats as UserStatsType } from "@/types";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import {
  FiTrendingUp,
  FiActivity,
  FiAward,
  FiDollarSign,
} from "react-icons/fi";

interface UserStatsProps {
  stats: UserStatsType;
}

export function UserStats({ stats }: UserStatsProps) {
  const statCards = [
    {
      title: "Total Profit",
      value: formatCurrency(stats.totalProfit),
      icon: FiDollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Trades",
      value: stats.totalTrades.toString(),
      icon: FiActivity,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Success Rate",
      value: formatPercentage(stats.successRate),
      icon: FiTrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Global Rank",
      value: `#${stats.rank}`,
      icon: FiAward,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
