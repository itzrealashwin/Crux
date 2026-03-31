import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAllJobs } from "@/features/jobs/hooks/useJobs.js";
import { useStudentProfile } from "@/features/student/hooks/useStudent.js";
import { useApplyForJob } from "@/features/applications/hooks/useApplicaitions.js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Loader2,
  ArrowLeft,
  MapPin,
  Calendar,
  Building2,
  CheckCircle2,
  Check,
  XCircle,
  Clock,
  Briefcase,
  AlertTriangle,
  Download,
  Flag,
  ArrowUpRight,
} from "lucide-react";

// UI Components
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Separator } from "@/shared/ui/separator";

export default function JobDetailsPage() {
  const { id : jobCode } = useParams();
  const navigate = useNavigate();

  const { mutate: apply, isPending: isApplying } = useApplyForJob();
  const { profile } = useStudentProfile();
  const studentProfile = profile?.data || profile;
  const { data: apiResponse, isLoading } = useAllJobs();
  const [activeTab, setActiveTab] = React.useState("job");
  // Route matches `jobCode` or `_id`
  let job = null;
  if (apiResponse) {
    const jobs = apiResponse.data?.jobs || apiResponse.jobs || [];
    job = jobs.find((j) => (j._id || j.id) === jobCode || j.jobCode === jobCode);
  }

  // --- Eligibility Logic Engine ---
  const checkEligibility = () => {
    if (!job || !studentProfile) return { eligible: false, breakdown: [] };
    const criteria = job.eligibility || {};

    // Helper to format requirements
    const check = (name, reqValue, userValue, isMet, formatter = (v) => v) => ({
      name,
      required: formatter(reqValue),
      actual: formatter(userValue),
      isMet,
    });

    const checks = [
      check(
        "CGPA",
        criteria.minCgpa,
        studentProfile.cgpa,
        studentProfile.cgpa >= (criteria.minCgpa || 0),
        (v) => (v ? v.toFixed(1) : "0.0"),
      ),
      check(
        "Backlogs",
        criteria.maxBacklogs,
        studentProfile.backlogs,
        studentProfile.backlogs <= (criteria.maxBacklogs ?? 99),
        (v) => (v === 0 ? "0" : v || "Any"),
      ),
      check(
        "Branch",
        criteria.allowedDepartments,
        studentProfile.department,
        !criteria.allowedDepartments?.length ||
          criteria.allowedDepartments.includes(studentProfile.department),
        (v) => (Array.isArray(v) ? v.join(", ") : v || "Any"),
      ),
      check(
        "Batch",
        criteria.targetBatch,
        studentProfile.graduationYear,
        !criteria.targetBatch?.length ||
          criteria.targetBatch.includes(studentProfile.graduationYear),
        (v) => (Array.isArray(v) ? v.join(", ") : v || "Any"),
      ),
      check(
        "10th marks",
        criteria.minXthMarks,
        studentProfile.xthMarks,
        studentProfile.xthMarks >= (criteria.minXthMarks || 0),
        (v) => (v ? `${v}%` : "Any"),
      ),
      check(
        "12th marks",
        criteria.minXIIthMarks,
        studentProfile.xIIthMarks,
        studentProfile.xIIthMarks >= (criteria.minXIIthMarks || 0),
        (v) => (v ? `${v}%` : "Any"),
      ),
    ];

    const missingCount = checks.filter((c) => !c.isMet).length;

    // Skills Check
    const reqSkills = job.skillsRequired || [];
    const userSkills = studentProfile.skills || [];
    const matchedSkills = reqSkills.filter((s) => userSkills.includes(s));

    return {
      eligible: missingCount === 0,
      breakdown: checks,
      skills: {
        required: reqSkills,
        matched: matchedSkills,
        count: reqSkills.length,
        matchCount: matchedSkills.length,
      },
    };
  };

  const { eligible, breakdown, skills } = checkEligibility();
  const isClosed = job?.status === "CLOSED";

  // --- Formatting Helpers ---
  const formatDeadline = (dateString) => {
    if (!dateString || Object.keys(dateString).length === 0)
      return { text: "No deadline", isUrgent: false };
    const date = new Date(dateString);
    const today = new Date();
    const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: "Closed", isUrgent: false };
    if (diffDays === 0) return { text: "Closes today", isUrgent: true };
    return {
      text: `Closes in ${diffDays} days — ${date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`,
      isUrgent: diffDays <= 3,
    };
  };

  const formatSalary = () => {
    if (job?.type?.includes("Intern")) {
      const amt = job.stipend?.amount;
      if (!amt) return "Unpaid";
      return `${(amt / 1000).toFixed(0)}k/${job.stipend?.frequency === "Monthly" ? "mo" : "total"}`;
    }
    return job?.packageLPA ? `${job.packageLPA} LPA` : "Not disclosed";
  };

  const deadlineInfo = formatDeadline(job?.deadline);

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  if (!job)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background text-foreground gap-4">
        Job not found
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-background font-sans text-foreground pb-20">
      {/* Navbar */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border h-14 flex items-center px-4 sm:px-6 max-w-[1400px] mx-auto w-full">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to jobs
        </Button>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* ========================================== */}
          {/* LEFT COLUMN (Main Content)                 */}
          {/* ========================================== */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Top Header Card */}
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6 md:p-8">
                <div className="flex gap-5">
                  <Avatar className="h-14 w-14 rounded-lg border border-border bg-muted/50 hidden sm:block">
                    <AvatarImage src={job.company?.logoUrl} />
                    <AvatarFallback className="rounded-lg font-bold text-muted-foreground">
                      {job.company?.name?.substring(0, 3).toUpperCase() ||
                        "CMP"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
                      {job.title}
                    </h1>
                    <p className="text-muted-foreground font-medium flex items-center gap-1.5">
                      {job.company?.name || "Company"} ·{" "}
                      {job.location || "Remote"}
                    </p>

                    {/* Meta Tags Row */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {eligible ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 font-normal rounded-full">
                          Fully eligible
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 font-normal rounded-full">
                          Not eligible
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="text-blue-400 border-blue-400/30 bg-blue-400/5 font-normal rounded-full"
                      >
                        {job.type || "Full time"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-muted-foreground font-normal rounded-full"
                      >
                        {job.workMode || "On-site"}
                      </Badge>
                      {job.eligibility?.targetBatch && (
                        <Badge
                          variant="outline"
                          className="text-muted-foreground font-normal rounded-full"
                        >
                          Batch {job.eligibility.targetBatch.join(", ")}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="text-muted-foreground font-normal rounded-full"
                      >
                        {job.vacancies || 0} vacancies
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-amber-500/80 border-amber-500/30 bg-amber-500/5 font-normal rounded-full"
                      >
                        {deadlineInfo.text.split("—")[0].trim()}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Quick Info Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Total CTC
                    </p>
                    <p className="font-semibold text-lg leading-tight">
                      {formatSalary()}
                    </p>
                    {job.salaryBreakup?.fixed > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Fixed {job.salaryBreakup.fixed} + Variable{" "}
                        {job.salaryBreakup.variable}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Bond</p>
                    <p className="font-semibold text-lg leading-tight">
                      {job.bond?.hasBond
                        ? `${job.bond?.durationYears} Years`
                        : "None"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {job.bond?.hasBond
                        ? `Penalty: ₹${job.bond?.penaltyAmount}`
                        : "No service agreement"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Joining
                    </p>
                    <p className="font-semibold text-lg leading-tight">
                      Jul 2026
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {job.location || "Office"} office
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Job Description Tabs Layout */}
            {/* 2. Job Description Tabs Layout */}
            <Card className="bg-card/50 border-border/50">
              {/* Interactive Tabs Header */}
              <div className="flex border-b border-border px-6 pt-4 gap-6">
                <div
                  onClick={() => setActiveTab("job")}
                  className={`pb-3 border-b-2 text-sm font-medium cursor-pointer transition-colors ${
                    activeTab === "job"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Job description
                </div>
                <div
                  onClick={() => setActiveTab("company")}
                  className={`pb-3 border-b-2 text-sm font-medium cursor-pointer transition-colors ${
                    activeTab === "company"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  About company
                </div>
              </div>

              <CardContent className="p-6 md:p-8">
                {activeTab === "job" ? (
                  <div className="prose prose-sm prose-stone dark:prose-invert max-w-none text-muted-foreground">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {job.description || "No description provided."}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Company Header */}
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-muted rounded-xl border border-border shrink-0">
                        <Building2 className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {job.company?.name || "Company"}
                        </h3>
                        {job.company?.website && (
                          <a
                            href={
                              job.company.website.startsWith("http")
                                ? job.company.website
                                : `https://${job.company.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 text-sm flex items-center gap-1 mt-0.5 transition-colors w-fit"
                          >
                            {job.company.website}{" "}
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="h-px w-full bg-border" />

                    {/* Company Description / Dynamic Fallback */}
                    <div className="text-muted-foreground text-sm leading-relaxed">
                      {job.company?.about ? (
                        <p>{job.company.about}</p>
                      ) : (
                        <div className="space-y-4">
                          <p>
                            <strong className="text-foreground font-semibold">
                              {job.company?.name || "This company"}
                            </strong>{" "}
                            is currently actively hiring for the{" "}
                            <strong className="text-foreground font-semibold">
                              {job.title}
                            </strong>{" "}
                            role based out of{" "}
                            <strong className="text-foreground font-semibold">
                              {job.location || "their main office"}
                            </strong>
                            .
                          </p>
                          <p>
                            While a detailed company profile hasn't been
                            provided for this specific listing, you can learn
                            more about their products, services, and workplace
                            culture by visiting their official website linked
                            above.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 3. Profile vs Job Matrix (The cool part) */}
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-sm">
                    Profile vs job — eligibility check
                  </h3>
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <span className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />{" "}
                      You have it
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />{" "}
                      Missing
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {breakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background/50"
                    >
                      <div className="flex items-center gap-3">
                        {item.isMet ? (
                          <div className="bg-white rounded-full">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          </div>
                        ) : (
                          <div className="bg-white rounded-full">
                            <XCircle className="w-4 h-4 text-amber-500" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-foreground/80">
                          {item.name}
                        </span>
                      </div>
                      <div className="text-xs font-medium font-mono">
                        <span
                          className={
                            item.isMet ? "text-emerald-500" : "text-amber-500"
                          }
                        >
                          {item.actual}
                        </span>
                        <span className="text-muted-foreground mx-1.5">
                          {item.isMet ? "≥" : "<"}
                        </span>
                        <span className="text-muted-foreground/50">
                          {item.required} required
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Skills Check Row */}
                  <div className="flex items-start justify-between p-3 rounded-lg border border-border/40 bg-background/50">
                    <div className="flex items-start gap-3 pt-0.5">
                      {skills.matchCount === skills.count ? (
                        <div className="bg-white rounded-full">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                      ) : (
                        <div className="bg-white rounded-full">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500/50" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-foreground/80 mt-[-2px]">
                        Required skills
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium font-mono text-emerald-500 mb-2 text-right">
                        {skills.matchCount} of {skills.count} match
                      </div>
                      <div className="flex flex-wrap justify-end gap-1.5 w-full max-w-[250px]">
                        {skills.required.map((skill) => {
                          const hasSkill = skills.matched.includes(skill);
                          return (
                            <Badge
                              key={skill}
                              variant="outline"
                              className={`font-normal text-[10px] rounded-full ${hasSkill ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-transparent text-muted-foreground"}`}
                            >
                              {skill}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. Selection Process */}
            {job.selectionProcess?.length > 0 && (
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-6 md:p-8">
                  <h3 className="font-semibold text-sm mb-6">
                    Selection process
                  </h3>
                  <div className="space-y-4">
                    {job.selectionProcess.map((round, idx) => (
                      <div key={idx} className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted border border-border/50 text-xs font-medium text-muted-foreground shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground/90">
                            {round.name}
                          </p>
                          {/* We don't have description in the schema, but leaving room for it */}
                          {/* <p className="text-xs text-muted-foreground mt-0.5">{round.description || "—"}</p> */}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 5. Drive Timeline */}
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6 md:p-8">
                <h3 className="font-semibold text-sm mb-6">Drive timeline</h3>

                <div className="relative space-y-6 pl-6 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-px before:bg-border/50">
                  {/* Item 1: Applications Open */}
                  <div className="relative flex items-start gap-3">
                    <div className="absolute -left-6 mt-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-background shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground leading-none mb-1">
                        Applications open
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(job.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Item 2: Deadline */}
                  <div className="relative flex items-start gap-3">
                    <div className="absolute -left-6 mt-0.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-background shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-400 leading-none mb-1">
                        Application deadline
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {deadlineInfo.text}
                      </p>
                    </div>
                  </div>

                  {/* Item 3: Shortlist Released */}
                  <div className="relative flex items-start gap-3 opacity-50">
                    <div className="absolute -left-6 mt-0.5 w-3 h-3 rounded-full bg-muted border border-border ring-4 ring-background shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground leading-none mb-1">
                        Shortlist released
                      </p>
                      <p className="text-xs text-muted-foreground">TBD</p>
                    </div>
                  </div>

                  {/* Item 4: Aptitude Test */}
                  <div className="relative flex items-start gap-3 opacity-50">
                    <div className="absolute -left-6 mt-0.5 w-3 h-3 rounded-full bg-muted border border-border ring-4 ring-background shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground leading-none mb-1">
                        Aptitude test
                      </p>
                      <p className="text-xs text-muted-foreground">TBD</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ========================================== */}
          {/* RIGHT COLUMN (Sticky Actions)              */}
          {/* ========================================== */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
            {/* Action Box */}
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-5">
                {/* Status/Deadline Banner */}
                <div className="flex items-center justify-center gap-2 text-xs font-medium text-red-400 mb-4 pb-4 border-b border-border/40">
                  <Flag className="w-3.5 h-3.5" />
                  {deadlineInfo.text}
                </div>

                <div className="space-y-3 mb-5">
                  <Button
                    className="w-full"
                    disabled={
                      !eligible ||
                      isClosed ||
                      isApplying ||
                      job.status !== "OPEN"
                    }
                    onClick={() => apply(job._id || job.jobCode || job.id)}
                  >
                    {isApplying ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Apply now{" "}
                    <ArrowUpRight className="w-4 h-4 ml-1.5 opacity-70" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent border-border/50"
                  >
                    Save for later
                  </Button>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Status</span>
                    <span
                      className={
                        eligible
                          ? "text-emerald-500 font-medium"
                          : "text-amber-500 font-medium"
                      }
                    >
                      {eligible ? "Eligible" : "Not eligible"}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Vacancies</span>
                    <span className="text-foreground font-medium">
                      {job.vacancies || "Open"}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Applicants so far</span>
                    <span className="text-foreground font-medium">
                      {job.stats?.totalApplications || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Your profile</span>
                    <span className="text-foreground font-medium">
                      {studentProfile?.profileCompleteness || 68}%
                    </span>
                  </div>
                </div>

                {studentProfile?.profileCompleteness < 80 && (
                  <p className="text-[10px] text-amber-500/80 mt-3 pt-3 border-t border-border/40 leading-relaxed">
                    Profile {studentProfile?.profileCompleteness || 68}% —
                    complete it to strengthen your application.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Eligibility Outline Box */}
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-5">
                <h3 className="text-xs font-semibold text-foreground mb-4">
                  Eligibility criteria
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Min CGPA</span>
                    <span className="text-foreground">
                      {job.eligibility?.minCgpa?.toFixed(1) || "Any"}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Max backlogs</span>
                    <span className="text-foreground">
                      {job.eligibility?.maxBacklogs ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Branches</span>
                    <span className="text-foreground text-right max-w-[120px] truncate">
                      {job.eligibility?.allowedDepartments?.join(", ") || "All"}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Batch</span>
                    <span className="text-foreground">
                      {job.eligibility?.targetBatch?.join(", ") || "All"}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>10th marks</span>
                    <span className="text-foreground">
                      {job.eligibility?.minXthMarks
                        ? `${job.eligibility.minXthMarks}%+`
                        : "Any"}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Gender</span>
                    <span className="text-foreground">
                      {job.eligibility?.genderAllowed || "Any"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attachments */}
            {job.attachmentUrl && (
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-5">
                  <h3 className="text-xs font-semibold text-foreground mb-3">
                    Attachments
                  </h3>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-muted-foreground font-normal bg-transparent border-border/50"
                    asChild
                  >
                    <a
                      href={job.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Download className="w-4 h-4 mr-2" /> Download full JD
                      (PDF)
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
