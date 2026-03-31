import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ExternalLink,
  AlertCircle
} from "lucide-react";

// UI Components
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Skeleton } from "@/shared/ui/skeleton";
import { useJobApplications, useUpdateApplicationStatus } from "@/features/applications/hooks/useApplicaitions.js";
import { useJobMutations } from "@/features/jobs/hooks/useJobs.js";

// Mock Job Data (Ideally, fetch this via useJob(jobId) as well)
const MOCK_JOB_DETAILS = {
  _id: "1",
  title: "Software Development Engineer I",
  company: "TechCorp",
};

export default function ViewApplications() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Fetch Data
  const { data: apiResponse, isLoading, isError } = useJobApplications(jobId);
  const { mutate : updateApplicationStatus } = useUpdateApplicationStatus()
  // Safely access the array from the response object
  // Assuming response structure is { data: [...] } or just [...]
  const applicationsList = useMemo(() => {
    return Array.isArray(apiResponse) ? apiResponse : (apiResponse?.data || []);
  }, [apiResponse]);

  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case "SELECTED": return "bg-emerald-500/15 text-emerald-700 border-emerald-500/20";
      case "SHORTLISTED": 
      case "INTERVIEW": return "bg-blue-500/15 text-blue-700 border-blue-500/20";
      case "REJECTED": return "bg-red-500/15 text-red-700 border-red-500/20";
      case "APPLIED":
      case "APPLIED": return "bg-yellow-500/15 text-yellow-700 border-yellow-500/20";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  // 2. Handle Status Change (Mutation Placeholder)
  const handleStatusChange = (appId, newStatus) => {
    // In a real app, use a mutation hook here: 
    // updateStatusMutation.mutate({ id: appId, status: newStatus });
    console.log(`[API CALL] Updating app ${appId} to ${newStatus}`);
    updateApplicationStatus({applicationId: appId, status: newStatus});
    
   
  };

  // 3. Filtering Logic
  const filteredApps = useMemo(() => {
    if (!applicationsList) return [];

    return applicationsList.filter(app => {
      // Safety check for student object
      const student = app.student || {};
      const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
      const email = (student.email || '').toLowerCase();
      const searchLower = searchQuery.toLowerCase();

      const matchesSearch = fullName.includes(searchLower) || email.includes(searchLower);
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applicationsList, searchQuery, statusFilter]);

  // 4. Stats Calculation
  const stats = useMemo(() => {
    const list = applicationsList || [];
    return {
      total: list.length,
      shortlisted: list.filter(a => ["SHORTLISTED", "INTERVIEW", "SELECTED"].includes(a.status)).length,
      rejected: list.filter(a => a.status === "REJECTED").length
    };
  }, [applicationsList]);

  // --- ERROR STATE ---
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center gap-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div>
          <h3 className="text-lg font-semibold">Failed to load applications</h3>
          <p className="text-muted-foreground">Please try refreshing the page.</p>
        </div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Navigation */}
      <div className="flex flex-col gap-4">
        <Button 
            variant="ghost" 
            className="w-fit pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/admin/jobs")}
        >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Job Listings
        </Button>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Applicants
                </h1>
                <p className="text-muted-foreground mt-1">
                    Managing applications for <span className="font-semibold text-foreground">{MOCK_JOB_DETAILS.title}</span> ({MOCK_JOB_DETAILS.company})
                </p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
            </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isLoading ? (
            // Skeleton for Stats
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : (
            <>
                <Card className="shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Applicants</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-full text-primary"><Filter className="h-5 w-5"/></div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Shortlisted</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.shortlisted}</p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full text-blue-600"><CheckCircle2 className="h-5 w-5"/></div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                        </div>
                        <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full text-red-600"><XCircle className="h-5 w-5"/></div>
                    </CardContent>
                </Card>
            </>
        )}
      </div>

      {/* Filters & Table */}
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-lg border border-border shadow-sm">
            <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search students..." 
                    className="pl-9 bg-background"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Filter Status:</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] bg-background">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Applications</SelectItem>
                        <SelectItem value="APPLIED">APPLIED Review</SelectItem>
                        <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                        <SelectItem value="INTERVIEW">Interview Round</SelectItem>
                        <SelectItem value="SELECTED">Selected</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        {/* Data Table */}
        <div className="rounded-md border border-border bg-card shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="w-[300px]">Candidate</TableHead>
                        <TableHead>Academic Profile</TableHead>
                        <TableHead>Applied Date</TableHead>
                        <TableHead>Resume</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        // Table Skeleton
                        Array(5).fill(0).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><div className="flex gap-3"><Skeleton className="h-9 w-9 rounded-full" /><div className="space-y-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24" /></div></div></TableCell>
                                <TableCell><div className="space-y-1"><Skeleton className="h-4 w-20" /><Skeleton className="h-3 w-16" /></div></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : filteredApps.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                No applications found matching your criteria.
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredApps.map((app) => (
                            <TableRow key={app._id} className="hover:bg-muted/5">
                                {/* Candidate Info */}
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border border-border">
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                                {app.student?.avatar || "NA"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">
                                                {app.student?.firstName} {app.student?.lastName}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {app.student?.email}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Academic Snapshot */}
                                <TableCell>
                                    <div className="space-y-1">
                                        <Badge variant="outline" className="font-normal bg-background">
                                            {app.eligibilitySnapshot?.department || "N/A"}
                                        </Badge>
                                        <div className="text-xs text-muted-foreground flex gap-3">
                                            <span>CGPA: <strong className="text-foreground">{app.eligibilitySnapshot?.cgpa || 0}</strong></span>
                                            <span>Backlogs: <strong className={app.eligibilitySnapshot?.backlogs > 0 ? "text-red-600" : "text-foreground"}>{app.eligibilitySnapshot?.backlogs || 0}</strong></span>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Date */}
                                <TableCell>
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </TableCell>

                                {/* Resume */}
                                <TableCell>
                                    <Button variant="ghost" size="sm" className="h-8 gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                        <FileText className="h-3.5 w-3.5" /> Resume
                                    </Button>
                                </TableCell>

                                {/* Status Selector */}
                                <TableCell>
                                    <Select 
                                        defaultValue={app.status} 
                                        onValueChange={(val) => handleStatusChange(app._id, val)}
                                    >
                                        <SelectTrigger className={`h-8 w-[140px] text-xs font-medium border-0 ${getStatusBadgeStyles(app.status)}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="APPLIED">APPLIED</SelectItem>
                                            <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                                            <SelectItem value="INTERVIEW">Interview</SelectItem>
                                            <SelectItem value="SELECTED">Selected</SelectItem>
                                            <SelectItem value="REJECTED">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>

                                {/* Actions */}
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                                <ExternalLink className="mr-2 h-3.5 w-3.5" /> View Profile
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                                Reject Application
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
      </div>
    </div>
  );
}