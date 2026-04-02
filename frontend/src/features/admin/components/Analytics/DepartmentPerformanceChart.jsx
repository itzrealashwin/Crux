import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Cell, 
  Tooltip 
} from "recharts";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/shared/ui/card";
import { Target } from "lucide-react";

const THEME_SHADES = [
  "hsl(var(--foreground) / 1)",
  "hsl(var(--foreground) / 0.8)",
  "hsl(var(--foreground) / 0.6)",
  "hsl(var(--foreground) / 0.4)",
  "hsl(var(--foreground) / 0.2)",
];

function SimpleTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md text-sm text-popover-foreground">
      {label && <p className="mb-1 font-medium text-xs text-muted-foreground">{label}</p>}
      
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm shrink-0"
            style={{ background: p.fill || p.stroke || p.color }}
          />
          {!label && p.name && (
            <span className="text-muted-foreground mr-1">{p.name}:</span>
          )}
          <span className="font-semibold">
            {formatter ? formatter(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function DepartmentPerformanceChart({ data }) {
  return (
    <Card className="lg:col-span-5 border-border/60 bg-card shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Top Departments</CardTitle>
            <CardDescription>By placement success rate</CardDescription>
          </div>
          <Target className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="department"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickMargin={12}
              tickFormatter={(v) => (v.length > 10 ? v.substring(0, 10) + "…" : v)}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => `${v}%`}
              tickMargin={12}
            />
            <Tooltip content={<SimpleTooltip formatter={(v) => `${v}%`} />} />
            <Bar 
              dataKey="rate" 
              radius={[4, 4, 0, 0]} 
              barSize={36} 
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={THEME_SHADES[i % THEME_SHADES.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
