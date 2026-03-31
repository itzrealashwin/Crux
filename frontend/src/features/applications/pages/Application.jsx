import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMyApplications, useWithdrawApplication } from "@/features/applications/hooks/useApplicaitions.js";
import {
  Loader2,
  Building2,
  Calendar,
  Briefcase,
  MoreVertical,
  Trash2,
  ExternalLink,
  AlertCircle,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/shared/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

const Application = () => {
  const navigate = useNavigate();
  const { data: applicationsData, isLoading } = useMyApplications();
  const { mutate: withdraw, isAPPLIED: isWithdrawing } = useWithdrawApplication();
  console.log(applicationsData);
  
  const [appToWithdraw, setAppToWithdraw] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const applications = Array.isArray(applicationsData) ? applicationsData : applicationsData?.data || [];

  // --- Filtering Logic ---
// --- Filtering Logic ---
  const filteredApplications = applications.filter(app => {
    // FIX: Look inside jobId, not jobDetails
    const jobTitle = app.jobId?.title?.toLowerCase() || "";
    const companyName = app.jobId?.company?.name?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = jobTitle.includes(query) || companyName.includes(query);
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeApplications = filteredApplications.filter(app => 
    ['APPLIED', 'APPLIED', 'SHORTLISTED', 'INTERVIEW'].includes(app.status)
  );
  
  const archivedApplications = filteredApplications.filter(app => 
    ['SELECTED', 'HIRED', 'REJECTED', 'WITHDRAWN'].includes(app.status)
  );

  // --- Helpers ---
  const getStatusBadge = (status) => {
    switch (status) {
      case "SELECTED":
      case "HIRED":
        return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/25 gap-1"><CheckCircle2 className="w-3 h-3"/> Selected</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-500/15 text-red-600 border-red-500/20 hover:bg-red-500/25 gap-1"><XCircle className="w-3 h-3"/> Rejected</Badge>;
      case "SHORTLISTED":
        return <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/20 hover:bg-blue-500/25">Shortlisted</Badge>;
      case "INTERVIEW":
        return <Badge className="bg-purple-500/15 text-purple-600 border-purple-500/20 hover:bg-purple-500/25">Interview</Badge>;
      case "WITHDRAWN":
        return <Badge variant="secondary" className="text-muted-foreground">Withdrawn</Badge>;
      default:
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">APPLIED Review</Badge>;
    }
  };

  const handleWithdraw = () => {
    if (appToWithdraw) {
      withdraw(appToWithdraw);
      setAppToWithdraw(null);
    }
  };

  const canWithdraw = (status) => ["APPLIED", "APPLIED"].includes(status);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const ApplicationsTable = ({ data }) => {
    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Briefcase className="h-10 w-10 mb-3 opacity-20" />
          <p>No applications found in this category.</p>
        </div>
      );
    }

    return (
      <div className="rounded-md border border-border overflow-hidden">
        
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[350px]">Role & Company</TableHead>
              <TableHead>Applied On</TableHead>
              <TableHead>Current Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
        <TableBody>
            {data.map((app) => (
              <TableRow key={app._id || app.appId} className="hover:bg-muted/5 group">
                <TableCell>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 text-primary font-bold">
                      {/* FIX: Use app.jobId.company.name */}
                      {app.jobId?.company?.name?.[0] || <Building2 className="h-5 w-5" />}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {/* FIX: Use app.jobId.title */}
                        {app.jobId?.title || "Unknown Role"}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {/* FIX: Use app.jobId.company.name */}
                        {app.jobId?.company?.name || "Unknown Company"}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {/* Fallback to history timestamp if createdAt is missing */}
                      {new Date(app.createdAt || app.history?.[0]?.timestamp).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(app.status)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {/* FIX: Because jobId is an object, we need to pass its nested _id or jobCode to the URL */}
                      <DropdownMenuItem onClick={() => navigate(`/student/jobs/${app.jobId?.jobCode || app.jobId?._id}`)} className="cursor-pointer">
                        <ExternalLink className="mr-2 h-4 w-4 text-muted-foreground" />
                        View Job Details
                      </DropdownMenuItem>
                      
                      {canWithdraw(app.status) && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setAppToWithdraw(app._id || app.appId)} // Pass correct ID for withdrawal
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Withdraw Application
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Applications</h1>
          <p className="text-muted-foreground mt-1">Manage and track your ongoing job applications.</p>
        </div>
        <Button onClick={() => navigate("/student/jobs")} className="shadow-md">
          <Briefcase className="mr-2 h-4 w-4" /> Browse More Jobs
        </Button>
      </div>

      {/* 2. Filters & Controls */}
      <Card className="border-border shadow-sm bg-card">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by company or role..." 
              className="pl-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-background">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="APPLIED">APPLIED</SelectItem>
                <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                <SelectItem value="SELECTED">Selected</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 3. Main Content Area */}
      <Tabs defaultValue="active" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="active" className="gap-2">
            Active <Badge variant="secondary" className="px-1.5 py-0 h-5 text-[10px]">{activeApplications.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="archived" className="gap-2">
            History <Badge variant="secondary" className="px-1.5 py-0 h-5 text-[10px]">{archivedApplications.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Active Applications</CardTitle>
              <CardDescription>Applications currently in progress.</CardDescription>
            </CardHeader>
            <CardContent>
              <ApplicationsTable data={activeApplications} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Application History</CardTitle>
              <CardDescription>Past applications including rejected or withdrawn ones.</CardDescription>
            </CardHeader>
            <CardContent>
              <ApplicationsTable data={archivedApplications} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Withdraw Confirmation Modal */}
      <AlertDialog open={!!appToWithdraw} onOpenChange={(open) => !open && setAppToWithdraw(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Withdraw Application?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You will lose your candidacy for this role and may not be able to apply again if the deadline has passed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Application</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleWithdraw}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isWithdrawing ? "Processing..." : "Yes, Withdraw"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default Application;