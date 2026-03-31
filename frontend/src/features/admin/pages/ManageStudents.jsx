import React, { useState, useMemo, useCallback } from "react";
import {
  Search,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button }                               from "@/shared/ui/button";
import { Input }                                from "@/shared/ui/input";
import { Badge }                                from "@/shared/ui/badge";
import { Card, CardContent }                    from "@/shared/ui/card";
import { Sheet, SheetContent, SheetDescription,
         SheetHeader, SheetTitle, SheetFooter } from "@/shared/ui/sheet";
import { Select, SelectContent, SelectItem,
         SelectTrigger, SelectValue }           from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead,
         TableHeader, TableRow }                from "@/shared/ui/table";
import { Avatar, AvatarFallback }               from "@/shared/ui/avatar";
import { Label }                                from "@/shared/ui/label";
import { Switch }                               from "@/shared/ui/switch";
import { Tabs, TabsContent, TabsList,
         TabsTrigger }                          from "@/shared/ui/tabs";
import { Separator }                            from "@/shared/ui/separator";

// Student hooks
import { useAllStudents, useStudentById }       from "@/features/student/hooks/useStudent.js";

// Application hooks — three used below:
//   useDeleteApplication  → row-level delete action
//   useUpdateApplicationStatus → inline placement status override
//   useJobApplications    → application count per student (via profileCode)
import {
  useDeleteApplication,
  useUpdateApplicationStatus,
  useJobApplications,
} from "@/features/applications/hooks/useApplications.js";

// ─── Small sub-component: application count cell ─────────────────────────────
// Keeps the main table row clean; each instance fetches its own count.
// Memoised so re-renders of the parent don't re-fetch unnecessarily.
const AppCountCell = React.memo(({ profileCode }) => {
  const { data, isLoading } = useJobApplications(profileCode);
  if (isLoading) return <span className="text-xs text-muted-foreground">…</span>;
  const total   = data?.length ?? 0;
  const active  = data?.filter(a => ["APPLIED","SHORTLISTED","INTERVIEW"].includes(a.status)).length ?? 0;
  return (
    <div>
      <span className="text-sm font-bold text-foreground">{total}</span>
      <p className="text-[10px] text-muted-foreground">{active} active</p>
    </div>
  );
});

// ─── Edit sheet — isolated so it only mounts useStudentById when open ─────────
const EditStudentSheet = ({ profileCode, isOpen, onClose }) => {
  // Only runs the query (and the mutation) when a real profileCode exists.
  const { student, isLoading, updateStudent, isUpdating } = useStudentById(profileCode);

  const [form, setForm] = useState(null);

  // Seed local form state once the remote data arrives.
  React.useEffect(() => {
    if (student) {
      setForm({
        firstName:      student.firstName      ?? "",
        lastName:       student.lastName       ?? "",
        department:     student.department     ?? "",
        cgpa:           student.cgpa           ?? 0,
        backlogs:       student.backlogs       ?? 0,
        graduationYear: student.graduationYear ?? new Date().getFullYear(),
        isActive:       student.isActive       ?? true,
        isVerified:     student.isVerified     ?? false,
      });
    }
  }, [student]);

  const set = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = async () => {
    if (!form) return;
    try {
      await updateStudent(form);   // ← actually calls the mutation now
      onClose();
    } catch {
      // error toast is handled inside useStudentById
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md overflow-y-auto bg-background border-border">
        <SheetHeader className="mb-6">
          <SheetTitle>Edit student</SheetTitle>
          <SheetDescription>Update academic records or manage account access.</SheetDescription>
        </SheetHeader>

        {isLoading || !form ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="academic" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted">
              <TabsTrigger value="academic">Academic info</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            <TabsContent value="academic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First name</Label>
                  <Input value={form.firstName} onChange={e => set("firstName", e.target.value)} className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Last name</Label>
                  <Input value={form.lastName} onChange={e => set("lastName", e.target.value)} className="bg-background border-border" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={form.department} onValueChange={v => set("department", v)}>
                  <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["B.Tech CS","B.Tech IT","MCA","MBA","M.Tech"].map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>CGPA</Label>
                  <Input type="number" step="0.01" min="0" max="10"
                    value={form.cgpa}
                    onChange={e => set("cgpa", parseFloat(e.target.value))}
                    className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Backlogs</Label>
                  <Input type="number" min="0"
                    value={form.backlogs}
                    onChange={e => set("backlogs", parseInt(e.target.value, 10))}
                    className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Batch year</Label>
                  <Input type="number"
                    value={form.graduationYear}
                    onChange={e => set("graduationYear", parseInt(e.target.value, 10))}
                    className="bg-background border-border" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="account" className="space-y-4">
              <div className="p-4 border border-border rounded-lg bg-muted/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Account active</Label>
                    <p className="text-xs text-muted-foreground">Disabling blocks login immediately.</p>
                  </div>
                  <Switch checked={form.isActive} onCheckedChange={v => set("isActive", v)} />
                </div>
                <Separator className="bg-border" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Email verified</Label>
                    <p className="text-xs text-muted-foreground">Toggle if manually confirmed by admin.</p>
                  </div>
                  <Switch checked={form.isVerified} onCheckedChange={v => set("isVerified", v)} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <SheetFooter className="mt-8 pt-4 border-t border-border gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={isUpdating || isLoading || !form} className="flex-1">
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (first = "", last = "") =>
  `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

const cgpaColor = (cgpa) => {
  if (cgpa >= 7.5) return "text-emerald-500";
  if (cgpa >= 6.0) return "text-amber-500";
  return "text-red-500";
};

const DEPARTMENTS = ["B.Tech CS", "B.Tech IT", "MCA", "MBA", "M.Tech"];

// ─── Main component ───────────────────────────────────────────────────────────
export default function ManageStudents() {
  const navigate = useNavigate();

  // ── Filter state ─────────────────────────────────────────────────────────
  const [searchQuery,        setSearchQuery]        = useState("");
  const [deptFilter,         setDeptFilter]         = useState("all");
  const [cgpaMin,            setCgpaMin]            = useState("");
  const [cgpaMax,            setCgpaMax]            = useState("");
  const [placementFilter,    setPlacementFilter]    = useState("all");
  const [completenessFilter, setCompletenessFilter] = useState("all");
  const [backlogFilter,      setBacklogFilter]      = useState("any");
  const [sortBy,             setSortBy]             = useState("cgpa_desc");

  // ── Bulk selection ────────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState(new Set());

  // ── Edit sheet ────────────────────────────────────────────────────────────
  const [editingCode, setEditingCode] = useState(null); // profileCode | null

  // ── Mutations ─────────────────────────────────────────────────────────────
  const { mutate: deleteApplication }         = useDeleteApplication();
  const { mutate: updateApplicationStatus }   = useUpdateApplicationStatus();

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data, isLoading, isError, error } = useAllStudents();

  const allStudents = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total    = allStudents.length;
    const complete = allStudents.filter(s => (s.profileCompleteness ?? 0) >= 80).length;
    const placed   = allStudents.filter(s => s.placementStatus === "PLACED").length;
    return {
      total,
      complete,
      completePercent: total > 0 ? Math.round((complete / total) * 100) : 0,
      incomplete:      total - complete,
      placed,
      placedPercent:   total > 0 ? Math.round((placed / total) * 100) : 0,
      unplaced:        total - placed,
    };
  }, [allStudents]);

  // ── Filtered + sorted list ────────────────────────────────────────────────
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase();

    return allStudents
      .filter(s => {
        if (q) {
          const name = `${s.firstName} ${s.lastName}`.toLowerCase();
          const code = (s.profileCode ?? "").toLowerCase();
          if (!name.includes(q) && !code.includes(q)) return false;
        }
        if (deptFilter !== "all" && s.department !== deptFilter)       return false;
        if (cgpaMin    && (s.cgpa ?? 0) < parseFloat(cgpaMin))         return false;
        if (cgpaMax    && (s.cgpa ?? 0) > parseFloat(cgpaMax))         return false;
        if (placementFilter === "placed"   && s.placementStatus !== "PLACED")  return false;
        if (placementFilter === "unplaced" && s.placementStatus === "PLACED")  return false;
        if (completenessFilter === "complete"   && (s.profileCompleteness ?? 0) < 80)  return false;
        if (completenessFilter === "incomplete" && (s.profileCompleteness ?? 0) >= 80) return false;
        if (backlogFilter === "zero" && (s.backlogs ?? 0) > 0)         return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "cgpa_desc") return (b.cgpa ?? 0) - (a.cgpa ?? 0);
        if (sortBy === "cgpa_asc")  return (a.cgpa ?? 0) - (b.cgpa ?? 0);
        if (sortBy === "name_asc")  return (a.firstName ?? "").localeCompare(b.firstName ?? "");
        if (sortBy === "completeness_asc") return (a.profileCompleteness ?? 0) - (b.profileCompleteness ?? 0);
        return 0;
      });
  }, [allStudents, searchQuery, deptFilter, cgpaMin, cgpaMax, placementFilter, completenessFilter, backlogFilter, sortBy]);

  const clearFilters = () => {
    setSearchQuery(""); setDeptFilter("all"); setCgpaMin(""); setCgpaMax("");
    setPlacementFilter("all"); setCompletenessFilter("all"); setBacklogFilter("any");
  };

  // ── Bulk selection handlers ───────────────────────────────────────────────
  const allVisibleIds  = filteredStudents.map(s => s.profileCode);
  const allSelected    = allVisibleIds.length > 0 && allVisibleIds.every(id => selectedIds.has(id));
  const someSelected   = selectedIds.size > 0;

  const toggleAll = () => {
    setSelectedIds(allSelected
      ? new Set()
      : new Set(allVisibleIds)
    );
  };

  const toggleOne = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Bulk action: mark selected students' latest application as PLACED ─────
  // Uses useUpdateApplicationStatus — one call per selected student.
  const handleBulkMarkPlaced = () => {
    selectedIds.forEach(profileCode => {
      updateApplicationStatus({ profileCode, status: "HIRED" });
    });
    setSelectedIds(new Set());
  };

  // ── Row action: delete a student's last application ───────────────────────
  // Uses useDeleteApplication.
  const handleDeleteLastApplication = (appId) => {
    if (!appId) return;
    deleteApplication(appId);
  };

  // ── Error state ───────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center gap-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div>
          <h3 className="text-lg font-semibold">Failed to load students</h3>
          <p className="text-muted-foreground">{error?.message ?? "Please try again."}</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-12 font-sans text-foreground">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student management</h1>
          <p className="text-sm text-muted-foreground mt-1">{stats.total} registered · Batch 2026</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-transparent border-border hover:bg-muted">Export CSV</Button>
          <Button variant="outline" className="bg-transparent border-border hover:bg-muted">Notify filtered</Button>
          <Button>+ Add student</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "All students",      value: stats.total,      sub: "Batch 2026",                color: "" },
          { label: "Profile complete",  value: stats.complete,   sub: `${stats.completePercent}% of batch`, color: "text-primary" },
          { label: "Incomplete",        value: stats.incomplete, sub: "Below 80%",                 color: "text-amber-500" },
          { label: "Placed",            value: stats.placed,     sub: `${stats.placedPercent}% of batch`, color: "text-emerald-500" },
          { label: "Not placed",        value: stats.unplaced,   sub: "Active in drives",          color: "" },
        ].map(({ label, value, sub, color }) => (
          <Card key={label} className="bg-card border-border shadow-sm cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
              <h3 className={`text-2xl font-bold mb-1 ${color || "text-foreground"}`}>{value}</h3>
              <p className="text-[10px] text-muted-foreground">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-muted/20 border border-border rounded-xl p-5 space-y-5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search name, roll number…" className="pl-9 bg-card border-border h-9"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="w-full md:w-56 space-y-1">
            <Label className="text-[10px] uppercase text-muted-foreground font-semibold">Department</Label>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="h-9 bg-card border-border"><SelectValue placeholder="All departments" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-end flex-wrap">
          <div className="space-y-1">
            <Label className="text-[10px] uppercase text-muted-foreground font-semibold">CGPA range</Label>
            <div className="flex items-center gap-2">
              <Input type="number" placeholder="0"  className="w-20 h-9 bg-card border-border text-center"
                value={cgpaMin} onChange={e => setCgpaMin(e.target.value)} />
              <span className="text-muted-foreground">–</span>
              <Input type="number" placeholder="10" className="w-20 h-9 bg-card border-border text-center"
                value={cgpaMax} onChange={e => setCgpaMax(e.target.value)} />
            </div>
          </div>

          <div className="w-full md:w-44 space-y-1">
            <Label className="text-[10px] uppercase text-muted-foreground font-semibold">Placement</Label>
            <Select value={placementFilter} onValueChange={setPlacementFilter}>
              <SelectTrigger className="h-9 bg-card border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="placed">Placed</SelectItem>
                <SelectItem value="unplaced">Not placed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Chip toggles */}
          {[
            {
              label: "Profile completeness",
              state: completenessFilter, setState: setCompletenessFilter,
              options: [["all","All"],["complete","Complete"],["incomplete","Incomplete"]],
            },
            {
              label: "Backlogs",
              state: backlogFilter, setState: setBacklogFilter,
              options: [["any","Any"],["zero","0 only"]],
            },
          ].map(({ label, state, setState, options }) => (
            <div key={label} className="space-y-1">
              <Label className="text-[10px] uppercase text-muted-foreground font-semibold">{label}</Label>
              <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-lg h-9">
                {options.map(([val, text]) => (
                  <button key={val} onClick={() => setState(val)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      state === val ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}>
                    {text}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <Button variant="ghost" className="h-9 text-muted-foreground hover:text-foreground ml-auto"
            onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      </div>

      {/* Table controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm">
          <span className="font-bold">{filteredStudents.length} students</span>
          <span className="text-muted-foreground"> · {completenessFilter} profiles</span>
        </p>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[200px] bg-transparent border-border h-8 text-xs">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cgpa_desc">CGPA: high to low</SelectItem>
            <SelectItem value="cgpa_asc">CGPA: low to high</SelectItem>
            <SelectItem value="name_asc">Name: A–Z</SelectItem>
            <SelectItem value="completeness_asc">Completeness: low first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk action bar — only visible when rows are selected */}
      {someSelected && (
        <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg px-4 py-2">
          <span className="text-sm font-medium text-primary">
            {selectedIds.size} student{selectedIds.size !== 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleBulkMarkPlaced}>
              Mark hired
            </Button>
            <Button size="sm" variant="outline"
              onClick={() => setSelectedIds(new Set())}>
              Clear selection
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-10 text-center">
                <input type="checkbox" checked={allSelected}
                  onChange={toggleAll}
                  className="rounded border-muted-foreground/30 cursor-pointer" />
              </TableHead>
              <TableHead className="text-xs uppercase text-muted-foreground font-semibold w-[240px]">Student</TableHead>
              <TableHead className="text-xs uppercase text-muted-foreground font-semibold">Department</TableHead>
              <TableHead className="text-xs uppercase text-muted-foreground font-semibold">CGPA</TableHead>
              <TableHead className="text-xs uppercase text-muted-foreground font-semibold">Completeness</TableHead>
              <TableHead className="text-xs uppercase text-muted-foreground font-semibold">Applications</TableHead>
              <TableHead className="text-xs uppercase text-muted-foreground font-semibold">Placement</TableHead>
              <TableHead className="text-right text-xs uppercase text-muted-foreground font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  No students match your current filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map(student => {
                const { profileCode, firstName, lastName, department,
                        cgpa = 0, profileCompleteness = 0,
                        placementStatus, lastAppId } = student;

                const isComplete = profileCompleteness >= 80;
                const isPlaced   = placementStatus === "PLACED";
                const isSelected = selectedIds.has(profileCode);

                return (
                  <TableRow key={profileCode}
                    className={`border-border transition-colors hover:bg-muted/30 ${isSelected ? "bg-primary/5" : ""}`}>

                    <TableCell className="text-center">
                      <input type="checkbox" checked={isSelected}
                        onChange={() => toggleOne(profileCode)}
                        className="rounded border-muted-foreground/30 cursor-pointer" />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border bg-muted">
                          <AvatarFallback className="text-xs font-semibold text-primary bg-primary/10">
                            {getInitials(firstName, lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold leading-tight">
                            {firstName} {lastName}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[170px]">
                            {profileCode}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline"
                        className="font-normal text-[10px] rounded-full border-border bg-transparent text-muted-foreground">
                        {department ?? "N/A"}
                      </Badge>
                    </TableCell>

                    <TableCell className={`font-semibold text-sm ${cgpaColor(cgpa)}`}>
                      {cgpa}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden shrink-0">
                          <div className={`h-full rounded-full ${isComplete ? "bg-emerald-500" : "bg-amber-500"}`}
                            style={{ width: `${profileCompleteness}%` }} />
                        </div>
                        <span className={`text-[10px] font-medium ${isComplete ? "text-emerald-500" : "text-amber-500"}`}>
                          {profileCompleteness}%
                        </span>
                      </div>
                    </TableCell>

                    {/* AppCountCell uses useJobApplications internally */}
                    <TableCell>
                      <AppCountCell profileCode={profileCode} />
                    </TableCell>

                    <TableCell>
                      {isPlaced
                        ? <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500 rounded-full px-2.5">Placed</Badge>
                        : <Badge variant="outline" className="bg-muted/30 border-border text-muted-foreground rounded-full px-2.5">Not placed</Badge>
                      }
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm"
                          className="h-8 text-[10px] bg-transparent border-border/60 hover:bg-muted"
                          onClick={() => setEditingCode(profileCode)}>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm"
                          className="h-8 text-[10px] bg-transparent border-border/60 hover:bg-muted"
                          onClick={() => navigate(`/admin/students/${profileCode}`)}>
                          View
                        </Button>
                        {/* useDeleteApplication — only shown when a known appId exists */}
                        {lastAppId && (
                          <Button variant="outline" size="sm"
                            className="h-8 text-[10px] bg-transparent border-red-500/30 text-red-500 hover:bg-red-500/10"
                            onClick={() => handleDeleteLastApplication(lastAppId)}>
                            Del app
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit sheet — mounts useStudentById only when editingCode is set */}
      {editingCode && (
        <EditStudentSheet
          profileCode={editingCode}
          isOpen={!!editingCode}
          onClose={() => setEditingCode(null)}
        />
      )}
    </div>
  );
}