import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useJobById, useJobMutations } from "@/features/jobs/hooks/useJobs.js";
import {
  useJobApplications,
  useUpdateApplicationStatus,
} from "@/features/applications/hooks/useApplications.js";
import { Loader2, Search, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { toast } from "sonner";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const formatDeadline = (dateStr) => {
  if (!dateStr) return { text: "—", color: "text-muted-foreground" };
  const date = new Date(dateStr);
  const diff = Math.ceil((date - Date.now()) / 86400000);
  const label = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  if (diff <= 0) return { text: label, color: "text-muted-foreground" };
  if (diff <= 2)
    return {
      text: `${label} · ${diff} day${diff > 1 ? "s" : ""} left`,
      color: "text-red-500",
    };
  if (diff <= 7)
    return { text: `${label} · ${diff} days left`, color: "text-amber-500" };
  return { text: label, color: "text-muted-foreground" };
};

const REJECTION_REASONS = [
  { value: "FAILED_APTITUDE_TEST", label: "Failed aptitude test" },
  { value: "FAILED_CODING_ROUND", label: "Failed coding round" },
  { value: "FAILED_TECHNICAL_INTERVIEW", label: "Failed technical interview" },
  { value: "FAILED_HR_INTERVIEW", label: "Failed HR interview" },
  { value: "CGPA_BELOW_CUTOFF", label: "CGPA below cutoff" },
  { value: "DEPARTMENT_NOT_ALLOWED", label: "Department not allowed" },
  { value: "INCOMPLETE_PROFILE", label: "Incomplete profile" },
  { value: "VACANCY_FILLED", label: "Vacancy filled" },
  { value: "OTHER", label: "Other" },
];

// ─── Reject Dialog ────────────────────────────────────────────────────────────

function RejectDialog({ open, onClose, onConfirm, count = 1, isUpdating }) {
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = () => {
    if (!reason) {
      toast.error("Please select a rejection reason");
      return;
    }
    onConfirm({ rejectionReason: reason, feedbackForStudent: feedback });
    setReason("");
    setFeedback("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Reject {count > 1 ? `${count} applications` : "application"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>
              Reason <span className="text-red-500">*</span>
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select a reason…" />
              </SelectTrigger>
              <SelectContent>
                {REJECTION_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>
              Feedback for student{" "}
              <span className="text-muted-foreground text-xs font-normal">
                (optional — student will see this)
              </span>
            </Label>
            <Textarea
              placeholder="e.g. Your coding round score was below the cutoff. Practise DSA on LeetCode before the next drive."
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              maxLength={600}
              className="bg-background border-border resize-none text-sm"
            />
            <p className="text-xs text-muted-foreground text-right">
              {feedback.length}/600
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-transparent border-border"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || isUpdating}
            className="bg-red-500 hover:bg-red-600 text-white border-0"
          >
            {isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Confirm rejection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Mark Done Dialog ─────────────────────────────────────────────────────────

function MarkDoneDialog({ open, onClose, step, onConfirm, isUpdating }) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");

  if (!step) return null;
  const label =
    step.label ||
    (step.key || "")
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Mark as done — {label}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label>
              Note{" "}
              <span className="text-muted-foreground text-xs font-normal">
                (optional)
              </span>
            </Label>
            <Input
              placeholder="e.g. Online via AMCAT platform"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-background border-border"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-transparent border-border"
          >
            Cancel
          </Button>
          <Button
            onClick={() =>
              onConfirm({ key: step.key, isDone: true, date, note })
            }
            disabled={isUpdating}
          >
            {isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Mark done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Timeline Step ────────────────────────────────────────────────────────────

function TimelineStep({
  step,
  isLast,
  isFirstPending,
  onMarkDone,
  isUpdating,
}) {
  const label =
    step.label ||
    (step.key || "")
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="relative flex gap-4 items-start">
      {!isLast && (
        <div
          className={`absolute left-[9px] top-5 bottom-[-24px] w-px ${step.isDone ? "bg-emerald-500" : "bg-border/50"}`}
        />
      )}
      <div
        className={`relative z-10 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-card mt-0.5 ${
          step.isDone
            ? "bg-emerald-500"
            : isFirstPending
              ? "bg-background border-[3px] border-blue-500"
              : "bg-muted border border-muted-foreground/30"
        }`}
      >
        {step.isDone && <CheckCircle2 className="w-3 h-3 text-white" />}
      </div>
      <div className="pb-6 w-full">
        <p
          className={`text-sm font-semibold leading-none mb-1 ${
            step.isDone
              ? "text-muted-foreground line-through"
              : isFirstPending
                ? "text-blue-500"
                : "text-foreground"
          }`}
        >
          {label}
        </p>
        {step.date && (
          <p
            className={`text-xs ${isFirstPending ? "text-red-400 font-medium" : "text-muted-foreground"}`}
          >
            {new Date(step.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        )}
        {step.note && (
          <p className="text-xs text-muted-foreground italic mt-1">
            {step.note}
          </p>
        )}
        {!step.isDone && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2 h-7 text-xs bg-transparent border-border/60 hover:bg-muted"
            onClick={() => onMarkDone(step)}
            disabled={isUpdating}
          >
            {isUpdating && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
            {step.date ? "Mark done" : "Set date & mark"}
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminJobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("eligible");
  const [activeFunnel, setActiveFunnel] = useState("applied");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [sortBy, setSortBy] = useState("cgpa");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [rejectTarget, setRejectTarget] = useState(null);
  const [timelineStep, setTimelineStep] = useState(null);

  // ── API ──
  const { data: job, isLoading: jobLoading } = useJobById(id);
  const { data: applicationsRaw, isLoading: appsLoading } =
    useJobApplications(id);
  const { updateDriveTimeline, isUpdatingTimeline } = useJobMutations();
  const { mutateAsync: updateStatus, isPending: isUpdatingStatus } =
    useUpdateApplicationStatus();

  const applications = useMemo(() => applicationsRaw || [], [applicationsRaw]);

  // ── Stats ──
  const stats = useMemo(() => {
    const b = job?.stats || {};
    const count = (tag) =>
      applications.filter((a) => a.autoScreeningTag === tag).length;
    const countStatus = (s) =>
      applications.filter((a) => a.status === s).length;
    return {
      totalApplications: b.totalApplications ?? applications.length,
      eligible: b.eligible ?? count("ELIGIBLE"),
      borderline: b.borderline ?? count("BORDERLINE"),
      ineligible: b.ineligible ?? count("INELIGIBLE"),
      shortlisted: b.shortlisted ?? countStatus("SHORTLISTED"),
      interview: b.interview ?? countStatus("INTERVIEW"),
      selected: b.selected ?? countStatus("SELECTED"),
      hired: b.hired ?? countStatus("HIRED"),
    };
  }, [job, applications]);

  // ── Filtered list ──
  const filteredApps = useMemo(() => {
    let list = [...applications];

    if (activeTab === "eligible")
      list = list.filter((a) => a.autoScreeningTag === "ELIGIBLE");
    else if (activeTab === "borderline")
      list = list.filter((a) => a.autoScreeningTag === "BORDERLINE");
    else if (activeTab === "ineligible")
      list = list.filter((a) => a.autoScreeningTag === "INELIGIBLE");

    if (activeFunnel === "shortlisted")
      list = list.filter((a) => a.status === "SHORTLISTED");
    else if (activeFunnel === "interview")
      list = list.filter((a) => a.status === "INTERVIEW");
    else if (activeFunnel === "selected")
      list = list.filter((a) => a.status === "SELECTED");
    else if (activeFunnel === "hired")
      list = list.filter((a) => a.status === "HIRED");

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) => {
        const p = a.studentProfileId || {};
        return `${p.firstName} ${p.lastName}`.toLowerCase().includes(q);
      });
    }
    if (deptFilter !== "all")
      list = list.filter(
        (a) => a.eligibilitySnapshot?.department === deptFilter,
      );

    if (sortBy === "cgpa")
      list.sort(
        (a, b) =>
          (b.eligibilitySnapshot?.cgpa || 0) -
          (a.eligibilitySnapshot?.cgpa || 0),
      );
    else list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return list;
  }, [applications, activeTab, activeFunnel, search, deptFilter, sortBy]);

  const departments = useMemo(
    () => [
      ...new Set(
        applications
          .map((a) => a.eligibilitySnapshot?.department)
          .filter(Boolean),
      ),
    ],
    [applications],
  );

  // ── Timeline ──
  const timeline = useMemo(() => {
    if (job?.driveTimeline?.length) return job.driveTimeline;
    return [
      { key: "APPLICATION_OPEN", isDone: true, date: job?.createdAt },
      { key: "APPLICATION_CLOSE", isDone: false, date: job?.deadline },
      { key: "SHORTLIST_RELEASED", isDone: false },
      { key: "APTITUDE_TEST", isDone: false },
      { key: "TECHNICAL_INTERVIEW", isDone: false },
      { key: "OFFER_ROLLOUT", isDone: false },
    ];
  }, [job]);

  const firstPendingIdx = timeline.findIndex((s) => !s.isDone);

  // ── Selection ──
  const toggleSelect = (appId) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(appId) ? next.delete(appId) : next.add(appId);
      return next;
    });
  const toggleAll = () =>
    setSelectedIds(
      selectedIds.size === filteredApps.length
        ? new Set()
        : new Set(filteredApps.map((a) => a.appId)),
    );

  // ── Actions ──
  const handleSingleStatus = (app, status) =>
    updateStatus({ appId: app.appId, status, jobCode: id });

  const handleRejectConfirm = async ({
    rejectionReason,
    feedbackForStudent,
  }) => {
    await Promise.all(
      (rejectTarget.ids || []).map((appId) =>
        updateStatus({
          appId,
          status: "REJECTED",
          rejectionReason,
          feedbackForStudent,
          jobCode: id,
        }),
      ),
    );
    setRejectTarget(null);
    setSelectedIds(new Set());
  };

  const handleBulkShortlist = async () => {
    await Promise.all(
      [...selectedIds].map((appId) =>
        updateStatus({ appId, status: "SHORTLISTED", jobCode: id }),
      ),
    );
    setSelectedIds(new Set());
  };

  const handleMarkDone = async (payload) => {
    await updateDriveTimeline({ id, data: payload });
    setTimelineStep(null);
  };

  // ── Loading / not found ──
  if (jobLoading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  if (!job || !Object.keys(job).length)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground gap-2">
        <p>Job not found.</p>
        <Button variant="link" onClick={() => navigate("/admin/jobs")}>
          Back to listings
        </Button>
      </div>
    );

  const companyName = job.company?.name || "Company";
  const deadlineInfo = formatDeadline(job.deadline);

  const FUNNEL = [
    { key: "applied", label: "Applied", count: stats.totalApplications },
    { key: "shortlisted", label: "Shortlisted", count: stats.shortlisted },
    { key: "interview", label: "Interview", count: stats.interview },
    { key: "selected", label: "Selected", count: stats.selected },
    { key: "hired", label: "Hired", count: stats.hired },
  ];

  const TABS = [
    {
      key: "eligible",
      label: "Eligible",
      count: stats.eligible,
      badge: "bg-emerald-500/20 text-emerald-500",
    },
    {
      key: "borderline",
      label: "Borderline",
      count: stats.borderline,
      badge: "bg-amber-500/20 text-amber-500",
    },
    {
      key: "ineligible",
      label: "Ineligible",
      count: stats.ineligible,
      badge: "bg-red-500/20 text-red-500",
    },
    {
      key: "all",
      label: "All",
      count: stats.totalApplications,
      badge: "bg-muted text-muted-foreground",
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground pb-20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <span
              className="hover:text-foreground cursor-pointer"
              onClick={() => navigate("/admin/jobs")}
            >
              Job listings
            </span>
            <span className="mx-2">/</span>
            <span className="text-foreground">
              {companyName} · {job.title}
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-3">
                {companyName} · {job.title}
              </h1>
              <div className="flex items-center gap-3">
                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 rounded-full font-normal">
                  {job.status || "Open"}
                </Badge>
                <span className={`text-sm font-medium ${deadlineInfo.color}`}>
                  Deadline {deadlineInfo.text}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="bg-transparent border-border hover:bg-muted"
              >
                Change status
              </Button>
              <Button
                variant="outline"
                className="bg-transparent border-border hover:bg-muted"
                onClick={() => navigate(`/admin/jobs/${id}/edit`)}
              >
                Edit drive
              </Button>
              <Button
                variant="outline"
                className="bg-transparent border-red-500/30 text-red-500 hover:bg-red-500/10"
              >
                Close drive
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT */}
          <div className="lg:col-span-8 space-y-6">
            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Total applicants",
                  val: stats.totalApplications,
                  cls: "bg-card border-border",
                  vCls: "text-foreground",
                  sub: "Across all stages",
                  sCls: "text-muted-foreground",
                },
                {
                  label: "Eligible",
                  val: stats.eligible,
                  cls: "bg-emerald-500/5 border-emerald-500/20",
                  vCls: "text-emerald-500",
                  sub: `${stats.totalApplications ? Math.round((stats.eligible / stats.totalApplications) * 100) : 0}% pass rate`,
                  sCls: "text-emerald-500",
                },
                {
                  label: "Borderline",
                  val: stats.borderline,
                  cls: "bg-amber-500/5 border-amber-500/20",
                  vCls: "text-amber-500",
                  sub: "CGPA ±0.3 cutoff",
                  sCls: "text-amber-500",
                },
                {
                  label: "Ineligible",
                  val: stats.ineligible,
                  cls: "bg-red-500/5 border-red-500/20",
                  vCls: "text-red-500",
                  sub: "Auto-filtered",
                  sCls: "text-muted-foreground",
                },
              ].map(({ label, val, cls, vCls, sub, sCls }) => (
                <Card key={label} className={`${cls} shadow-sm`}>
                  <CardContent className="p-5">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      {label}
                    </p>
                    <h3 className={`text-3xl font-bold mb-1 ${vCls}`}>{val}</h3>
                    <p className={`text-[10px] font-medium ${sCls}`}>{sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Funnel */}
            <div className="grid grid-cols-5 gap-2">
              {FUNNEL.map((step) => (
                <Card
                  key={step.key}
                  onClick={() => setActiveFunnel(step.key)}
                  className={`cursor-pointer transition-all shadow-none ${
                    activeFunnel === step.key
                      ? "bg-primary/10 border-primary border-2"
                      : "bg-card border-border hover:bg-muted/50"
                  }`}
                >
                  <CardContent className="p-4 text-center">
                    <h4
                      className={`text-2xl font-bold mb-0.5 ${activeFunnel === step.key ? "text-primary" : "text-foreground"}`}
                    >
                      {step.count}
                    </h4>
                    <p
                      className={`text-[10px] font-semibold uppercase tracking-wider ${activeFunnel === step.key ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {step.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Applicants card */}
            <Card className="bg-card border-border shadow-sm overflow-hidden">
              {/* Tabs */}
              <div className="flex items-center gap-6 px-6 pt-4 border-b border-border overflow-x-auto">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setSelectedIds(new Set());
                    }}
                    className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.key
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                    <Badge
                      variant="secondary"
                      className={`px-1.5 py-0 h-5 text-[10px] font-semibold ${activeTab === tab.key ? tab.badge : "bg-muted"}`}
                    >
                      {tab.count}
                    </Badge>
                  </button>
                ))}
              </div>

              {/* Bulk bar */}
              {selectedIds.size > 0 && (
                <div className="px-4 py-2 bg-primary/10 border-b border-primary/20 flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-sm font-medium text-primary">
                    {selectedIds.size} selected
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 bg-transparent"
                      onClick={handleBulkShortlist}
                      disabled={isUpdatingStatus}
                    >
                      {isUpdatingStatus && (
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      )}
                      Shortlist all
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs border-red-500/40 text-red-500 hover:bg-red-500/10 bg-transparent"
                      onClick={() => setRejectTarget({ ids: [...selectedIds] })}
                    >
                      Reject with reason
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs text-muted-foreground"
                      onClick={() => setSelectedIds(new Set())}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}

              {/* Toolbar */}
              <div className="p-4 flex items-center gap-3 border-b border-border bg-muted/20 flex-wrap">
                <div className="relative flex-1 min-w-[160px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search student name…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-9 bg-background border-border text-sm"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px] bg-background border-border h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cgpa">Sort: CGPA high–low</SelectItem>
                    <SelectItem value="date">Sort: Date applied</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={deptFilter} onValueChange={setDeptFilter}>
                  <SelectTrigger className="w-[160px] bg-background border-border h-9 text-sm">
                    <SelectValue placeholder="All depts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All depts</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                {appsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : filteredApps.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-sm">
                    No applications found.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent bg-muted/30">
                        <TableHead className="w-12 text-center">
                          <Checkbox
                            checked={
                              selectedIds.size === filteredApps.length &&
                              filteredApps.length > 0
                            }
                            onCheckedChange={toggleAll}
                          />
                        </TableHead>
                        <TableHead className="text-xs uppercase text-muted-foreground font-semibold w-[240px]">
                          Student
                        </TableHead>
                        <TableHead className="text-xs uppercase text-muted-foreground font-semibold">
                          Screening
                        </TableHead>
                        <TableHead className="text-xs uppercase text-muted-foreground font-semibold">
                          CGPA / Dept
                        </TableHead>
                        <TableHead className="text-xs uppercase text-muted-foreground font-semibold">
                          Skills match
                        </TableHead>
                        <TableHead className="text-right text-xs uppercase text-muted-foreground font-semibold">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApps.map((app) => {
                        const p = app.studentProfileId || {};
                        const name =
                          [p.firstName, p.lastName].filter(Boolean).join(" ") ||
                          "Student";
                        const tag = app.autoScreeningTag;
                        const cgpa = app.eligibilitySnapshot?.cgpa;
                        const dept = app.eligibilitySnapshot?.department || "—";
                        const match =
                          app.screeningDetails?.skillsMatch?.length ?? 0;
                        const missing =
                          app.screeningDetails?.skillsMissing?.length ?? 0;
                        const total = match + missing;

                        return (
                          <TableRow
                            key={app.appId}
                            className={`border-border hover:bg-muted/30 cursor-pointer ${tag === "INELIGIBLE" ? "opacity-60" : ""}`}
                            onClick={() =>
                              navigate(`/admin/applications/${app.appId}`)
                            }
                          >
                            <TableCell
                              className="text-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Checkbox
                                checked={selectedIds.has(app.appId)}
                                onCheckedChange={() => toggleSelect(app.appId)}
                                disabled={tag === "INELIGIBLE"}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border border-border">
                                  <AvatarFallback className="text-xs font-semibold text-primary bg-primary/10">
                                    {getInitials(name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-semibold text-foreground">
                                    {name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {dept} · {p.graduationYear || "—"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`font-normal rounded-full text-[10px] px-2.5 border-transparent whitespace-nowrap ${
                                  tag === "ELIGIBLE"
                                    ? "bg-emerald-500/10 text-emerald-500"
                                    : tag === "BORDERLINE"
                                      ? "bg-amber-500/10 text-amber-500"
                                      : "bg-red-500/10 text-red-500"
                                }`}
                              >
                                {tag === "ELIGIBLE"
                                  ? "Eligible"
                                  : tag === "BORDERLINE"
                                    ? "Borderline"
                                    : "Ineligible"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <p
                                className={`text-sm font-bold ${
                                  tag === "ELIGIBLE"
                                    ? "text-emerald-500"
                                    : tag === "BORDERLINE"
                                      ? "text-amber-500"
                                      : "text-red-500"
                                }`}
                              >
                                {cgpa ?? "—"}
                              </p>
                              <p className="text-[10px] text-muted-foreground uppercase">
                                {dept}
                              </p>
                            </TableCell>
                            <TableCell>
                              {total > 0 ? (
                                <span
                                  className={`text-xs font-medium ${
                                    match === total
                                      ? "text-emerald-500/80"
                                      : match === 0
                                        ? "text-red-500/80"
                                        : "text-amber-500/80"
                                  }`}
                                >
                                  {match}/{total} match
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  —
                                </span>
                              )}
                            </TableCell>
                            <TableCell
                              className="text-right"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-end gap-2">
                                {tag === "INELIGIBLE" ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 bg-transparent border-border/60"
                                    onClick={() =>
                                      navigate(
                                        `/admin/applications/${app.appId}`,
                                      )
                                    }
                                  >
                                    View
                                  </Button>
                                ) : tag === "SHORTLISTED" ||
                                  app.status === "SHORTLISTED" ? (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 bg-transparent border-border hover:bg-muted text-foreground"
                                      disabled={isUpdatingStatus}
                                      onClick={() =>
                                        handleSingleStatus(app, "APPLIED")
                                      } // Reverts back to base state
                                    >
                                      {isUpdatingStatus ? (
                                        <Loader2 className="w-3 h-3 animate-spin mr-2" />
                                      ) : null}
                                      Unshortlist
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 bg-transparent border-border/60 hover:bg-red-500/10 hover:text-red-500"
                                      onClick={() =>
                                        setRejectTarget({ ids: [app.appId] })
                                      }
                                    >
                                      Reject
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      size="sm"
                                      className="h-8 bg-background border border-border hover:bg-muted text-foreground"
                                      disabled={isUpdatingStatus}
                                      onClick={() =>
                                        handleSingleStatus(app, "SHORTLISTED")
                                      }
                                    >
                                      {isUpdatingStatus ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : tag === "BORDERLINE" ? (
                                        "Override"
                                      ) : (
                                        "Shortlist"
                                      )}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 bg-transparent border-border/60 hover:bg-red-500/10 hover:text-red-500"
                                      onClick={() =>
                                        setRejectTarget({ ids: [app.appId] })
                                      }
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>
            </Card>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-4 space-y-6">
            {/* Timeline */}
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-sm font-semibold">
                  Drive timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="relative pl-6">
                  {timeline.map((step, idx) => (
                    <TimelineStep
                      key={step.key || idx}
                      step={step}
                      isLast={idx === timeline.length - 1}
                      isFirstPending={idx === firstPendingIdx}
                      onMarkDone={setTimelineStep}
                      isUpdating={isUpdatingTimeline}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Eligibility */}
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  Eligibility criteria
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs bg-transparent border-border"
                  onClick={() => navigate(`/admin/jobs/${id}/edit`)}
                >
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="space-y-3 text-sm">
                  {[
                    ["Min CGPA", job.eligibility?.minCgpa ?? "—"],
                    ["Max backlogs", job.eligibility?.maxBacklogs ?? "0"],
                    ["Batch", job.eligibility?.targetBatch?.join(", ") || "—"],
                    [
                      "10th / 12th",
                      `${job.eligibility?.minXthMarks ?? 0}% / ${job.eligibility?.minXIIthMarks ?? 0}%`,
                    ],
                    ["Gender", job.eligibility?.genderAllowed || "Any"],
                  ].map(([l, v]) => (
                    <div
                      key={l}
                      className="flex justify-between items-center text-muted-foreground"
                    >
                      <span>{l}</span>
                      <span className="text-foreground font-medium">{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-start text-muted-foreground">
                    <span>Branches</span>
                    <div className="flex flex-wrap gap-1 justify-end max-w-[180px]">
                      {(job.eligibility?.allowedDepartments || []).map((b) => (
                        <Badge
                          key={b}
                          variant="outline"
                          className="text-[10px] bg-muted/50 border-border/50 text-muted-foreground font-normal rounded-full px-2 py-0"
                        >
                          {b}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                {applications.length > 0 && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-md text-[11px] text-amber-500 font-medium leading-snug">
                    {applications.length} application
                    {applications.length > 1 ? "s" : ""} exist — changing
                    criteria will not retroactively affect them.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Drive info */}
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-sm font-semibold">
                  Drive info
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-3 text-sm">
                  {[
                    ["Package", job.packageLPA ? `${job.packageLPA} LPA` : "—"],
                    ["Type", job.type || "—"],
                    [
                      "Mode",
                      [job.workMode, job.location]
                        .filter(Boolean)
                        .join(" · ") || "—",
                    ],
                    ["Vacancies", job.vacancies ?? "—"],
                    [
                      "Bond",
                      job.bond?.hasBond
                        ? `${job.bond.durationYears}yr bond`
                        : "None",
                    ],
                    [
                      "Rounds",
                      job.selectionProcess?.length
                        ? `${job.selectionProcess.length} stages`
                        : "—",
                    ],
                  ].map(([l, v]) => (
                    <div
                      key={l}
                      className="flex justify-between items-center text-muted-foreground"
                    >
                      <span>{l}</span>
                      <span className="text-foreground font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <RejectDialog
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
        count={rejectTarget?.ids?.length}
        isUpdating={isUpdatingStatus}
      />
      <MarkDoneDialog
        open={!!timelineStep}
        onClose={() => setTimelineStep(null)}
        step={timelineStep}
        onConfirm={handleMarkDone}
        isUpdating={isUpdatingTimeline}
      />
    </div>
  );
}
