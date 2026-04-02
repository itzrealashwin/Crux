import React from "react";
import { 
  PieChart, 
  Pie, 
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

export function StudentDistributionChart({ data }) {
  return (
    <Card className="lg:col-span-3 border-border/60 bg-card shadow-sm">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg font-semibold">Students by Dept</CardTitle>
        <CardDescription>Enrollment distribution</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 pt-6">
        <PieChart width={180} height={180}>
          <Pie
            data={data}
            dataKey="students"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            stroke="none" 
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<SimpleTooltip />} />
        </PieChart>
        
        <div className="w-full space-y-2">
          {data.map((entry, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2.5">
                <span
                  className="inline-block h-3 w-3 rounded-[3px]"
                  style={{ background: entry.fill }}
                />
                <span className="truncate max-w-[110px] text-muted-foreground font-medium">
                  {entry.category}
                </span>
              </div>
              <span className="font-semibold tabular-nums text-foreground">
                {entry.students.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
