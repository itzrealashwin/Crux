import React from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";

export function StatCard({ label, value, change, trendingUp, icon: Icon }) {
  return (
    <Card className="relative overflow-hidden border-border/60 bg-card transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {label}
            </p>
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {value}
            </p>
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold ${
                  trendingUp
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                }`}
              >
                {trendingUp ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {change}
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-foreground/5">
            <Icon className="h-5 w-5 text-foreground/80" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
