import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  Briefcase as BriefcaseIcon,
  CheckCircle2,
  Download,
  FileCheck,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card.jsx";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";

import {
  useRecentPlacements,
  useStats,
  useDepartmentPlacementRates,
  useApplicationStageCounts,
  useProfileVerificationCounts,
  usePackageComparison,
} from "@/features/admin/hooks/useDashboard.js";
import { useAllJobs } from "@/features/jobs/hooks/useJobs.js";

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatDate = (dateString) => {
  if (!dateString) return "TBD";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "TBD";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return "recently";
  const time = new Date(dateString).getTime();
  if (!Number.isFinite(time)) return "recently";

  const diffMs = Date.now() - time;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
};

const getPercent = (value, total) => {
  if (!total) return 0;
  return Math.round((value / total) * 100);
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const { data: dashboardData, isLoading: statsLoading } = useStats();
  const { data: jobsResponse, isLoading: jobsLoading } = useAllJobs();
  const { data: placementsData } = useRecentPlacements();
  const { data: departmentRatesData } = useDepartmentPlacementRates();
  const { data: stageCountsData } = useApplicationStageCounts();
  const { data: profileVerificationData } = useProfileVerificationCounts(80);
  const { data: packageComparisonData } = usePackageComparison();

  const summary = useMemo(
    () => dashboardData?.data?.summary || dashboardData?.summary || {},
    [dashboardData],
  );

  const allJobs = useMemo(() => {
    if (Array.isArray(jobsResponse?.data?.jobs)) return jobsResponse.data.jobs;
    if (Array.isArray(jobsResponse?.jobs)) return jobsResponse.jobs;
    return [];
  }, [jobsResponse]);

  const openJobs = useMemo(
    () => allJobs.filter((job) => job?.status === "OPEN"),
    [allJobs],
  );

  const placements = useMemo(
    () => (Array.isArray(placementsData) ? placementsData : []),
    [placementsData],
  );

  const departmentPlacementRates = useMemo(
    () => (Array.isArray(departmentRatesData) ? departmentRatesData : []),
    [departmentRatesData],
  );

  const interviewCountFromApi = toNumber(stageCountsData?.interviewCount, null);

  const profileVerificationCounts = profileVerificationData || {};
  const packageComparison = packageComparisonData || {};

  const computed = useMemo(() => {
    const totalApplied = allJobs.reduce(
      (acc, job) => acc + toNumber(job?.stats?.totalApplications),
      0,
    );
    const totalEligible = allJobs.reduce(
      (acc, job) => acc + toNumber(job?.stats?.eligible),
      0,
    );
    const totalShortlisted = allJobs.reduce(
      (acc, job) => acc + toNumber(job?.stats?.shortlisted),
      0,
    );
    const totalSelected = allJobs.reduce(
      (acc, job) => acc + toNumber(job?.stats?.selected),
      0,
    );
    const totalHired = allJobs.reduce(
      (acc, job) => acc + toNumber(job?.stats?.hired),
      0,
    );
    const inferredInterview = Math.max(totalShortlisted - totalSelected, 0);
    const inInterview = Number.isFinite(interviewCountFromApi)
      ? interviewCountFromApi
      : inferredInterview;

    const now = new Date();
    const closingSoonCount = openJobs.filter((job) => {
      if (!job?.deadline) return false;
      const days = Math.ceil((new Date(job.deadline) - now) / 86400000);
      return days >= 0 && days <= 7;
    }).length;

    const nearestClosingJob = [...openJobs]
      .filter((job) => job?.deadline && new Date(job.deadline) >= new Date())
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0];

    const pendingReviewCount = Math.max(totalApplied - totalShortlisted, 0);
    const pendingOffers = Math.max(totalSelected - totalHired, 0);
    const drivesWithoutTimeline = openJobs.filter(
      (job) => !job?.driveTimeline?.length,
    ).length;

    const studentsTotal = toNumber(summary.students?.value);
    const placementRate = toNumber(summary.placementRate?.value);
    const studentsPlaced =
      studentsTotal && placementRate
        ? Math.round((studentsTotal * placementRate) / 100)
        : totalHired;

    const packages = allJobs
      .map((job) => toNumber(job?.packageLPA, null))
      .filter((value) => value !== null);
    const avgPackage = packages.length
      ? (
          packages.reduce((acc, value) => acc + value, 0) / packages.length
        ).toFixed(1)
      : null;

    const highestOfferJob = [...allJobs]
      .filter((job) => toNumber(job?.packageLPA, null) !== null)
      .sort((a, b) => toNumber(b?.packageLPA) - toNumber(a?.packageLPA))[0];

    const companiesVisited = new Set(
      allJobs.map((job) => job?.company?.name).filter(Boolean),
    ).size;
    const offerAcceptRate = getPercent(totalHired, totalSelected);

    return {
      totalApplied,
      totalEligible,
      totalShortlisted,
      totalSelected,
      totalHired,
      inInterview,
      closingSoonCount,
      nearestClosingJob,
      pendingReviewCount,
      pendingOffers,
      drivesWithoutTimeline,
      studentsPlaced,
      studentsTotal,
      placementRate,
      avgPackage,
      highestOfferJob,
      companiesVisited,
      offerAcceptRate,
    };
  }, [allJobs, openJobs, summary, interviewCountFromApi]);

  const todayLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const needsAction = [
    {
      text: "Applications pending shortlist",
      count: computed.pendingReviewCount,
      color: "bg-red-500/10 text-red-500",
      onClick: () => navigate("/admin/applications"),
    },
    {
      text: "Offers pending final response",
      count: computed.pendingOffers,
      color: "bg-amber-500/10 text-amber-500",
      onClick: () => navigate("/admin/applications"),
    },
    {
      text: "Drives closing in 7 days",
      count: computed.closingSoonCount,
      color: "bg-blue-500/10 text-blue-500",
      onClick: () => navigate("/admin/jobs"),
    },
    {
      text: "Open drives without timeline",
      count: computed.drivesWithoutTimeline,
      color: "bg-blue-500/10 text-blue-500",
      onClick: () => navigate("/admin/jobs"),
    },
    {
      text: "Students with incomplete profiles",
      count: toNumber(
        profileVerificationCounts.studentsWithIncompleteProfiles,
        0,
      ),
      color: "bg-blue-500/10 text-blue-500",
      onClick: () => navigate("/admin/students"),
    },
    {
      text: "Accounts pending verification",
      count: toNumber(profileVerificationCounts.accountsPendingVerification, 0),
      color: "bg-blue-500/10 text-blue-500",
      onClick: () => navigate("/admin/students"),
    },
  ].filter((item) => item.count > 0);

  if (statsLoading || jobsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-20 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Admin dashboard
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {todayLabel} • Live placement overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="bg-transparent border-border text-foreground hover:bg-accent"
            onClick={() => navigate("/admin/analytics")}
          >
            Analytics <ArrowUpRight className="w-4 h-4 ml-1.5 opacity-70" />
          </Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => navigate("/admin/jobs/new")}
          >
            + Post new drive
          </Button>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3 w-full">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-amber-500 font-medium">
              {computed.pendingReviewCount} applications need review
              {computed.nearestClosingJob
                ? ` — ${computed.nearestClosingJob.company?.name || "Upcoming drive"} closes on ${formatDate(computed.nearestClosingJob.deadline)}.`
                : "."}
            </p>
          </div>
        </div>
        <Button
          variant="link"
          className="text-amber-500 hover:text-amber-600 p-0 h-auto font-medium whitespace-nowrap"
          onClick={() => navigate("/admin/applications")}
        >
          Review now →
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card border-border shadow-sm rounded-xl">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Students placed
            </p>
            <h3 className="text-3xl font-bold text-foreground mb-2">
              {computed.studentsPlaced}
            </h3>
            <p className="text-[10px] text-muted-foreground font-medium">
              {computed.placementRate.toFixed(1)}% of batch ·{" "}
              <span className="text-emerald-500">
                {toNumber(summary.placementRate?.change, 0)}% MoM
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-xl">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Active drives
            </p>
            <h3 className="text-3xl font-bold text-foreground mb-2">
              {toNumber(summary.activeJobs?.value, openJobs.length)}
            </h3>
            <p className="text-[10px] text-muted-foreground font-medium">
              {computed.closingSoonCount} closing in 7 days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-amber-500/30 shadow-sm rounded-xl">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Pending review
            </p>
            <h3 className="text-3xl font-bold text-amber-500 mb-2">
              {computed.pendingReviewCount}
            </h3>
            <p className="text-[10px] text-amber-500/80 font-medium">
              Derived from applied vs shortlisted
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-xl">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Registered students
            </p>
            <h3 className="text-3xl font-bold text-foreground mb-2">
              {toNumber(summary.students?.value, 0)}
            </h3>
            <p className="text-[10px] text-muted-foreground font-medium">
              {toNumber(summary.students?.change, 0)}% vs last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-xl">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Offers pending
            </p>
            <h3 className="text-3xl font-bold text-red-500 mb-2">
              {computed.pendingOffers}
            </h3>
            <p className="text-[10px] text-muted-foreground font-medium">
              {computed.offerAcceptRate}% offer accept rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-3 md:grid-cols-6 divide-x divide-border text-center">
            <div className="p-5">
              <h4 className="text-2xl font-bold text-foreground">
                {computed.totalApplied}
              </h4>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                Applied
              </p>
              <p className="text-[10px] text-emerald-500 mt-1">all drives</p>
            </div>
            <div className="p-5">
              <h4 className="text-2xl font-bold text-foreground">
                {computed.totalEligible}
              </h4>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                Eligible
              </p>
              <p className="text-[10px] text-emerald-500 mt-1">
                {getPercent(computed.totalEligible, computed.totalApplied)}%
                pass rate
              </p>
            </div>
            <div className="p-5">
              <h4 className="text-2xl font-bold text-foreground">
                {computed.totalShortlisted}
              </h4>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                Shortlisted
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {getPercent(computed.totalShortlisted, computed.totalEligible)}%
                of eligible
              </p>
            </div>
            <div className="p-5">
              <h4 className="text-2xl font-bold text-foreground">
                {computed.inInterview}
              </h4>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                In interview
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {getPercent(computed.inInterview, computed.totalShortlisted)}%
                of shortlisted
              </p>
            </div>
            <div className="p-5 bg-emerald-500/5">
              <h4 className="text-2xl font-bold text-foreground">
                {computed.totalSelected}
              </h4>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                Selected
              </p>
              <p className="text-[10px] text-emerald-500 mt-1">
                {getPercent(computed.totalSelected, computed.totalShortlisted)}%
                conversion
              </p>
            </div>
            <div className="p-5 bg-emerald-500/5">
              <h4 className="text-2xl font-bold text-foreground">
                {computed.totalHired}
              </h4>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                Hired
              </p>
              <p className="text-[10px] text-emerald-500 mt-1">
                {computed.offerAcceptRate}% accept rate
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-card border-border shadow-sm rounded-xl">
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Active drives
              </CardTitle>
              <Button
                variant="link"
                className="text-xs text-muted-foreground hover:text-foreground p-0 h-auto"
                onClick={() => navigate("/admin/jobs")}
              >
                View all →
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {openJobs.slice(0, 5).map((job, idx) => (
                  <div
                    key={job.jobCode || idx}
                    className="p-6 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/jobs/${job.jobCode}`)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-emerald-500" />
                      <div>
                        <h4 className="text-sm font-semibold text-foreground leading-tight mb-1">
                          {job.company?.name || "Company"} · {job.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {toNumber(job?.stats?.totalApplications)} applicants ·
                          Deadline {formatDate(job.deadline)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="font-normal text-[10px] px-2.5 py-0.5 rounded-full border-transparent whitespace-nowrap bg-emerald-500/10 text-emerald-500"
                    >
                      Open
                    </Badge>
                  </div>
                ))}
                {!openJobs.length && (
                  <p className="p-6 text-xs text-muted-foreground">
                    No open drives available.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm rounded-xl">
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Dept placement rate
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="h-8 bg-transparent border-border text-xs"
                onClick={() => navigate("/admin/jobs")}
              >
                Full analytics →
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {departmentPlacementRates.slice(0, 6).map((item) => {
                const rate = toNumber(item.placementRate, 0);
                const barColor =
                  rate >= 50
                    ? "bg-emerald-500"
                    : rate >= 30
                      ? "bg-amber-500"
                      : "bg-red-500";

                return (
                  <div key={item.department}>
                    <div className="flex justify-between text-xs font-medium mb-2">
                      <span className="text-muted-foreground">
                        {item.department}
                      </span>
                      <span className="text-foreground">
                        {rate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full`}
                        style={{ width: `${Math.min(rate, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {!departmentPlacementRates.length && (
                <p className="text-xs text-muted-foreground">
                  No department placement analytics available.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-card border-border shadow-sm rounded-xl">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-sm font-semibold text-foreground">
                Needs action
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {needsAction.map((action, i) => (
                  <div
                    key={i}
                    className="p-4 px-6 flex items-center justify-between hover:bg-muted/50 cursor-pointer group"
                    onClick={action.onClick}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${action.color.split(" ")[1].replace("text-", "bg-")}`}
                      />
                      <p className="text-xs font-medium text-foreground max-w-[200px] leading-snug">
                        {action.text}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        className={`rounded-full px-2 h-5 font-bold border-transparent ${action.color}`}
                      >
                        {action.count}
                      </Badge>
                      <ArrowUpRight className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                ))}
                {!needsAction.length && (
                  <p className="p-6 text-xs text-muted-foreground">
                    No urgent actions from current API signals.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm rounded-xl">
            <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Recent placements
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="h-8 bg-transparent border-border text-xs"
                onClick={() => navigate("/admin/applications")}
              >
                View applications →
              </Button>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-4">
                {placements.map((placement) => (
                  <div key={placement._id} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 mt-0.5">
                      <AvatarImage
                        src={placement.avatar}
                        alt={placement.studentName}
                      />
                      <AvatarFallback>
                        {placement.studentName?.slice(0, 2)?.toUpperCase() ||
                          "ST"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground leading-snug">
                        {placement.studentName} • {placement.company}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {placement.role} • {placement.package} •{" "}
                        {formatRelativeTime(placement.hiredAt)}
                      </p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                  </div>
                ))}
                {!placements.length && (
                  <p className="text-xs text-muted-foreground">
                    No recent placements from API.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-card border-border shadow-sm rounded-xl">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-sm font-semibold text-foreground">
                Placement summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 border border-border p-4 rounded-xl">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase mb-1">
                    Avg package
                  </p>
                  <p className="text-lg font-bold text-foreground mb-1">
                    {toNumber(
                      packageComparison?.averagePackage?.currentYear,
                      null,
                    ) !== null
                      ? `${toNumber(packageComparison?.averagePackage?.currentYear, 0)} LPA`
                      : computed.avgPackage
                        ? `${computed.avgPackage} LPA`
                        : "N/A"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {`${toNumber(packageComparison?.averagePackage?.change, 0) > 0 ? "+" : ""}${toNumber(packageComparison?.averagePackage?.change, 0)}% ${packageComparison?.averagePackage?.label || packageComparison?.comparisonLabel || "vs last year"}`}
                  </p>
                </div>
                <div className="bg-muted/50 border border-border p-4 rounded-xl">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase mb-1">
                    Highest offer
                  </p>
                  <p className="text-lg font-bold text-foreground mb-1">
                    {toNumber(
                      packageComparison?.highestPackage?.currentYear,
                      null,
                    ) !== null
                      ? `${toNumber(packageComparison?.highestPackage?.currentYear, 0)} LPA`
                      : computed.highestOfferJob
                        ? `${toNumber(computed.highestOfferJob.packageLPA)} LPA`
                        : "N/A"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {`${toNumber(packageComparison?.highestPackage?.change, 0) > 0 ? "+" : ""}${toNumber(packageComparison?.highestPackage?.change, 0)}% ${packageComparison?.highestPackage?.label || packageComparison?.comparisonLabel || "vs last year"}`}
                  </p>
                </div>
                <div className="bg-muted/50 border border-border p-4 rounded-xl">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase mb-1">
                    Companies visited
                  </p>
                  <p className="text-lg font-bold text-foreground mb-1">
                    {computed.companiesVisited}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {openJobs.length} still active
                  </p>
                </div>
                <div className="bg-muted/50 border border-border p-4 rounded-xl">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase mb-1">
                    Offer accept rate
                  </p>
                  <p className="text-lg font-bold text-foreground mb-1">
                    {computed.offerAcceptRate}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {computed.pendingOffers} pending
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground pl-1">
              Quick actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div
                className="bg-card border border-border p-5 rounded-xl hover:bg-muted transition-colors cursor-pointer group flex flex-col items-center justify-center text-center gap-2"
                onClick={() => navigate("/admin/jobs/new")}
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                  <BriefcaseIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Post new drive
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Create job listing
                  </p>
                </div>
              </div>
              <div
                className="bg-card border border-border p-5 rounded-xl hover:bg-muted transition-colors cursor-pointer group flex flex-col items-center justify-center text-center gap-2"
                onClick={() => navigate("/admin/applications")}
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Review apps
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {computed.pendingReviewCount} waiting
                  </p>
                </div>
              </div>
              <div
                className="bg-card border border-border p-5 rounded-xl hover:bg-muted transition-colors cursor-pointer group flex flex-col items-center justify-center text-center gap-2"
                onClick={() => navigate("/admin/students")}
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Student list
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {toNumber(summary.students?.value, 0)} registered
                  </p>
                </div>
              </div>
              <div className="bg-card border border-border p-5 rounded-xl hover:bg-muted transition-colors cursor-pointer group flex flex-col items-center justify-center text-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Export report
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    CSV · semester data
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
