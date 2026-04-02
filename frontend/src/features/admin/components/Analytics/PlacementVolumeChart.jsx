import React from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  linearGradient 
} from "recharts";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/shared/ui/card";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/shared/ui/chart";

export function PlacementVolumeChart({ data }) {
  return (
    <Card className="xl:col-span-2 border-border/60 bg-card shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Placement Volume</CardTitle>
        <CardDescription>
          Monthly hired count over the past 6 months
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[260px]">
        <ChartContainer 
          config={{ placements: { label: "Hired", color: "hsl(var(--primary))" } }} 
          className="h-full w-full"
        >
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="fillPlacements" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-placements)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-placements)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="month" 
              tickLine={false} 
              axisLine={false} 
              tickMargin={10} 
              tick={{ fontSize: 12 }} 
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tickMargin={10} 
              tick={{ fontSize: 12 }} 
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="placements"
              stroke="var(--color-placements)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#fillPlacements)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
