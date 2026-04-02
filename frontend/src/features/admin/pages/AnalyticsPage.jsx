import React, { useMemo } from "react";
import {
  Users,
  Briefcase,
  UserCheck,
  TrendingUp,
  Loader2,
  BarChart3,
} from "lucide-react";

// Hooks
import {
  useStats,
  useDepartmentPlacementRates,
  usePackageComparison,
  useApplicationStageCounts,
  useProfileVerificationCounts,
} from "@/features/admin/hooks/useDashboard.js";

// Components
import { StatCard } from "../components/Analytics/StatCard";
import { PlacementVolumeChart } from "../components/Analytics/PlacementVolumeChart";
import { HiringFunnelChart } from "../components/Analytics/HiringFunnelChart";
import { DepartmentPerformanceChart } from "../components/Analytics/DepartmentPerformanceChart";
import { StudentDistributionChart } from "../components/Analytics/StudentDistributionChart";
import { SalaryAndProfileInsights } from "../components/Analytics/SalaryAndProfileInsights";

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (n) => (Number.isFinite(Number(n)) ? Number(n) : 0);

// Dynamic monochrome shades using shadcn's foreground variable
const THEME_SHADES = [
  "hsl(var(--foreground) / 1)",    // Solid
  "hsl(var(--foreground) / 0.8)",  // 80% opacity
  "hsl(var(--foreground) / 0.6)",  // 60% opacity
  "hsl(var(--foreground) / 0.4)",  // 40% opacity
  "hsl(var(--foreground) / 0.2)",  // 20% opacity
];

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { data: dashboardData,   isLoading: isStatsLoading   } = useStats();
  const { data: departmentRatesData, isLoading: isDeptLoading    } = useDepartmentPlacementRates();
  const { data: packageComparisonData, isLoading: isPackageLoading } = usePackageComparison();
  const { data: stageCountsData, isLoading: isStageLoading   } = useApplicationStageCounts();
  const { data: profileVerData,  isLoading: isProfileLoading } = useProfileVerificationCounts();

  const isLoading =
    isStatsLoading || isDeptLoading || isPackageLoading || isStageLoading || isProfileLoading;

  // ── parse ──────────────────────────────────────────────────────────────────
  const summary        = dashboardData?.data?.summary    || dashboardData?.summary    || {};
  const packageMetrics = packageComparisonData?.data      || packageComparisonData     || {};
  const avgPkg         = packageMetrics.averagePackage    || {};
  const highPkg        = packageMetrics.highestPackage    || {};

  const statsList = useMemo(
    () => [
      {
        label: "Total Applications",
        value: fmt(summary.applications?.value).toLocaleString(),
        change: `${summary.applications?.change > 0 ? "+" : ""}${fmt(summary.applications?.change)}%`,
        trendingUp: (summary.applications?.change ?? 0) >= 0,
        icon: Briefcase,
      },
      {
        label: "Active Students",
        value: fmt(summary.students?.value).toLocaleString(),
        change: `${summary.students?.change > 0 ? "+" : ""}${fmt(summary.students?.change)}%`,
        trendingUp: (summary.students?.change ?? 0) >= 0,
        icon: Users,
      },
      {
        label: "Placement Rate",
        value: `${fmt(summary.placementRate?.value)}%`,
        change: `${summary.placementRate?.change > 0 ? "+" : ""}${fmt(summary.placementRate?.change)}%`,
        trendingUp: (summary.placementRate?.change ?? 0) >= 0,
        icon: UserCheck,
      },
      {
        label: "Avg. Salary (LPA)",
        value: `₹${fmt(avgPkg.currentYear).toFixed(1)}L`,
        change: `${fmt(avgPkg.change) > 0 ? "+" : ""}${fmt(avgPkg.change)}%`,
        trendingUp: fmt(avgPkg.change) >= 0,
        icon: TrendingUp,
      },
    ],
    [summary, avgPkg]
  );

  // ── area chart data ────────────────────────────────────────────────────────
  const rawChartData = dashboardData?.data?.chartData || dashboardData?.chartData || [];
  const areaData = useMemo(
    () => rawChartData.map((d) => ({ month: d.month, placements: fmt(d.placements) })),
    [rawChartData]
  );

  // ── department bar chart ───────────────────────────────────────────────────
  const rawDeptData = Array.isArray(departmentRatesData) ? departmentRatesData : [];
  const deptRateData = useMemo(
    () =>
      [...rawDeptData]
        .sort((a, b) => b.placementRate - a.placementRate)
        .slice(0, 5)
        .map((d) => ({ department: d.department, rate: d.placementRate })),
    [rawDeptData]
  );

  // ── pie chart ──────────────────────────────────────────────────────────────
  const pieData = useMemo(() => {
    const sorted = [...rawDeptData].sort((a, b) => b.totalStudents - a.totalStudents);
    const top    = sorted.slice(0, 4);
    const rest   = sorted.slice(4).reduce((s, d) => s + d.totalStudents, 0);
    const items  = top.map((d, i) => ({
      category: d.department || "Unknown",
      students: d.totalStudents,
      fill: THEME_SHADES[i],
    }));
    if (rest > 0) items.push({ category: "Other", students: rest, fill: THEME_SHADES[4] });
    return items;
  }, [rawDeptData]);

  // ── funnel ─────────────────────────────────────────────────────────────────
  const funnelData = useMemo(() => {
    const c = stageCountsData?.data?.statusBreakdown || stageCountsData?.statusBreakdown || {};
    return [
      { stage: "Applied",     count: fmt(c.APPLIED),     fill: THEME_SHADES[0] },
      { stage: "Shortlisted", count: fmt(c.SHORTLISTED), fill: THEME_SHADES[1] },
      { stage: "Interview",   count: fmt(c.INTERVIEW),   fill: THEME_SHADES[2] },
      { stage: "Selected",    count: fmt(c.SELECTED),    fill: THEME_SHADES[3] },
      { stage: "Hired",       count: fmt(c.HIRED),       fill: THEME_SHADES[4] },
    ];
  }, [stageCountsData]);

  const profileStats = profileVerData?.data || profileVerData || {};

  // ─────────────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-foreground/50" />
      </div>
    );
  }

  return (
    <div className="space-y-8 px-2 pb-8">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/10">
            <BarChart3 className="h-5 w-5 text-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Analytics
          </h1>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Placement performance, salary trends, and student engagement across your institution.
        </p>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsList.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* ── Row 1: Area chart + Funnel ──────────────────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-3">
        <PlacementVolumeChart data={areaData} />
        <HiringFunnelChart data={funnelData} />
      </div>

      {/* ── Row 2: Dept bar + Pie + Salary/Profile cards ────────────────── */}
      <div className="grid gap-6 lg:grid-cols-12">
        <DepartmentPerformanceChart data={deptRateData} />
        <StudentDistributionChart data={pieData} />
        <SalaryAndProfileInsights 
          highPkg={highPkg} 
          avgPkg={avgPkg} 
          profileStats={profileStats} 
        />
      </div>
    </div>
  );
}
