import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Github,
  Linkedin,
  Globe,
  FileText,
  Download,
  GraduationCap,
  BookOpen,
  Calendar,
  Award,
  CheckCircle2,
  XCircle,
  School,
  Loader2,
  AlertCircle,
  ExternalLink,
  Briefcase,
  AlertTriangle
} from "lucide-react";

// UI Components
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Separator } from "@/shared/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

// API Hook
import { useStudentById } from "@/features/student/hooks/useStudent.js";

export default function ViewStudentProfile() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  // 1. Fetch Data
  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
  } = useStudentById(studentId);

  // 2. Loading State
  if (isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 3. Extract Profile Data
  const profile = apiResponse?.data || apiResponse;

  // 4. Error State
  if (isError || !profile || (!profile._id && !profile.profileCode)) {
    return (
      <div className="flex flex-col h-[80vh] w-full items-center justify-center gap-4 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div>
          <h3 className="text-lg font-semibold text-foreground">Profile Not Found</h3>
          <p className="text-muted-foreground">
            {error?.response?.data?.message || "The student data could not be retrieved."}
          </p>
          <p className="text-xs text-muted-foreground mt-2">ID: {studentId}</p>
        </div>
        <Button variant="outline" className="border-border" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  // --- Helpers & Computed Values ---
  const initials = `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase();
  const fullName = `${profile.firstName} ${profile.lastName}`;
  const completeness = profile.profileCompleteness || 0;
  const isPlaced = profile.placementStatus === "PLACED";

  // Checklist logic based on data presence
  const checklist = [
    { label: "Photo, bio, phone", done: !!profile.bio && !!profile.phone },
    { label: "CGPA, backlogs, marks", done: !!profile.cgpa && !!profile.xthMarks && !!profile.xIIthMarks },
    { label: "Resume uploaded", done: !!profile.resume?.uploadedAt },
    { label: `Skills added (${profile.skills?.length || 0})`, done: (profile.skills?.length || 0) > 0 },
    { label: `${profile.projects?.length || 0} projects added`, done: (profile.projects?.length || 0) > 0 },
    { label: "LinkedIn linked", done: !!profile.links?.linkedin },
    { label: "Portfolio linked", done: !!profile.links?.portfolio },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground pb-20 space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)}>
              Student management
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">{fullName}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {profile.profileCode} · {profile.department} · Batch {profile.graduationYear} · {profile.account?.email || "No email"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-transparent border-border hover:bg-muted">Send notification</Button>
          <Button variant="outline" className="bg-transparent border-border hover:bg-muted">Mark opted out</Button>
          <Button variant="outline" className="bg-transparent border-red-500/30 text-red-500 hover:bg-red-500/10">Deactivate</Button>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================== */}
        {/* LEFT COLUMN (Identity & Summary)           */}
        {/* ========================================== */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Identity Card */}
          <Card className="bg-card border-border shadow-sm text-center">
            <CardContent className="p-6">
              <Avatar className="h-20 w-20 mx-auto rounded-full border border-border bg-muted mb-4">
                <AvatarImage src={profile.photoUrl} />
                <AvatarFallback className="text-xl font-bold text-primary bg-primary/10">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="text-xl font-bold mb-1">{fullName}</h2>
              <p className="text-xs text-muted-foreground font-medium mb-4">
                {profile.department} - Batch {profile.graduationYear}
              </p>
              
              <Badge variant="outline" className={`font-medium mb-6 rounded-full px-3 py-0.5 ${isPlaced ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-muted text-muted-foreground border-border"}`}>
                {isPlaced ? "Placed" : "Unplaced"}
              </Badge>

              <div className="flex justify-center gap-3 w-full mb-6">
                <Button variant="outline" size="sm" className="bg-transparent border-border text-muted-foreground hover:text-foreground h-8" asChild>
                  <a href={profile.links?.github || "#"} target="_blank" rel="noreferrer" className={!profile.links?.github ? "opacity-50 pointer-events-none" : ""}>
                    <Github className="w-3.5 h-3.5 mr-2" /> GitHub
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="bg-transparent border-border text-muted-foreground hover:text-foreground h-8" asChild>
                  <a href={profile.links?.linkedin || "#"} target="_blank" rel="noreferrer" className={!profile.links?.linkedin ? "opacity-50 pointer-events-none" : ""}>
                    <Linkedin className="w-3.5 h-3.5 mr-2" /> LinkedIn
                  </a>
                </Button>
              </div>

              {/* Profile Completeness Tracker */}
              <div className="text-left bg-muted/20 rounded-xl p-4 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-foreground">Profile completeness</span>
                  <span className={`text-xs font-bold ${completeness >= 80 ? "text-emerald-500" : "text-amber-500"}`}>{completeness}%</span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mb-4">
                  <div className={`h-full ${completeness >= 80 ? "text-emerald-500 bg-emerald-500" : "text-amber-500 bg-amber-500"} rounded-full`} style={{ width: `${completeness}%` }} />
                </div>
                <div className="space-y-2">
                  {checklist.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px]">
                      {item.done ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                      <span className={item.done ? "text-muted-foreground" : "text-amber-500 font-medium"}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Details */}
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Contact</h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">{profile.phone || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium text-right truncate max-w-[180px]">{profile.email || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">User No.</span>
                <span className="font-medium">{profile.profileCode}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-4">
                <span className="text-muted-foreground">Account</span>
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10 font-normal">Active · Verified</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Placement Summary */}
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Placement summary</h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className={isPlaced ? "text-emerald-500 font-medium" : "text-muted-foreground"}>{isPlaced ? "Placed" : "Unplaced"}</span>
              </div>
              {/* Mock Data for Placement Details */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Company</span>
                <span className="font-medium">{isPlaced ? "TCS" : "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Package</span>
                <span className="font-medium">{isPlaced ? "7.2 LPA" : "—"}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-4">
                <span className="text-muted-foreground">Total applied</span>
                <span className="font-medium">5 drives</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ========================================== */}
        {/* RIGHT COLUMN (Main Details)                */}
        {/* ========================================== */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. Academic Details */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="p-6 pb-0 flex flex-row justify-between items-center">
              <CardTitle className="text-sm font-semibold">Academic details</CardTitle>
              <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent border-border">Edit</Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 border border-border rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">CGPA</p>
                  <p className={`text-xl font-bold ${profile.cgpa >= 7 ? "text-emerald-500" : "text-amber-500"}`}>{profile.cgpa || 0} <span className="text-xs text-muted-foreground font-normal">/ 10</span></p>
                  <p className="text-[10px] text-muted-foreground mt-1">{profile.department}</p>
                </div>
                <div className="p-4 bg-muted/30 border border-border rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">Graduation year</p>
                  <p className="text-xl font-bold text-foreground">{profile.graduationYear}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Current</p>
                </div>
                <div className="p-4 bg-muted/30 border border-border rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">Active backlogs</p>
                  <p className={`text-xl font-bold ${profile.backlogs > 0 ? "text-red-500" : "text-emerald-500"}`}>{profile.backlogs ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{profile.backlogs > 0 ? "Requires attention" : "No pending"}</p>
                </div>
                <div className="p-4 bg-muted/30 border border-border rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">Department</p>
                  <p className="text-sm font-bold text-foreground leading-tight mt-1.5">{profile.department}</p>
                </div>
                <div className="p-4 bg-muted/30 border border-border rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">10th marks</p>
                  <p className={`text-xl font-bold ${profile.xthMarks ? "text-foreground" : "text-amber-500"}`}>{profile.xthMarks ? `${profile.xthMarks}%` : "Not added"}</p>
                  {!profile.xthMarks && <p className="text-[10px] text-amber-500/80 mt-1">Required for some drives</p>}
                </div>
                <div className="p-4 bg-muted/30 border border-border rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">12th marks</p>
                  <p className={`text-xl font-bold ${profile.xIIthMarks ? "text-foreground" : "text-amber-500"}`}>{profile.xIIthMarks ? `${profile.xIIthMarks}%` : "Not added"}</p>
                  {!profile.xIIthMarks && <p className="text-[10px] text-amber-500/80 mt-1">Required for some drives</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Skills */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-sm font-semibold">Skills</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <div className="flex flex-wrap gap-2">
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1.5 text-xs bg-muted/30 border-border font-normal text-foreground">
                      {skill.name}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No skills added yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 3. Projects */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-sm font-semibold">Projects</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              {profile.projects && profile.projects.length > 0 ? (
                profile.projects.map((proj, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-border bg-muted/20">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-base font-semibold text-foreground">{proj.title}</h4>
                      {proj.link && (
                        <a href={proj.link} target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs font-medium">
                          <ExternalLink className="w-3 h-3" /> View
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {proj.description || "No description provided."}
                    </p>
                    
                    {proj.techStack?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {proj.techStack.map((tech, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20 font-normal px-2 py-0">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 border border-dashed border-border rounded-xl">
                  <p className="text-sm text-muted-foreground">No projects added yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 4. Resume */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-sm font-semibold">Resume</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {profile.resume?.uploadedAt ? (
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <FileText className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-0.5">{profile.firstName}_Resume.pdf</p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded {new Date(profile.resume.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs bg-transparent border-border" asChild>
                      <a href={profile.resume.url} target="_blank" rel="noreferrer">Preview</a>
                    </Button>
                    <Button size="sm" className="h-8 text-xs" asChild>
                      <a href={profile.resume.url} download>Download</a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-border rounded-xl">
                  <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">No resume uploaded</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 5. Application History (Mocked based on image layout) */}
          <Card className="bg-card border-border shadow-sm overflow-hidden">
            <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Application history</CardTitle>
              <span className="text-xs text-muted-foreground">5 drives · 1 placed</span>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-[10px] uppercase text-muted-foreground font-semibold">Drive</TableHead>
                    <TableHead className="text-[10px] uppercase text-muted-foreground font-semibold">Status</TableHead>
                    <TableHead className="text-[10px] uppercase text-muted-foreground font-semibold">Screening</TableHead>
                    <TableHead className="text-[10px] uppercase text-muted-foreground font-semibold">Snapshot CGPA</TableHead>
                    <TableHead className="text-right text-[10px] uppercase text-muted-foreground font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { company: "TCS", role: "Software Engineer", date: "10 Mar", status: "Selected", screen: "Eligible", cgpa: "8.2 CGPA" },
                    { company: "Infosys", role: "Systems Engineer", date: "12 Mar", status: "Rejected", screen: "Eligible", cgpa: "8.2 CGPA" },
                    { company: "Wipro", role: "Associate Analyst", date: "5 Mar", status: "Withdrawn", screen: "Eligible", cgpa: "8.0 CGPA" },
                  ].map((app, i) => (
                    <TableRow key={i} className="border-border hover:bg-muted/30">
                      <TableCell>
                        <p className="text-sm font-semibold text-foreground">{app.role}</p>
                        <p className="text-xs text-muted-foreground">{app.company} · {app.date}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`font-normal text-[10px] rounded-full border-transparent ${
                          app.status === "Selected" ? "bg-emerald-500/10 text-emerald-500" :
                          app.status === "Rejected" ? "bg-red-500/10 text-red-500" : "bg-muted text-muted-foreground"
                        }`}>{app.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal text-[10px] rounded-full bg-emerald-500/10 text-emerald-500 border-transparent">
                          {app.screen}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-foreground">{app.cgpa}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent border-border">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 6. Admin Notes */}
          <Card className="bg-[#422C0A] border-[#7A4F10] shadow-sm">
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-amber-500">Admin notes</CardTitle>
              <Button variant="link" className="text-xs text-amber-500 hover:text-amber-400 p-0 h-auto">+ Add note</Button>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <p className="text-xs text-amber-500/80 uppercase font-semibold mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Internal note — not visible to student
              </p>
              <p className="text-sm text-amber-500/90 leading-relaxed">
                Student was shortlisted by TCS after borderline aptitude score. Placement officer recommended override due to strong project portfolio. Offer accepted 14 Mar.
              </p>
              <p className="text-xs text-amber-500/60 mt-3">Added by you · 15 Mar 2026</p>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}