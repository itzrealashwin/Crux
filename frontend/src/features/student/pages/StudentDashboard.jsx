import React, { useMemo } from "react";
import { useStudentProfile } from "@/features/student/hooks/useStudent.js";
import { useMyApplications } from "@/features/applications/hooks/useApplicaitions.js";
import { useAllJobs } from "@/features/jobs/hooks/useJobs.js"; // Adjust import path
import { useNotifications } from "@/features/notifications/hooks/useNotifications.js"; // Adjust import path
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  AlertCircle,
  ArrowRight,
  Bell,
} from "lucide-react";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

const StudentDashboard = () => {
  const navigate = useNavigate();

  // --- Fetch Data ---
  const { profile: studentDataResponse, isLoading: isLoadingProfile } = useStudentProfile();
  const studentData = studentDataResponse?.data || studentDataResponse;
  const { data: applicationsResponse, isLoading: isLoadingApps } = useMyApplications();
  const { data: jobsResponse, isLoading: isLoadingJobs } = useAllJobs({ limit: 5 }); // Fetch recent jobs
  const { data: notificationsResponse, isLoading: isLoadingNotifs } = useNotifications();

  // --- Process Data Safely ---
  const { stats, recentApps, jobs, notifications, upcomingDeadlines } = useMemo(() => {
    // Standardize arrays
    const apps = Array.isArray(applicationsResponse) ? applicationsResponse : applicationsResponse?.data || [];
    const jobsList = Array.isArray(jobsResponse?.data?.jobs) ? jobsResponse.data.jobs : (Array.isArray(jobsResponse?.jobs) ? jobsResponse.jobs : []);
    const notifsList = Array.isArray(notificationsResponse) ? notificationsResponse : notificationsResponse?.data || [];

    // Calculate Application Stats
    const activeApps = apps.filter(app => ["APPLIED", "SHORTLISTED", "INTERVIEW"].includes(app.status));
    const closedApps = apps.filter(app => ["SELECTED", "REJECTED", "HIRED"].includes(app.status));
    const shortlistedApps = apps.filter(app => ["SHORTLISTED", "INTERVIEW"].includes(app.status));

    // Get Company names for shortlisted subtitle
    const shortlistedCompanies = shortlistedApps
      .map(app => app.jobId?.company?.name || "Company")
      .slice(0, 2)
      .join(" · ");

    return {
      stats: {
        totalApps: apps.length,
        activeApps: activeApps.length,
        closedApps: closedApps.length,
        shortlisted: shortlistedApps.length,
        shortlistedText: shortlistedCompanies || "Keep applying!",
        newJobs: jobsList.length,
      },
      recentApps: [...apps].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4),
      jobs: jobsList.slice(0, 3),
      notifications: notifsList.slice(0, 4),
      upcomingDeadlines: jobsList.map(job => {
        let upcoming = { date: job.deadline, name: "Application close", isDriveTimeline: false };
        if (job.driveTimeline && job.driveTimeline.length > 0) {
          const nextStage = job.driveTimeline.find(s => !s.isDone && new Date(s.date) > new Date());
          if (nextStage) upcoming = { date: nextStage.date, name: nextStage.label || nextStage.key, isDriveTimeline: true };
        }
        return {
          id: job._id || job.jobCode,
          jobCode: job.jobCode,
          companyName: job.company?.name || "Company",
          title: job.title,
          ...upcoming
        };
      }).filter(job => job.date && new Date(job.date) >= new Date(new Date().setHours(0,0,0,0)))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3)
    };
  }, [applicationsResponse, jobsResponse, notificationsResponse]);

  // --- Loading State ---
  if (isLoadingProfile || isLoadingApps || isLoadingJobs || isLoadingNotifs) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getEligibilityStatus = (job) => {
    if (!studentData) return { status: "Not eligible", variant: "destructive" };
    
    const criteria = job.eligibility || {};
    
    // Hard blocks
    const deptEligible = !criteria.allowedDepartments?.length || criteria.allowedDepartments.includes(studentData.department);
    const cgpaEligible = !criteria.minCgpa || (studentData.cgpa >= criteria.minCgpa);
    const backlogEligible = criteria.maxBacklogs === undefined || (studentData.backlogs <= criteria.maxBacklogs);

    if (!deptEligible || !cgpaEligible || !backlogEligible) {
      return { status: "Not eligible", variant: "destructive" };
    }

    // Soft blocks (Skills)
    const jobSkills = job.skillsRequired || [];
    const studentSkills = studentData.skills || [];
    // Assuming skills are objects with name property, if they are populated, or strings if not.
    // Let's assume strings for this comparison based on previous codes, but we should be careful.
    const studentSkillNames = studentSkills.map(s => typeof s === 'string' ? s : s.name);
    const missingSkills = jobSkills.filter(skill => !studentSkillNames.includes(skill));

    if (missingSkills.length > 0) {
      return { status: "Skills gap", variant: "secondary" };
    }

    return { status: "Eligible", variant: "default" };
  };

  const getEligibilityBadgeStyle = (status) => {
    if (status === "Not eligible") return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
    if (status === "Skills gap") return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20";
    return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
  };

  const profileCompleteness = studentData?.profileCompleteness || 68; // Fallback to 68% like the image

  // Helper to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { day: 'numeric', month: 'short' };
    return new Intl.DateTimeFormat('en-GB', options).format(new Date(dateString));
  };

  return (
    <div className="space-y-6 pb-12 max-w-[1500px] mx-auto font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Good morning, {studentData?.firstName || "Student"}
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} 
            {" "}· {studentData?.department || "B.Tech"} · Batch {studentData?.graduationYear || "2026"}
          </p>
        </div>
      </div>

      {/* WARNING BANNER */}
      {profileCompleteness < 80 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3 w-full">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1 w-full">
              <p className="text-sm text-amber-500 font-medium">
                Your profile is {profileCompleteness}% complete — some jobs require 80%+. Add projects and 10th marks to unlock more drives.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto shrink-0">
            {/* Custom mini progress bar */}
            <div className="hidden sm:block w-32 h-1.5 bg-amber-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${profileCompleteness}%` }} />
            </div>
            <Button 
              variant="link" 
              className="text-amber-500 hover:text-amber-400 p-0 h-auto font-medium"
              onClick={() => navigate("/student/profile")}
            >
              Complete now <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* TOP STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground mb-2">Applications</p>
            <h3 className="text-4xl font-bold text-foreground">{stats.totalApps}</h3>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              {stats.activeApps} active · {stats.closedApps} closed
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground mb-2">Shortlisted</p>
            <h3 className="text-4xl font-bold text-emerald-500">{stats.shortlisted}</h3>
            <p className="text-xs text-muted-foreground mt-2 font-medium truncate">
              {stats.shortlistedText}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground mb-2">New jobs for you</p>
            <h3 className="text-4xl font-bold text-amber-500">{stats.newJobs}</h3>
            <p className="text-xs text-muted-foreground mt-2 font-medium">Matching your profile</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground mb-2">Batch placed</p>
            <h3 className="text-4xl font-bold text-foreground">34%</h3>
            <p className="text-xs text-muted-foreground mt-2 font-medium">87 of 256 students</p>
          </CardContent>
        </Card>
      </div>

      {/* MIDDLE ROW (Applications & Notifications) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">My applications</CardTitle>
            <Button variant="link" className="text-xs font-medium text-muted-foreground hover:text-primary p-0 h-auto" onClick={() => navigate("/student/applications")}>
              View all <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            {recentApps.length > 0 ? (
              <div className="space-y-4">
                {recentApps.map((app) => (
                  <div key={app.appId || app._id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-muted/50 flex items-center justify-center border border-border text-xs font-bold text-muted-foreground">
                        {app.jobId?.company?.name?.substring(0, 3).toUpperCase() || "C"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {app.jobId?.title || "Role"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {app.jobId?.company?.name || "Company"} · Applied {formatDate(app.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`
                      text-[11px] font-medium px-2.5 py-0.5 h-6 rounded-full border
                      ${app.status === "SHORTLISTED" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : ""}
                      ${app.status === "INTERVIEW" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : ""}
                      ${app.status === "REJECTED" ? "bg-red-500/10 text-red-500 border-red-500/20" : ""}
                      ${app.status === "APPLIED" ? "bg-muted text-muted-foreground border-border" : ""}
                    `}>
                      {app.status ? app.status.charAt(0) + app.status.slice(1).toLowerCase() : "Applied"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">No applications yet.</div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Notifications</CardTitle>
            <Button variant="link" className="text-xs font-medium text-muted-foreground hover:text-primary p-0 h-auto">
              View all <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            {notifications.length > 0 ? (
              <div className="space-y-5">
                {notifications.map((notif) => (
                  <div key={notif._id} className="flex gap-3 items-start relative">
                    {/* Unread indicator dot */}
                    {!notif.isRead && (
                      <div className="absolute -left-1.5 top-2 w-1.5 h-1.5 rounded-full bg-blue-500" />
                    )}
                    <div className="flex-1 pl-2">
                      <p className={`text-sm ${!notif.isRead ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                        {notif.message}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {formatDate(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground flex flex-col items-center">
                <Bell className="w-6 h-6 mb-2 opacity-20" />
                All caught up!
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* NEW JOBS MATCHING YOUR PROFILE */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base font-semibold">New Jobs</CardTitle>
          <Button variant="link" className="text-xs font-medium text-primary p-0 h-auto" onClick={() => navigate("/student/jobs")}>
            View all {stats.newJobs} <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {jobs.length > 0 ? jobs.map((job) => (
              <div key={job._id} className="border border-border rounded-xl p-5 hover:border-primary/50 transition-colors bg-card cursor-pointer" onClick={() => navigate(`/student/jobs/${job.jobCode}`)}>
                <p className="text-xs text-muted-foreground mb-1">{job.company?.name || "Company"}</p>
                <h4 className="text-base font-bold text-foreground mb-3">{job.title}</h4>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className="bg-muted text-muted-foreground font-normal text-[10px] px-2 py-0.5">Full Time</Badge>
                  <Badge variant="secondary" className="bg-muted text-muted-foreground font-normal text-[10px] px-2 py-0.5">{job.location || "On-site"}</Badge>
                </div>

                <div className="flex items-end justify-between mt-auto">
                  <div>
                    <p className="text-lg font-bold text-foreground">{job.packageLPA} LPA</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Deadline: {formatDate(job.deadline)}</p>
                  </div>
                  {/* Real Eligibility logic */}
                  {(() => {
                    const eligibility = getEligibilityStatus(job);
                    return (
                      <Badge className={`rounded-full px-3 py-0.5 text-[10px] ${getEligibilityBadgeStyle(eligibility.status)}`} variant="outline">
                        {eligibility.status}
                      </Badge>
                    );
                  })()}
                </div>
              </div>
            )) : (
               <div className="col-span-3 text-center py-6 text-sm text-muted-foreground">No new jobs matching your profile at the moment.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* UPCOMING DEADLINES */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Upcoming deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0 divide-y divide-border">
            {upcomingDeadlines && upcomingDeadlines.length > 0 ? upcomingDeadlines.map((item) => {
              const diffDays = Math.ceil((new Date(item.date) - new Date()) / (1000 * 60 * 60 * 24));
              const dateText = diffDays === 0 ? `Today · ${new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 
                               diffDays === 1 ? 'Tomorrow' : 
                               formatDate(item.date);
              const colorClass = diffDays === 0 ? "text-red-500" : diffDays <= 3 ? "text-amber-500" : "text-muted-foreground";
              
              return (
                <div key={item.id} className="flex items-center justify-between py-4 group cursor-pointer" onClick={() => navigate(`/student/jobs/${item.jobCode}`)}>
                  <div>
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.companyName}</p>
                    <p className="text-xs text-muted-foreground">{item.title} · {item.name}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${colorClass}`}>{dateText}</p>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-6 text-sm text-muted-foreground">No upcoming deadlines found.</div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default StudentDashboard;