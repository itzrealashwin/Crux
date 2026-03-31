import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  FileCheck, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Calendar as CalendarIcon,
  MoreHorizontal,
  Minus,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Calendar,
  Briefcase as BriefcaseIcon
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card.jsx';
import { Button } from '@/shared/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';

// Hooks
import { useRecentPlacements, useStats } from '@/features/admin/hooks/useDashboard.js';
import { useAllJobs } from '@/features/jobs/hooks/useJobs.js'; // Ensure path is correct

export default function AdminDashboard() {
  const navigate = useNavigate();

  // --- 1. Fetch API Data ---
  const { data: dashboardData, isLoading: statsLoading } = useStats();
  const { data: jobsResponse, isLoading: jobsLoading } = useAllJobs();
  const { data: placementsData } = useRecentPlacements();

  // --- 2. Process Data ---
  const summary = dashboardData?.data?.summary || dashboardData?.summary || {};
  
  let activeJobs = [];
  if (jobsResponse?.data?.jobs) activeJobs = jobsResponse.data.jobs;
  else if (jobsResponse?.jobs) activeJobs = jobsResponse.jobs;

  // Aggregate stats from active jobs
  const totalApplied = activeJobs.reduce((acc, job) => acc + (job.stats?.totalApplications || 0), 0);
  const totalEligible = activeJobs.reduce((acc, job) => acc + (job.stats?.eligible || 0), 0);
  const totalShortlisted = activeJobs.reduce((acc, job) => acc + (job.stats?.shortlisted || 0), 0);
  const totalSelected = activeJobs.reduce((acc, job) => acc + (job.stats?.selected || 0), 0);
  const totalHired = activeJobs.reduce((acc, job) => acc + (job.stats?.hired || 0), 0);

  // Formatting helpers
  const formatDate = (dateString) => {
    if (!dateString || Object.keys(dateString).length === 0) return "TBD";
    return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  if (statsLoading || jobsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-20 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Admin dashboard</h2>
          <p className="text-muted-foreground text-sm mt-1">Monday, 16 Mar 2026 • Placement Officer • MCA</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-transparent border-border text-foreground hover:bg-accent">
            Analytics <ArrowUpRight className="w-4 h-4 ml-1.5 opacity-70" />
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate("/admin/jobs/new")}>
            + Post new drive
          </Button>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3 w-full">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-amber-500 font-medium">
              34 applications need review — Infosys Systems Engineer shortlist not released. Deadline: 18 Mar 2026.
            </p>
          </div>
        </div>
        <Button variant="link" className="text-amber-500 hover:text-amber-600 p-0 h-auto font-medium whitespace-nowrap">
          Review now →
        </Button>
      </div>

      {/* TOP METRICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card border-border shadow-sm rounded-xl">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground mb-2">Students placed</p>
            <h3 className="text-3xl font-bold text-foreground mb-2">87</h3>
            <p className="text-[10px] text-muted-foreground font-medium">
              34% of batch · <span className="text-emerald-500">+12 this week</span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border shadow-sm rounded-xl">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground mb-2">Active drives</p>
            <h3 className="text-3xl font-bold text-foreground mb-2">{summary.activeJobs?.value || activeJobs.length || 0}</h3>
            <p className="text-[10px] text-muted-foreground font-medium">3 closing in 7 days</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-amber-500/30 shadow-sm rounded-xl">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground mb-2">Pending review</p>
            <h3 className="text-3xl font-bold text-amber-500 mb-2">34</h3>
            <p className="text-[10px] text-amber-500/80 font-medium">Needs action today</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-xl">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground mb-2">Registered students</p>
            <h3 className="text-3xl font-bold text-foreground mb-2">{summary.students?.value || 256}</h3>
            <p className="text-[10px] text-muted-foreground font-medium">218 profiles complete</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-xl">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground mb-2">Offers pending</p>
            <h3 className="text-3xl font-bold text-red-500 mb-2">5</h3>
            <p className="text-[10px] text-muted-foreground font-medium">Response deadline soon</p>
          </CardContent>
        </Card>
      </div>

      {/* FUNNEL PIPELINE METRICS */}
      <Card className="bg-card border-border shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-3 md:grid-cols-6 divide-x divide-border text-center">
            <div className="p-5">
              <h4 className="text-2xl font-bold text-foreground">{totalApplied || 412}</h4>
              <p className="text-xs text-muted-foreground font-medium mt-1">Applied</p>
              <p className="text-[10px] text-emerald-500 mt-1">all drives</p>
            </div>
            <div className="p-5">
              <h4 className="text-2xl font-bold text-foreground">{totalEligible || 298}</h4>
              <p className="text-xs text-muted-foreground font-medium mt-1">Eligible</p>
              <p className="text-[10px] text-emerald-500 mt-1">72% pass rate</p>
            </div>
            <div className="p-5">
              <h4 className="text-2xl font-bold text-foreground">{totalShortlisted || 134}</h4>
              <p className="text-xs text-muted-foreground font-medium mt-1">Shortlisted</p>
              <p className="text-[10px] text-muted-foreground mt-1">45% of eligible</p>
            </div>
            <div className="p-5">
              <h4 className="text-2xl font-bold text-foreground">61</h4>
              <p className="text-xs text-muted-foreground font-medium mt-1">In interview</p>
              <p className="text-[10px] text-muted-foreground mt-1">46% of shortlisted</p>
            </div>
            <div className="p-5 bg-emerald-500/5">
              <h4 className="text-2xl font-bold text-foreground">{totalSelected || 92}</h4>
              <p className="text-xs text-muted-foreground font-medium mt-1">Selected</p>
              <p className="text-[10px] text-emerald-500 mt-1">+5 this week</p>
            </div>
            <div className="p-5 bg-emerald-500/5">
              <h4 className="text-2xl font-bold text-foreground">{totalHired || 87}</h4>
              <p className="text-xs text-muted-foreground font-medium mt-1">Hired</p>
              <p className="text-[10px] text-emerald-500 mt-1">94% accept rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BENTO GRID (Main layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COL (Active Drives & Dept Rate) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Drives */}
          <Card className="bg-card border-border shadow-sm rounded-xl">
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Active drives</CardTitle>
              <Button variant="link" className="text-xs text-muted-foreground hover:text-foreground p-0 h-auto" onClick={() => navigate("/admin/jobs")}>
                View all →
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {activeJobs.slice(0, 5).map((job, idx) => (
                  <div key={job.jobCode || idx} className="p-6 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/jobs/${job.jobCode}`)}>
                    <div className="flex items-start gap-4">
                      {/* Dynamic status dot */}
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        job.status === "OPEN" ? "bg-emerald-500" : 
                        job.status === "CLOSED" ? "bg-red-500" : "bg-amber-500"
                      }`} />
                      <div>
                        <h4 className="text-sm font-semibold text-foreground leading-tight mb-1">
                          {job.company?.name || "Company"} · {job.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {job.stats?.totalApplications || 0} applicants · Deadline {formatDate(job.deadline)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`font-normal text-[10px] px-2.5 py-0.5 rounded-full border-transparent whitespace-nowrap ${
                      job.status === "OPEN" ? "bg-emerald-500/10 text-emerald-500" : 
                      job.status === "CLOSED" ? "bg-red-500/10 text-red-500" : 
                      "bg-amber-500/10 text-amber-500"
                    }`}>
                      {job.status === "OPEN" ? "Open" : job.status === "CLOSED" ? "Closed" : "Closing soon"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dept placement rate */}
          <Card className="bg-card border-border shadow-sm rounded-xl">
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Dept placement rate</CardTitle>
              <Button variant="outline" size="sm" className="h-8 bg-transparent border-border text-xs">
                Full analytics →
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {[
                { dept: "B.Tech CS", rate: 52, color: "bg-emerald-500" },
                { dept: "B.Tech IT", rate: 41, color: "bg-emerald-500" },
                { dept: "MCA", rate: 38, color: "bg-emerald-500" },
                { dept: "MBA", rate: 29, color: "bg-amber-500" },
                { dept: "M.Tech", rate: 18, color: "bg-red-500" }
              ].map((d) => (
                <div key={d.dept}>
                  <div className="flex justify-between text-xs font-medium mb-2">
                    <span className="text-muted-foreground">{d.dept}</span>
                    <span className="text-foreground">{d.rate}%</span>
                  </div>
                  <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.rate}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>

        {/* MIDDLE COL (Needs Action & Recent Activity) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Needs Action */}
          <Card className="bg-card border-border shadow-sm rounded-xl">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-sm font-semibold text-foreground">Needs action</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {[
                  { text: "Applications pending shortlist — Infosys", count: 34, color: "bg-red-500/10 text-red-500" },
                  { text: "Offer response deadline expiring", count: 5, color: "bg-red-500/10 text-red-500" },
                  { text: "Drive timeline not updated — Wipro", count: 1, color: "bg-amber-500/10 text-amber-500" },
                  { text: "Students with incomplete profiles", count: 38, color: "bg-blue-500/10 text-blue-500" },
                  { text: "Accounts pending verification", count: 7, color: "bg-blue-500/10 text-blue-500" },
                ].map((action, i) => (
                  <div key={i} className="p-4 px-6 flex items-center justify-between hover:bg-muted/50 cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${action.color.split(' ')[1].replace('text-', 'bg-')}`} />
                      <p className="text-xs font-medium text-foreground max-w-[200px] leading-snug">{action.text}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`rounded-full px-2 h-5 font-bold border-transparent ${action.color}`}>{action.count}</Badge>
                      <ArrowUpRight className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-card border-border shadow-sm rounded-xl">
            <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Recent activity</CardTitle>
              <Button variant="outline" size="sm" className="h-8 bg-transparent border-border text-xs">
                Audit log →
              </Button>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="relative space-y-6 pl-4 before:absolute before:inset-y-2 before:left-[11px] before:w-px before:bg-border">
                
                <div className="relative flex gap-4 items-start">
                  <div className="absolute -left-6 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center ring-4 ring-card">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground leading-snug">Rahul Sharma — Selected · TCS</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">by you · 2 hours ago</p>
                  </div>
                </div>

                <div className="relative flex gap-4 items-start">
                  <div className="absolute -left-6 w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center ring-4 ring-card">
                    <XCircle className="w-3 h-3 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground leading-snug">12 applications rejected · Persistent (bulk)</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">by you · 3 hours ago</p>
                  </div>
                </div>

                <div className="relative flex gap-4 items-start">
                  <div className="absolute -left-6 w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center ring-4 ring-card">
                    <Calendar className="w-3 h-3 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground leading-snug">Drive timeline updated · Wipro aptitude test set</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">by you · Yesterday</p>
                  </div>
                </div>

                <div className="relative flex gap-4 items-start">
                  <div className="absolute -left-6 w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center ring-4 ring-card">
                    <BriefcaseIcon className="w-3 h-3 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground leading-snug">Capgemini drive published · 89 students notified</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">by you · Yesterday</p>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COL (Summary & Quick Actions) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Placement Summary */}
          <Card className="bg-card border-border shadow-sm rounded-xl">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-sm font-semibold text-foreground">Placement summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 border border-border p-4 rounded-xl">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase mb-1">Avg package</p>
                  <p className="text-lg font-bold text-foreground mb-1">6.2 LPA</p>
                  <p className="text-[10px] text-muted-foreground flex items-center"><ArrowUpRight className="w-3 h-3 mr-0.5" /> 0.4 vs last year</p>
                </div>
                <div className="bg-muted/50 border border-border p-4 rounded-xl">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase mb-1">Highest offer</p>
                  <p className="text-lg font-bold text-foreground mb-1">18 LPA</p>
                  <p className="text-[10px] text-muted-foreground">Google · 1 student</p>
                </div>
                <div className="bg-muted/50 border border-border p-4 rounded-xl">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase mb-1">Companies visited</p>
                  <p className="text-lg font-bold text-foreground mb-1">14</p>
                  <p className="text-[10px] text-muted-foreground">6 still active</p>
                </div>
                <div className="bg-muted/50 border border-border p-4 rounded-xl">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase mb-1">Offer accept rate</p>
                  <p className="text-lg font-bold text-foreground mb-1">94%</p>
                  <p className="text-[10px] text-muted-foreground">5 pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground pl-1">Quick actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-border p-5 rounded-xl hover:bg-muted transition-colors cursor-pointer group flex flex-col items-center justify-center text-center gap-2" onClick={() => navigate("/admin/jobs/new")}>
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                  <BriefcaseIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Post new drive</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Create job listing</p>
                </div>
              </div>
              <div className="bg-card border border-border p-5 rounded-xl hover:bg-muted transition-colors cursor-pointer group flex flex-col items-center justify-center text-center gap-2" onClick={() => navigate("/admin/applications")}>
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Review apps</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">34 waiting</p>
                </div>
              </div>
              <div className="bg-card border border-border p-5 rounded-xl hover:bg-muted transition-colors cursor-pointer group flex flex-col items-center justify-center text-center gap-2" onClick={() => navigate("/admin/students")}>
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Student list</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">256 registered</p>
                </div>
              </div>
              <div className="bg-card border border-border p-5 rounded-xl hover:bg-muted transition-colors cursor-pointer group flex flex-col items-center justify-center text-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Export report</p>
                  <p className="textB.Tech Department-[10px] text-muted-foreground mt-0.5">CSV · semester data</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}