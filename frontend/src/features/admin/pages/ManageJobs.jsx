import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  MapPin,
  Calendar,
  Users,
  Filter,
  Eye,
  Download,
  MoreHorizontal,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// UI Components
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/shared/ui/sheet";
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
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/ui/avatar";

// Hook
import { useAllJobs, useJobMutations } from "@/features/jobs/hooks/useJobs.js";

// Initial State matching your Schema
const INITIAL_FORM_STATE = {
  _id: "",
  company: { name: "", website: "", about: "" },
  title: "",
  description: "",
  type: "Full Time",
  workMode: "On-site",
  location: "",
  packageLPA: 0,
  salaryBreakup: { fixed: 0, variable: 0 },
  stipend: { amount: 0, frequency: "Monthly" },
  bond: { hasBond: false, durationYears: 0, penaltyAmount: 0 },
  eligibility: {
    minCgpa: 0,
    maxBacklogs: 0,
    targetBatch: "",
    allowedDepartments: "",
    genderAllowed: "Any",
    minXthMarks: 0,
    minXIIthMarks: 0,
  },
  skillsRequired: "",
  vacancies: 1,
  deadline: "",
  status: "OPEN",
  attachmentUrl: "",
};

export default function ManageJobs() {
  const navigate = useNavigate();
  
  // --- UI States ---
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  
  // --- Filters ---
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // 'ALL', 'OPEN', 'DRAFT', 'CLOSED', 'HOLD'
  const [typeFilter, setTypeFilter] = useState("ALL"); // 'ALL', 'Full Time', 'Internship', 'Intern + PPO'

  // --- Fetch Data ---
  const { data: jobsResponse, isLoading } = useAllJobs();
  const { createJob, updateJob } = useJobMutations();

  // Extract jobs array safely
  const allJobs = useMemo(() => {
    return jobsResponse?.data?.jobs || jobsResponse?.jobs || [];
  }, [jobsResponse]);

  // --- Compute Stats for Top Cards ---
  const stats = useMemo(() => {
    return {
      all: allJobs.length,
      open: allJobs.filter(j => j.status === "OPEN").length,
      draft: allJobs.filter(j => j.status === "DRAFT").length,
      closed: allJobs.filter(j => j.status === "CLOSED").length,
      hold: allJobs.filter(j => j.status === "HOLD").length,
    };
  }, [allJobs]);

  // --- Filter Logic ---
  const jobsList = useMemo(() => {
    if (!allJobs.length) return [];
    
    return allJobs.filter((job) => {
      // 1. Status Check
      if (statusFilter !== "ALL" && job.status !== statusFilter) return false;
      
      // 2. Type Check
      if (typeFilter !== "ALL" && job.type !== typeFilter) return false;

      // 3. Search Check
      const query = searchQuery.toLowerCase();
      if (query) {
        const matchesTitle = job.title?.toLowerCase().includes(query);
        const matchesCompany = job.company?.name?.toLowerCase().includes(query);
        const matchesLocation = job.location?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCompany && !matchesLocation) return false;
      }

      return true;
    });
  }, [allJobs, searchQuery, statusFilter, typeFilter]);

  // --- Formatting Helpers ---
  const formatDeadline = (dateString) => {
    if (!dateString) return { display: "Not set", isUrgent: false, days: "" };
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const displayDate = date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    
    if (diffDays < 0) return { display: displayDate, isUrgent: false, days: "Passed" };
    if (diffDays === 0) return { display: displayDate, isUrgent: true, days: "Today" };
    return { 
      display: displayDate, 
      isUrgent: diffDays <= 3, 
      days: `${diffDays} days` 
    };
  };

  const formatDateInput = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toISOString().split("T")[0];
  };

  // --- Form Handlers ---
  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData(INITIAL_FORM_STATE);
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (job) => {
    setIsEditing(true);
    const transformedData = {
      ...INITIAL_FORM_STATE,
      ...job,
      deadline: formatDateInput(job.deadline),
      skillsRequired: Array.isArray(job.skillsRequired) ? job.skillsRequired.join(", ") : "",
      eligibility: {
        ...INITIAL_FORM_STATE.eligibility,
        ...(job.eligibility || {}),
        targetBatch: Array.isArray(job.eligibility?.targetBatch) ? job.eligibility.targetBatch.join(", ") : "",
        allowedDepartments: Array.isArray(job.eligibility?.allowedDepartments) ? job.eligibility.allowedDepartments.join(", ") : "",
      },
      salaryBreakup: { ...INITIAL_FORM_STATE.salaryBreakup, ...(job.salaryBreakup || {}) },
      stipend: { ...INITIAL_FORM_STATE.stipend, ...(job.stipend || {}) },
      bond: { ...INITIAL_FORM_STATE.bond, ...(job.bond || {}) },
      company: { ...INITIAL_FORM_STATE.company, ...(job.company || {}) },
    };
    setFormData(transformedData);
    setIsSheetOpen(true);
  };

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => {
      if (section) return { ...prev, [section]: { ...prev[section], [field]: value } };
      return { ...prev, [field]: value };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      vacancies: Number(formData.vacancies) || 0,
      packageLPA: Number(formData.packageLPA) || 0,
      salaryBreakup: {
        fixed: Number(formData.salaryBreakup?.fixed) || 0,
        variable: Number(formData.salaryBreakup?.variable) || 0,
      },
      stipend: {
        ...formData.stipend,
        amount: Number(formData.stipend?.amount) || 0,
      },
      bond: {
        ...formData.bond,
        durationYears: Number(formData.bond?.durationYears) || 0,
        penaltyAmount: Number(formData.bond?.penaltyAmount) || 0,
      },
      eligibility: {
        ...formData.eligibility,
        minCgpa: Number(formData.eligibility?.minCgpa) || 0,
        maxBacklogs: Number(formData.eligibility?.maxBacklogs) || 0,
        minXthMarks: Number(formData.eligibility?.minXthMarks) || 0,
        minXIIthMarks: Number(formData.eligibility?.minXIIthMarks) || 0,
        targetBatch: typeof formData.eligibility.targetBatch === 'string'
            ? formData.eligibility.targetBatch.split(",").map((s) => Number(s.trim())).filter(Boolean)
            : formData.eligibility.targetBatch,
        allowedDepartments: typeof formData.eligibility.allowedDepartments === 'string'
            ? formData.eligibility.allowedDepartments.split(",").map((s) => s.trim()).filter(Boolean)
            : formData.eligibility.allowedDepartments,
      },
      skillsRequired: typeof formData.skillsRequired === 'string' 
        ? formData.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean)
        : formData.skillsRequired,
    };

    if (isEditing) {
      if (!payload._id) return console.error("Job ID missing for update");
      updateJob({ id: payload._id, data: payload });
    } else {
      const { _id, ...createPayload } = payload;
      createJob(createPayload);
    }
    setIsSheetOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-foreground">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job listings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage all placement drives · Semester Mar 2026
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-transparent border-border hover:bg-muted">
            Export CSV
          </Button>
          <Button onClick={handleOpenCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
            + Post new drive
          </Button>
        </div>
      </div>

      {/* 2. Top Summary Cards (Filters) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { id: "ALL", label: "All drives", count: stats.all, desc: "This semester" },
          { id: "OPEN", label: "Open", count: stats.open, desc: "Accepting applications" },
          { id: "DRAFT", label: "Draft", count: stats.draft, desc: "Not published yet" },
          { id: "CLOSED", label: "Closed", count: stats.closed, desc: "Drive completed" },
          { id: "HOLD", label: "On hold", count: stats.hold, desc: "Paused by admin" },
        ].map((card) => {
          const isActive = statusFilter === card.id;
          return (
            <Card 
              key={card.id} 
              className={`cursor-pointer transition-all border-border ${isActive ? 'bg-primary/5 border-primary shadow-sm' : 'bg-card hover:bg-muted/50'}`}
              onClick={() => setStatusFilter(card.id)}
            >
              <CardContent className="p-4">
                <p className={`text-xs font-medium mb-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{card.label}</p>
                <h3 className={`text-2xl font-bold mb-1 ${isActive ? 'text-primary' : 'text-foreground'}`}>{card.count}</h3>
                <p className="text-[10px] text-muted-foreground">{card.desc}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 3. Search and Filters Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search company, role, location..."
            className="pl-9 bg-card border-border focus-visible:ring-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {["ALL", "Full Time", "Internship", "Intern + PPO"].map((type) => (
            <Badge 
              key={type}
              variant={typeFilter === type ? "default" : "outline"}
              className={`cursor-pointer rounded-full px-4 py-1.5 font-normal text-xs whitespace-nowrap border-border ${typeFilter === type ? 'bg-primary/20 text-primary hover:bg-primary/30 border-transparent' : 'hover:bg-muted'}`}
              onClick={() => setTypeFilter(type)}
            >
              {type === "ALL" ? "All types" : type}
            </Badge>
          ))}
        </div>
      </div>

      {/* Select Dropdown (Sort by) */}
      <div className="w-full md:w-64">
        <Select defaultValue="soonest">
          <SelectTrigger className="bg-card border-border">
            <SelectValue placeholder="Deadline: soonest" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="soonest">Deadline: soonest</SelectItem>
            <SelectItem value="newest">Posted: newest</SelectItem>
            <SelectItem value="package">Package: high to low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sub header */}
      <div className="text-sm font-medium text-foreground">
        <span className="font-bold">{stats.open} open drives</span> · 3 closing within 7 days · 34 applications need review
      </div>

      {/* 4. Data Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-12 text-center text-xs font-semibold uppercase tracking-wider">
                <input type="checkbox" className="rounded border-muted-foreground/30 bg-transparent" />
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[300px]">Drive</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Package</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Applicants</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deadline</TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={8} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></TableCell></TableRow>
            ) : jobsList.length === 0 ? (
               <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">No drives found matching your criteria.</TableCell></TableRow>
            ) : (
              jobsList.map((job) => {
                
                // Status mapping logic
                const isUrgent = job.status === "OPEN" && formatDeadline(job.deadline).isUrgent;
                const statusDisplay = isUrgent ? "Closing soon" : job.status;
                const statusClass = 
                  statusDisplay === "Closing soon" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                  job.status === "OPEN" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                  job.status === "HOLD" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                  "bg-muted text-muted-foreground border-border";

                // Package logic
                const isIntern = job.type?.includes("Intern");
                const packageDisplay = isIntern && job.stipend?.amount 
                  ? `${job.stipend.amount / 1000}k/mo` 
                  : `${job.packageLPA} LPA`;

                const deadlineMeta = formatDeadline(job.deadline);

                // Derived mock status for the applicants column based on the image
                const applicantsTotal = job.stats?.totalApplications || 0;
                const applicantsSub = job.status === "OPEN" 
                  ? <span className="text-emerald-500">{job.stats?.eligible || 0} eligible</span> 
                  : job.status === "DRAFT" 
                  ? <span className="text-muted-foreground">Not published</span>
                  : job.status === "CLOSED"
                  ? <span className="text-muted-foreground">{job.stats?.hired || 0} hired</span>
                  : <span className="text-amber-500">Review pending</span>;

                // Derive primary button text
                const primaryAction = job.status === "DRAFT" ? "Publish" : job.status === "CLOSED" ? "View" : job.status === "HOLD" ? "Resume" : "Review";

                return (
                  <TableRow key={job._id || job.jobCode} className="border-border hover:bg-muted/30 transition-colors">
                    <TableCell className="text-center">
                      <input type="checkbox" className="rounded border-muted-foreground/30 bg-transparent" />
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 rounded-lg border border-border bg-muted/50">
                          <AvatarImage src={job.company?.logoUrl} />
                          <AvatarFallback className="rounded-lg font-bold text-muted-foreground text-xs">
                            {job.company?.name?.substring(0, 3).toUpperCase() || "CMP"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-foreground leading-tight">{job.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">
                            {job.company?.name} · {job.location || job.workMode}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className={`font-medium text-[10px] rounded-full whitespace-nowrap ${statusClass}`}>
                        {statusDisplay.charAt(0).toUpperCase() + statusDisplay.slice(1).toLowerCase()}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="font-normal text-[10px] rounded-full border-border bg-transparent text-muted-foreground">
                        {job.type}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-medium text-sm text-foreground">
                      {packageDisplay}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">{applicantsTotal === 0 && job.status === "DRAFT" ? "—" : applicantsTotal}</span>
                        <span className="text-[10px]">{applicantsSub}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col max-w-[120px]">
                        <span className={`text-sm font-medium ${deadlineMeta.isUrgent ? 'text-amber-500' : 'text-foreground'}`}>
                          {deadlineMeta.display} {deadlineMeta.days && `· ${deadlineMeta.days}`}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate mt-0.5">
                          {job.status === "OPEN" ? "Applications open" : job.status === "CLOSED" ? "Drive completed" : job.status === "DRAFT" ? "Publish to set" : "Paused"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant={job.status === "DRAFT" ? "default" : "outline"} 
                          size="sm" 
                          className={`h-8 text-xs ${job.status === "DRAFT" ? "" : "bg-transparent border-border/60 hover:bg-muted"}`}
                          onClick={() => navigate(`/admin/jobs/${job.jobCode}`)}
                        >
                          {primaryAction}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs bg-transparent border-border/60 hover:bg-muted"
                          onClick={() => handleOpenEdit(job)}
                        >
                          {job.status === "CLOSED" ? "Archive" : "Edit"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
        
        {/* Pagination Mock Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/10">
           <p className="text-xs text-muted-foreground">Showing {jobsList.length} of {allJobs.length} drives</p>
           <div className="flex items-center gap-1">
             <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent border-border text-muted-foreground">←</Button>
             <Button variant="outline" size="sm" className="h-8 w-8 bg-primary/20 border-primary text-primary">1</Button>
             <Button variant="outline" size="sm" className="h-8 w-8 bg-transparent border-border text-muted-foreground hover:bg-muted">2</Button>
             <Button variant="outline" size="sm" className="h-8 w-8 bg-transparent border-border text-muted-foreground hover:bg-muted">3</Button>
             <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent border-border text-muted-foreground">→</Button>
           </div>
        </div>
      </div>

      {/* --- CREATE / EDIT SHEET --- */}
      {/* Kept exactly as your original logic, using your standard Shadcn Sheet component */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto p-0 gap-0 bg-background border-border">
          <SheetHeader className="px-6 py-4 border-b border-border sticky top-0 bg-background z-10">
            <SheetTitle>{isEditing ? "Edit Job" : "Create New Job"}</SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Modify the details of the existing job posting."
                : "Fill in the details to post a new opportunity for students."}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              <Tabs defaultValue="basic" className="w-full">
                <div className="px-6 pt-4 bg-background z-10 pb-2">
                  <TabsList className="grid w-full grid-cols-4 bg-muted">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="financials">Financials</TabsTrigger>
                    <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
                    <TabsTrigger value="process">Process</TabsTrigger>
                  </TabsList>
                </div>

                {/* --- TAB 1: BASIC INFO --- */}
                <TabsContent value="basic" className="px-6 pb-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Job Title *</Label>
                      <Input required value={formData.title} onChange={(e) => handleInputChange(null, "title", e.target.value)} placeholder="e.g. SDE-1" className="bg-background border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label>Company Name *</Label>
                      <Input required value={formData.company.name} onChange={(e) => handleInputChange("company", "name", e.target.value)} placeholder="e.g. Google" className="bg-background border-border" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input value={formData.company.website} onChange={(e) => handleInputChange("company", "website", e.target.value)} placeholder="https://..." className="bg-background border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label>Vacancies</Label>
                      <Input type="number" value={formData.vacancies} onChange={(e) => handleInputChange(null, "vacancies", e.target.value)} className="bg-background border-border" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Job Type</Label>
                      <Select value={formData.type} onValueChange={(val) => handleInputChange(null, "type", val)}>
                        <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full Time">Full Time</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                          <SelectItem value="Intern + PPO">Intern + PPO</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Work Mode</Label>
                      <Select value={formData.workMode} onValueChange={(val) => handleInputChange(null, "workMode", val)}>
                        <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="On-site">On-site</SelectItem>
                          <SelectItem value="Remote">Remote</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input value={formData.location} onChange={(e) => handleInputChange(null, "location", e.target.value)} placeholder="e.g. Bangalore" className="bg-background border-border" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Job Description (HTML/Markdown) *</Label>
                    <Textarea required value={formData.description} onChange={(e) => handleInputChange(null, "description", e.target.value)} className="min-h-[150px] bg-background border-border" placeholder="Enter detailed job description..." />
                  </div>
                </TabsContent>

                {/* --- TAB 2: FINANCIALS --- */}
                <TabsContent value="financials" className="px-6 pb-6 space-y-6">
                  <Card className="border-dashed border-border bg-transparent">
                    <CardContent className="grid grid-cols-2 gap-4 pt-6">
                      <div className="space-y-2">
                        <Label>Package (CTC in LPA) *</Label>
                        <Input type="number" step="0.1" value={formData.packageLPA} onChange={(e) => handleInputChange(null, "packageLPA", e.target.value)} className="bg-background border-border" />
                      </div>
                      <div className="space-y-2">
                        <Label>Fixed Component (LPA)</Label>
                        <Input type="number" step="0.1" value={formData.salaryBreakup.fixed} onChange={(e) => handleInputChange("salaryBreakup", "fixed", e.target.value)} className="bg-background border-border" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed border-border bg-transparent">
                    <CardContent className="grid grid-cols-2 gap-4 pt-6">
                      <div className="space-y-2">
                        <Label>Stipend Amount</Label>
                        <Input type="number" value={formData.stipend.amount} onChange={(e) => handleInputChange("stipend", "amount", e.target.value)} className="bg-background border-border" />
                      </div>
                      <div className="space-y-2">
                        <Label>Frequency</Label>
                        <Select value={formData.stipend.frequency} onValueChange={(val) => handleInputChange("stipend", "frequency", val)}>
                          <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Monthly">Monthly</SelectItem>
                            <SelectItem value="Lumpsum">Lumpsum</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex items-center justify-between border border-border p-4 rounded-md">
                    <div className="space-y-0.5">
                      <Label className="text-base">Service Bond</Label>
                      <p className="text-xs text-muted-foreground">Does this job have a mandatory bond?</p>
                    </div>
                    <Switch checked={formData.bond.hasBond} onCheckedChange={(checked) => handleInputChange("bond", "hasBond", checked)} />
                  </div>
                </TabsContent>

                {/* --- TAB 3: ELIGIBILITY --- */}
                <TabsContent value="eligibility" className="px-6 pb-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Min CGPA</Label>
                      <Input type="number" step="0.1" max="10" value={formData.eligibility.minCgpa} onChange={(e) => handleInputChange("eligibility", "minCgpa", e.target.value)} className="bg-background border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Active Backlogs</Label>
                      <Input type="number" value={formData.eligibility.maxBacklogs} onChange={(e) => handleInputChange("eligibility", "maxBacklogs", e.target.value)} className="bg-background border-border" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Min 10th %</Label>
                      <Input type="number" value={formData.eligibility.minXthMarks} onChange={(e) => handleInputChange("eligibility", "minXthMarks", e.target.value)} className="bg-background border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label>Min 12th %</Label>
                      <Input type="number" value={formData.eligibility.minXIIthMarks} onChange={(e) => handleInputChange("eligibility", "minXIIthMarks", e.target.value)} className="bg-background border-border" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Allowed Genders</Label>
                    <Select value={formData.eligibility.genderAllowed} onValueChange={(val) => handleInputChange("eligibility", "genderAllowed", val)}>
                      <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Any">Any</SelectItem>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Target Batch (Year)</Label>
                    <Input placeholder="e.g. 2024, 2025" value={formData.eligibility.targetBatch} onChange={(e) => handleInputChange("eligibility", "targetBatch", e.target.value)} className="bg-background border-border" />
                    <p className="text-xs text-muted-foreground">Comma separated values</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Allowed Departments</Label>
                    <Input placeholder="MCA, B.Tech, MBA" value={formData.eligibility.allowedDepartments} onChange={(e) => handleInputChange("eligibility", "allowedDepartments", e.target.value)} className="bg-background border-border" />
                    <p className="text-xs text-muted-foreground">Comma separated values</p>
                  </div>
                </TabsContent>

                {/* --- TAB 4: PROCESS & META --- */}
                <TabsContent value="process" className="px-6 pb-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Required Skills</Label>
                    <Input placeholder="React, Node.js, Python" value={formData.skillsRequired} onChange={(e) => handleInputChange(null, "skillsRequired", e.target.value)} className="bg-background border-border" />
                    <p className="text-xs text-muted-foreground">Comma separated values</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Application Deadline *</Label>
                      <Input type="date" required value={formData.deadline} onChange={(e) => handleInputChange(null, "deadline", e.target.value)} className="bg-background border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={formData.status} onValueChange={(val) => handleInputChange(null, "status", val)}>
                        <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OPEN">Open</SelectItem>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="CLOSED">Closed</SelectItem>
                          <SelectItem value="HOLD">On Hold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Attachment URL (JD PDF)</Label>
                    <Input placeholder="https://drive.google.com/..." value={formData.attachmentUrl} onChange={(e) => handleInputChange(null, "attachmentUrl", e.target.value)} className="bg-background border-border" />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sticky Footer */}
            <SheetFooter className="p-4 border-t border-border bg-background">
              <Button variant="outline" type="button" onClick={() => setIsSheetOpen(false)} className="bg-transparent border-border hover:bg-muted">
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Save Changes" : "Post Job"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}