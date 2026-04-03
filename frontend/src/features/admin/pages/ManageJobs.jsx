import React, { useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";

import { useAllJobs } from "@/features/jobs/hooks/useJobs.js";

const typeOptions = ["ALL", "Full Time", "Internship", "Intern + PPO"];
const statusOptions = ["ALL", "OPEN", "DRAFT", "CLOSED", "HOLD"];
const sortOptions = ["soonest", "newest", "package"];

const formatDeadline = (dateString) => {
  if (!dateString) return { display: "Not set", isUrgent: false, days: "" };

  const date = new Date(dateString);
  const today = new Date();
  const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));

  const display = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  if (diffDays < 0) return { display, isUrgent: false, days: "Passed" };
  if (diffDays === 0) return { display, isUrgent: true, days: "Today" };
  return { display, isUrgent: diffDays <= 3, days: `${diffDays} days` };
};

const getStatusClass = (job) => {
  const isUrgent = job.status === "OPEN" && formatDeadline(job.deadline).isUrgent;

  if (isUrgent) {
    return {
      text: "Closing soon",
      className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    };
  }

  if (job.status === "OPEN") {
    return {
      text: "Open",
      className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    };
  }

  if (job.status === "DRAFT") {
    return {
      text: "Draft",
      className: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    };
  }

  if (job.status === "HOLD") {
    return {
      text: "On Hold",
      className: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    };
  }

  return {
    text: "Closed",
    className: "bg-muted text-muted-foreground border-border",
  };
};

export default function ManageJobs() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("soonest");

  const { data: jobsResponse, isLoading } = useAllJobs();

  const allJobs = useMemo(() => {
    return jobsResponse?.data?.jobs || jobsResponse?.jobs || [];
  }, [jobsResponse]);

  const stats = useMemo(() => {
    return {
      all: allJobs.length,
      open: allJobs.filter((job) => job.status === "OPEN").length,
      draft: allJobs.filter((job) => job.status === "DRAFT").length,
      closed: allJobs.filter((job) => job.status === "CLOSED").length,
      hold: allJobs.filter((job) => job.status === "HOLD").length,
    };
  }, [allJobs]);

  const jobsList = useMemo(() => {
    let filtered = allJobs.filter((job) => {
      if (statusFilter !== "ALL" && job.status !== statusFilter) return false;
      if (typeFilter !== "ALL" && job.type !== typeFilter) return false;

      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;

      const values = [job.title, job.company?.name, job.location, job.workMode]
        .filter(Boolean)
        .map((item) => item.toLowerCase());

      return values.some((item) => item.includes(query));
    });

    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }

      if (sortBy === "package") {
        return Number(b.packageLPA || 0) - Number(a.packageLPA || 0);
      }

      const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY;
      const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY;
      return aDeadline - bDeadline;
    });

    return filtered;
  }, [allJobs, searchQuery, statusFilter, typeFilter, sortBy]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job listings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage all placement drives in one place.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="bg-transparent border-border hover:bg-muted">
            Export CSV
          </Button>
          <Button onClick={() => navigate("/admin/jobs/new")}>
            Post new drive
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { id: "ALL", label: "All drives", count: stats.all, desc: "This semester" },
          { id: "OPEN", label: "Open", count: stats.open, desc: "Accepting applications" },
          { id: "DRAFT", label: "Draft", count: stats.draft, desc: "Not published yet" },
          { id: "CLOSED", label: "Closed", count: stats.closed, desc: "Drive completed" },
          { id: "HOLD", label: "On hold", count: stats.hold, desc: "Paused by admin" },
        ].map((card) => {
          const active = statusFilter === card.id;
          return (
            <Card
              key={card.id}
              className={`cursor-pointer border-border transition-all ${active ? "bg-primary/5 border-primary shadow-sm" : "bg-card hover:bg-muted/50"}`}
              onClick={() => setStatusFilter(card.id)}
            >
              <CardContent className="p-4">
                <p className={`text-xs font-medium mb-1 ${active ? "text-primary" : "text-muted-foreground"}`}>{card.label}</p>
                <h3 className={`text-2xl font-bold mb-1 ${active ? "text-primary" : "text-foreground"}`}>{card.count}</h3>
                <p className="text-[10px] text-muted-foreground">{card.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search company, role, location..."
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {typeOptions.map((type) => (
            <Badge
              key={type}
              variant={typeFilter === type ? "default" : "outline"}
              className={`cursor-pointer rounded-full px-4 py-1.5 font-normal text-xs border-border ${
                typeFilter === type
                  ? "bg-primary/20 text-primary hover:bg-primary/30 border-transparent"
                  : "hover:bg-muted"
              }`}
              onClick={() => setTypeFilter(type)}
            >
              {type === "ALL" ? "All types" : type}
            </Badge>
          ))}
        </div>
      </div>

      <div className="w-full md:w-64">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort jobs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={sortOptions[0]}>Deadline: soonest</SelectItem>
            <SelectItem value={sortOptions[1]}>Posted: newest</SelectItem>
            <SelectItem value={sortOptions[2]}>Package: high to low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm font-medium text-foreground">
        <span className="font-bold">{stats.open} open drives</span> • {stats.draft} draft drives
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-[320px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">Drive</TableHead>
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
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                </TableCell>
              </TableRow>
            ) : jobsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  No drives found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              jobsList.map((job) => {
                const statusMeta = getStatusClass(job);
                const isIntern = job.type?.includes("Intern");
                const packageDisplay =
                  isIntern && job.stipend?.amount
                    ? `${job.stipend.amount / 1000}k/mo`
                    : `${job.packageLPA || 0} LPA`;

                const deadlineMeta = formatDeadline(job.deadline);
                const applicantsTotal = job.stats?.totalApplications || 0;

                return (
                  <TableRow key={job._id || job.jobCode} className="border-border hover:bg-muted/30 transition-colors">
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
                          <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[220px]">
                            {job.company?.name} • {job.location || job.workMode}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className={`font-medium text-[10px] rounded-full whitespace-nowrap ${statusMeta.className}`}>
                        {statusMeta.text}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="font-normal text-[10px] rounded-full border-border bg-transparent text-muted-foreground">
                        {job.type}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-medium text-sm text-foreground">{packageDisplay}</TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">{applicantsTotal}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {job.stats?.eligible || 0} eligible
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col max-w-[120px]">
                        <span className={`text-sm font-medium ${deadlineMeta.isUrgent ? "text-amber-500" : "text-foreground"}`}>
                          {deadlineMeta.display} {deadlineMeta.days && `• ${deadlineMeta.days}`}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs bg-transparent border-border/60 hover:bg-muted"
                          onClick={() => navigate(`/admin/jobs/${job.jobCode}`)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => navigate(`/admin/jobs/${job.jobCode}/edit`)}
                        >
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Quick status filter:</span>
        {statusOptions.map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(status)}
            className="h-7 text-xs"
          >
            {status}
          </Button>
        ))}
      </div>
    </div>
  );
}
