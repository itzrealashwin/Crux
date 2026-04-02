import React from "react";
import { 
  Building2, 
  FileCheck2 
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/shared/ui/card";

const fmt = (n) => (Number.isFinite(Number(n)) ? Number(n) : 0);

export function SalaryAndProfileInsights({ highPkg, avgPkg, profileStats }) {
  return (
    <div className="lg:col-span-4 flex flex-col gap-6">
      {/* Salary card */}
      <Card className="flex-1 border-border/60 bg-card shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2.5">
            <Building2 className="h-5 w-5 text-foreground" />
            <CardTitle className="text-lg font-semibold">Salary Highlights</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end justify-between rounded-xl bg-foreground/5 p-4 border border-foreground/10">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Highest Package</p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                ₹{fmt(highPkg.currentYear).toFixed(1)}L
              </p>
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                fmt(highPkg.change) >= 0
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/15 text-red-600 dark:text-red-400"
              }`}
            >
              {fmt(highPkg.change) > 0 ? "+" : ""}
              {fmt(highPkg.change)}% YoY
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-foreground/5 p-4 border border-foreground/10">
              <p className="text-sm font-medium text-muted-foreground">Avg Package</p>
              <p className="mt-1 text-xl font-bold text-foreground">
                ₹{fmt(avgPkg.currentYear).toFixed(1)}L
              </p>
            </div>
            <div className="rounded-xl bg-foreground/5 p-4 border border-foreground/10">
              <p className="text-sm font-medium text-muted-foreground">Total Offers</p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {fmt(avgPkg.offersCountCurrentYear)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                vs {fmt(avgPkg.offersCountPreviousYear)} last yr
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending profiles */}
      <Card className="border-border/60 bg-card shadow-sm">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
            <FileCheck2 className="h-6 w-6 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-foreground">
              {fmt(profileStats.studentsWithIncompleteProfiles)} pending profiles
            </p>
            <p className="text-sm text-muted-foreground">
              Students missing core data
            </p>
          </div>
          <span className="shrink-0 rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
            Action needed
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
