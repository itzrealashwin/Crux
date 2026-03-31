import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAllJobs } from "@/features/jobs/hooks/useJobs.js"; // Ensure path is correct
import { useStudentProfile } from "@/features/student/hooks/useStudent.js";
import { useApplyForJob } from "@/features/applications/hooks/useApplicaitions.js";
import { 
  Loader2, 
  Search, 
  Calendar,
  Building2
} from "lucide-react";

// Shadcn UI Imports
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Checkbox } from "@/shared/ui/checkbox"; // Need to have this installed
import { Slider } from "@/shared/ui/slider";     // Need to have this installed

const JobListingPage = () => {
  const navigate = useNavigate();
  
  // --- Filter States ---
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("deadline_soonest");
  
  // Faceted Filters
  const [filters, setFilters] = useState({
    eligibility: [],
    jobType: [],
    workMode: [],
    status: ["Open"],
    bond: [],
    minPackage: 0
  });

  const handleFilterChange = (category, value) => {
    setFilters(prev => {
      const current = prev[category];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [category]: [...current, value] };
      }
    });
  };

  const clearAllFilters = () => {
    setFilters({
      eligibility: [],
      jobType: [],
      workMode: [],
      status: [],
      bond: [],
      minPackage: 0
    });
    setSearchQuery("");
  };

  // --- API Hooks ---
  const { profile, isLoading: isLoadingProfile } = useStudentProfile();
  const studentProfile = profile?.data || profile;

  const { data: apiResponse, isLoading: isLoadingJobs } = useAllJobs();
  const { mutate: apply, isPending: isApplying, variables: applyingId } = useApplyForJob();

  let jobs = [];
  if (apiResponse?.data?.jobs && Array.isArray(apiResponse.data.jobs)) {
    jobs = apiResponse.data.jobs;
  } else if (apiResponse?.jobs && Array.isArray(apiResponse.jobs)) {
    jobs = apiResponse.jobs;
  }

  // --- Eligibility Engine ---
  const getEligibilityStatus = (job) => {
    if (!studentProfile) return { status: "Not eligible", variant: "destructive" };
    
    const criteria = job.eligibility || {};
    
    // Hard blocks
    const deptEligible = !criteria.allowedDepartments?.length || criteria.allowedDepartments.includes(studentProfile.department);
    const cgpaEligible = !criteria.minCgpa || (studentProfile.cgpa >= criteria.minCgpa);
    const backlogEligible = criteria.maxBacklogs === undefined || (studentProfile.backlogs <= criteria.maxBacklogs);

    if (!deptEligible || !cgpaEligible || !backlogEligible) {
      return { status: "Not eligible", variant: "destructive", reason: !cgpaEligible ? `${criteria.minCgpa} CGPA needed` : "Criteria unmet" };
    }

    // Soft blocks (Skills) - assuming job.skillsRequired and studentProfile.skills exist
    const jobSkills = job.skillsRequired || [];
    const studentSkills = studentProfile.skills || [];
    const missingSkills = jobSkills.filter(skill => !studentSkills.includes(skill));

    if (missingSkills.length > 0) {
      return { status: "Skills gap", variant: "secondary" }; // Warning/Yellow
    }

    return { status: "Fully eligible", variant: "default" }; // Success/Green
  };

  // --- Filter & Sort Engine ---
  const filteredAndSortedJobs = useMemo(() => {
    let result = jobs.filter(job => {
      // Search
      const companyName = job.company?.name || "";
      const matchesSearch = !searchQuery || 
        job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        companyName.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Min Package
      if (filters.minPackage > 0 && (job.packageLPA || 0) < filters.minPackage) return false;

      // Job Type
      if (filters.jobType.length > 0 && !filters.jobType.includes(job.type)) return false;

      // Work Mode
      if (filters.workMode.length > 0 && !filters.workMode.includes(job.workMode)) return false;

      // Status
      if (filters.status.length > 0) {
        const isOpen = job.status !== "CLOSED";
        if (filters.status.includes("Open") && !isOpen) return false;
      }

      return true;
    });

    // Sort
    if (sortBy === "deadline_soonest") {
      result.sort((a, b) => new Date(a.deadline || "2099") - new Date(b.deadline || "2099"));
    } else if (sortBy === "package_high") {
      result.sort((a, b) => (b.packageLPA || 0) - (a.packageLPA || 0));
    }

    return result;
  }, [jobs, filters, searchQuery, sortBy]);

  // --- Formatting Helpers ---
  const formatDeadline = (dateString) => {
    if (!dateString) return { text: "No deadline", isUrgent: false };
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: "Closed", isUrgent: false };
    if (diffDays === 0) return { text: `Closes today · ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`, isUrgent: true };
    if (diffDays === 1) return { text: "Closes tomorrow", isUrgent: true };
    return { text: `Closes ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`, isUrgent: diffDays <= 3 };
  };

  // --- Loading States ---
  if (isLoadingProfile || isLoadingJobs) {
    return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!studentProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <div className="p-4 rounded-full bg-muted"><Building2 className="h-8 w-8 text-muted-foreground" /></div>
        <div className="text-foreground font-medium text-lg">Please complete your profile to view jobs.</div>
        <Button onClick={() => navigate("/student/profile/edit")}>Complete Profile</Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background text-foreground font-sans">
      
      {/* --- SIDEBAR FILTERS --- */}
      <aside className="w-72 overflow-y-auto border-r border-border bg-card/30 hidden md:block">
        <div className="p-5 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10 border-b border-border/50">
          <h2 className="font-semibold text-lg">Filters</h2>
          <Button variant="outline" size="sm" onClick={clearAllFilters} className="h-8 text-xs font-normal bg-transparent border-border hover:bg-muted">
            Clear all
          </Button>
        </div>

        <div className="p-5 space-y-8">
          
          {/* Eligibility */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Eligibility</h3>
            {["Eligible for me", "Borderline", "All drives"].map((label) => (
              <div key={label} className="flex items-center space-x-3">
                <Checkbox 
                  id={`eligibility-${label}`} 
                  checked={filters.eligibility.includes(label)}
                  onCheckedChange={() => handleFilterChange('eligibility', label)}
                />
                <label htmlFor={`eligibility-${label}`} className="text-sm font-medium leading-none cursor-pointer flex-1">
                  {label}
                </label>
              </div>
            ))}
          </div>

          {/* Job Type */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Job Type</h3>
            {["Full time", "Internship", "Intern + PPO"].map((label) => (
              <div key={label} className="flex items-center space-x-3">
                <Checkbox 
                  id={`type-${label}`} 
                  checked={filters.jobType.includes(label)}
                  onCheckedChange={() => handleFilterChange('jobType', label)}
                />
                <label htmlFor={`type-${label}`} className="text-sm font-medium leading-none cursor-pointer">{label}</label>
              </div>
            ))}
          </div>

          {/* Work Mode */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Work Mode</h3>
            {["On-site", "Hybrid", "Remote"].map((label) => (
              <div key={label} className="flex items-center space-x-3">
                <Checkbox 
                  id={`mode-${label}`} 
                  checked={filters.workMode.includes(label)}
                  onCheckedChange={() => handleFilterChange('workMode', label)}
                />
                <label htmlFor={`mode-${label}`} className="text-sm font-medium leading-none cursor-pointer">{label}</label>
              </div>
            ))}
          </div>

          {/* Min Package */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Min Package (LPA)</h3>
            <Slider 
              value={[filters.minPackage]} 
              max={40} 
              step={1} 
              onValueChange={(val) => setFilters(prev => ({...prev, minPackage: val[0]}))}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>0</span>
              <span className="text-primary">{filters.minPackage > 0 ? `${filters.minPackage}+` : ''}</span>
              <span>40+</span>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Status</h3>
            {["Open", "Closing soon", "Already applied"].map((label) => (
              <div key={label} className="flex items-center space-x-3">
                <Checkbox 
                  id={`status-${label}`} 
                  checked={filters.status.includes(label)}
                  onCheckedChange={() => handleFilterChange('status', label)}
                />
                <label htmlFor={`status-${label}`} className="text-sm font-medium leading-none cursor-pointer">{label}</label>
              </div>
            ))}
          </div>

        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto bg-muted/10 p-6 md:p-8">
        
        {/* Top Search & Sort */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search companies, roles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card border-border/50 focus-visible:ring-1"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[220px] bg-card border-border/50">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="deadline_soonest">Deadline: soonest</SelectItem>
              <SelectItem value="package_high">Package: High to Low</SelectItem>
              <SelectItem value="newest">Recently Posted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Header */}
        <div className="mb-6">
          <p className="text-sm font-medium text-foreground">
            <span className="font-bold text-base">{filteredAndSortedJobs.length} drives</span> match your profile
          </p>
        </div>

        {/* Job Cards List */}
        <div className="space-y-4">
          {filteredAndSortedJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl bg-card border border-dashed border-border/50">
              <div className="p-4 bg-muted rounded-full mb-4"><Search className="h-6 w-6 text-muted-foreground" /></div>
              <h3 className="text-lg font-semibold">No matches found</h3>
              <p className="text-muted-foreground mt-1 text-sm">Try adjusting your filters on the left.</p>
            </div>
          ) : (
            filteredAndSortedJobs.map((job, index) => {
              const elig = getEligibilityStatus(job);
              const deadlineInfo = formatDeadline(job.deadline);
              const isIntern = job.type?.includes("Intern");
              
              // Formatting logic matching the image strictly
              let salaryText = "N/A";
              if (job.packageLPA) salaryText = `${job.packageLPA} LPA`;
              if (isIntern && job.stipend?.amount) salaryText = `${job.stipend.amount / 1000}k/mo`;

              return (
                <Card 
                  key={job._id || job.id} 
                  onClick={() => navigate(`/student/jobs/${job.jobCode || job._id || job.id}`)}
                  className={`bg-card/50 hover:bg-card transition-colors overflow-hidden border cursor-pointer ${index === 0 ? 'border-primary/50 shadow-sm shadow-primary/5' : 'border-border/50'}`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      
                      {/* Left: Avatar & Info */}
                      <div className="flex gap-4">
                        <Avatar className="h-12 w-12 rounded-lg border border-border/50 bg-muted/50">
                          <AvatarImage src={job.company?.logoUrl} />
                          <AvatarFallback className="rounded-lg font-bold text-muted-foreground">
                            {job.company?.name?.substring(0, 3).toUpperCase() || "CMP"}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold leading-none">{job.title}</h3>
                            {/* "New" Badge logic could be within 3 days */}
                            {index === 0 && <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 px-1.5 py-0 text-[10px] h-4">New</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {job.company?.name || "Company"} · {job.location || "Remote"}
                          </p>
                        </div>
                      </div>

                      {/* Right: Salary & Eligibility Badge */}
                      <div className="text-left md:text-right flex flex-col md:items-end justify-start gap-2">
                        <p className="text-xl font-bold text-foreground leading-none">{salaryText}</p>
                        
                        <Badge 
                          variant={elig.variant === "default" ? "default" : "outline"}
                          className={`
                            rounded-full font-medium text-xs px-3 py-0.5 border
                            ${elig.status === "Fully eligible" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20" : ""}
                            ${elig.status === "Skills gap" ? "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20" : ""}
                            ${elig.status === "Not eligible" ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20" : ""}
                          `}
                        >
                          {elig.status}
                        </Badge>
                      </div>

                    </div>

                    {/* Middle: Tags Row */}
                    <div className="flex flex-wrap gap-2 mt-5">
                      <Badge variant="outline" className="rounded-full font-normal text-xs text-muted-foreground border-border/60">{job.type || "Full time"}</Badge>
                      <Badge variant="outline" className="rounded-full font-normal text-xs text-muted-foreground border-border/60">{job.workMode || "On-site"}</Badge>
                      {job.eligibility?.targetBatch && <Badge variant="outline" className="rounded-full font-normal text-xs text-muted-foreground border-border/60">Batch {job.eligibility.targetBatch.join(', ')}</Badge>}
                      
                      {/* Show a few skills */}
                      {(job.skillsRequired || ["Java", "SQL"]).slice(0, 3).map(skill => (
                        <Badge key={skill} variant="outline" className="rounded-full font-normal text-xs border-primary/20 text-primary/80 bg-primary/5">{skill}</Badge>
                      ))}
                      
                      {/* Extra eligibility requirements shown as tags for ineligible jobs */}
                      {elig.status === "Not eligible" && elig.reason && (
                         <Badge variant="outline" className="rounded-full font-normal text-xs border-amber-500/30 text-amber-500/80 bg-amber-500/5">{elig.reason}</Badge>
                      )}
                    </div>

                    {/* Bottom: Actions & Deadlines */}
                    <div className="flex flex-wrap items-center justify-between mt-6 pt-5 border-t border-border/40 gap-4">
                      <div className="flex items-center gap-6 text-sm">
                        <div className={`flex items-center gap-1.5 ${deadlineInfo.isUrgent ? "text-red-400 font-medium" : "text-muted-foreground"}`}>
                          <Calendar className="w-4 h-4" />
                          <span>{deadlineInfo.text}</span>
                        </div>
                        <span className="text-muted-foreground hidden sm:inline-block">{job.roundsCount || 5} rounds</span>
                        <span className="text-muted-foreground hidden sm:inline-block">{job.vacancies || "Open"} vacancies</span>
                      </div>

                      <Button 
                        variant={elig.status === "Not eligible" ? "outline" : "default"}
                        className={`min-w-[120px] ${elig.status === "Not eligible" ? "opacity-50 hover:bg-transparent cursor-not-allowed" : ""}`}
                        disabled={elig.status === "Not eligible" || isApplying || job.status === "CLOSED"}
                        onClick={(e) => {
                          // Stop propagation so the card's onClick doesn't trigger
                          e.stopPropagation(); 
                          
                          if (elig.status !== "Not eligible") {
                            // If they have a skills gap, let them apply anyway (matches the image's "Apply anyway")
                            apply(job._id || job.id);
                          }
                        }}
                      >
                        {isApplying && applyingId === (job._id || job.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                          elig.status === "Not eligible" ? "Not eligible" : 
                          elig.status === "Skills gap" ? "Apply anyway" : "Apply now"
                        }
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default JobListingPage;