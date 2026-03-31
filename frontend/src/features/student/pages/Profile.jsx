import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentProfile } from "@/features/student/hooks/useStudent.js";
import { useAuth } from "@/features/auth/hooks/useAuth.js";
import { useSkills } from "@/features/skills/hooks/useSkills.js";
import {
  AVAILABLE_SKILLS,
  FALLBACK_SKILL_OPTIONS,
} from "@/features/skills/lib/availableSkills.js";
import {
  Loader2,
  ArrowLeft,
  Github,
  Linkedin,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Award,
  X,
  Plus,
} from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Separator } from "@/shared/ui/separator";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";

// ─── small helpers ────────────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    {children}
  </div>
);

const normalizeSkillOption = (skill) => {
  if (!skill) return null;
  if (typeof skill === "string") {
    const normalized = skill.trim().toLowerCase();
    const matchedSkill = AVAILABLE_SKILLS.find((option) => {
      const aliases = option.aliases || [];
      return (
        option.skill.toLowerCase() === normalized ||
        aliases.some((alias) => alias.toLowerCase() === normalized)
      );
    });
    return matchedSkill
      ? {
          skillCode: matchedSkill.skillCode,
          name: matchedSkill.skill,
          category: matchedSkill.category,
          aliases: matchedSkill.aliases || [],
        }
      : null;
  }
  const name = skill.name || skill.skill;
  if (!name) return null;
  return {
    skillCode: skill.skillCode,
    name,
    category: skill.category || "Other",
    aliases: skill.aliases || [],
  };
};

const getSkillLabel = (skill) =>
  skill?.name || skill?.skill || (typeof skill === "string" ? skill : "");

// ─── SkillsCombobox ───────────────────────────────────────────────────────────
// Plain controlled combobox — no Radix DropdownMenu on the input, so typing
// is never intercepted by trigger/focus-trap logic.
function SkillsCombobox({ skillCatalog, selectedSkills, onAdd, isLoading }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = skillCatalog
    .filter((skill) => {
      if (selectedSkills.some((s) => s.skillCode === skill.skillCode))
        return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return [skill.name, skill.category, ...(skill.aliases || [])]
        .join(" ")
        .toLowerCase()
        .includes(q);
    })
    .slice(0, 10);

  const handleSelect = (skill) => {
    onAdd(skill);
    setQuery("");
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && filtered.length > 0) {
      e.preventDefault();
      handleSelect(filtered[0]);
    }
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search skills like React, PostgreSQL, Docker..."
          autoComplete="off"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={filtered.length === 0}
          onClick={() => filtered.length > 0 && handleSelect(filtered[0])}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading skills...
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((skill) => (
                <button
                  key={skill.skillCode}
                  type="button"
                  // mousedown fires before the input's blur, so the dropdown
                  // doesn't close before the click registers
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(skill);
                  }}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-accent transition-colors"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-sm font-medium text-foreground">{skill.name}</p>
                    {skill.aliases?.length > 0 && (
                      <p className="text-xs text-muted-foreground truncate">
                        {skill.aliases.join(", ")}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="shrink-0 text-[10px] font-normal">
                    {skill.category}
                  </Badge>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-muted-foreground">
                No matching skills found.
              </div>
            )}
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground mt-1.5">
        Press Enter or comma to add the top match.
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProfileDashboard() {
  const navigate = useNavigate();
  const { profile, isLoading, updateProfile, isUpdating } = useStudentProfile();
  const { user } = useAuth();
  const { data: skillsResponse, isLoading: isSkillsCatalogLoading } = useSkills({ activeOnly: "true" });
  const student = profile?.data || profile;

  // ── which dialog is open ──────────────────────────────────────────────────
  const [openDialog, setOpenDialog] = useState(null);
  const close = () => setOpenDialog(null);

  // ── per-section form state ────────────────────────────────────────────────
  const [basicForm, setBasicForm] = useState({});
  const [contactForm, setContactForm] = useState({});
  const [academicForm, setAcademicForm] = useState({});
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [projectForm, setProjectForm] = useState({});
  const [techInput, setTechInput] = useState("");
  const [editingProjectIdx, setEditingProjectIdx] = useState(null);
  const [certForm, setCertForm] = useState({});
  const [editingCertIdx, setEditingCertIdx] = useState(null);

  // ── open handlers (pre-fill) ──────────────────────────────────────────────
  const openBasicEdit = () => {
    setBasicForm({ firstName: student.firstName || "", lastName: student.lastName || "", bio: student.bio || "" });
    setOpenDialog("basic");
  };

  const openContactEdit = () => {
    setContactForm({
      phone: student.phone || "",
      github: student.links?.github || "",
      linkedin: student.links?.linkedin || "",
      portfolio: student.links?.portfolio || "",
    });
    setOpenDialog("contact");
  };

  const openAcademicEdit = () => {
    setAcademicForm({
      cgpa: student.cgpa ?? "",
      graduationYear: student.graduationYear ?? "",
      backlogs: student.backlogs ?? 0,
      department: student.department ?? "",
      xthMarks: student.xthMarks ?? "",
      xIIthMarks: student.xIIthMarks ?? "",
    });
    setOpenDialog("academic");
  };

  const openSkillsEdit = () => {
    setSelectedSkills((student.skills || []).map(normalizeSkillOption).filter(Boolean));
    setOpenDialog("skills");
  };

  const openProjectAdd = () => {
    setProjectForm({ title: "", description: "", techStack: [], link: "", duration: "" });
    setTechInput("");
    setEditingProjectIdx(null);
    setOpenDialog("project");
  };

  const openProjectEdit = (idx) => {
    const p = student.projects[idx];
    setProjectForm({
      title: p.title || "",
      description: p.description || "",
      techStack: p.techStack ? [...p.techStack] : [],
      link: p.link || "",
      duration: p.duration || "",
    });
    setTechInput("");
    setEditingProjectIdx(idx);
    setOpenDialog("project");
  };

  const openCertAdd = () => {
    setCertForm({ name: "", issuer: "", issueDate: "", credentialUrl: "" });
    setEditingCertIdx(null);
    setOpenDialog("cert");
  };

  const openCertEdit = (idx) => {
    const c = student.certifications[idx];
    setCertForm({
      name: c.name || "",
      issuer: c.issuer || "",
      issueDate: c.issueDate ? c.issueDate.slice(0, 10) : "",
      credentialUrl: c.credentialUrl || "",
    });
    setEditingCertIdx(idx);
    setOpenDialog("cert");
  };

  // ── save handlers ─────────────────────────────────────────────────────────
  const save = async (payload) => { await updateProfile(payload); close(); };

  const saveBasic = () => save(basicForm);

  const saveContact = () =>
    save({
      profileCode: student.profileCode,
      phone: contactForm.phone,
      links: { github: contactForm.github, linkedin: contactForm.linkedin, portfolio: contactForm.portfolio },
    });

  const saveAcademic = () =>
    save({
            profileCode: student.profileCode,

      cgpa: Number(academicForm.cgpa) || undefined,
      graduationYear: Number(academicForm.graduationYear) || undefined,
      backlogs: Number(academicForm.backlogs) || 0,
      department: academicForm.department,
      xthMarks: Number(academicForm.xthMarks) || undefined,
      xIIthMarks: Number(academicForm.xIIthMarks) || undefined,
    });

  const saveSkills = () =>
    save({       profileCode: student.profileCode,
skillCodes: selectedSkills.map((s) => s.skillCode).filter(Boolean) });

  const saveProject = () => {
    
    const projects = [...(student.projects || [])];
    if (editingProjectIdx !== null) projects[editingProjectIdx] = projectForm;
    else projects.push(projectForm);
    save({
            profileCode: student.profileCode,
 projects });
  };

  const deleteProject = (idx) =>
    updateProfile({       profileCode: student.profileCode,
 projects: student.projects.filter((_, i) => i !== idx) });

  const addTechChip = () => {
    const trimmed = techInput.trim();
    if (trimmed && !projectForm.techStack.includes(trimmed))
      setProjectForm((prev) => ({ ...prev, techStack: [...prev.techStack, trimmed] }));
    setTechInput("");
  };

  const saveCert = () => {
    const certifications = [...(student.certifications || [])];
    if (editingCertIdx !== null) certifications[editingCertIdx] = certForm;
    else certifications.push(certForm);
    save({       profileCode: student.profileCode,
 certifications });
  };

  const deleteCert = (idx) =>
    updateProfile({       profileCode: student.profileCode,
 certifications: student.certifications.filter((_, i) => i !== idx) });

  // ── skill catalog ─────────────────────────────────────────────────────────
  const remoteSkillOptions = Array.isArray(skillsResponse?.data)
    ? skillsResponse.data
    : Array.isArray(skillsResponse)
    ? skillsResponse
    : [];

  const skillCatalog =
    remoteSkillOptions.length > 0
      ? remoteSkillOptions.map((s) => ({ skillCode: s.skillCode, name: s.name, category: s.category, aliases: s.aliases || [] }))
      : FALLBACK_SKILL_OPTIONS;

  // ─────────────────────────────────────────────────────────────────────────
  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  if (!student)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-muted-foreground gap-4">
        <p>No profile found. Let's create one.</p>
        <Button onClick={() => navigate("/student/profile/edit")}>Create Profile</Button>
      </div>
    );

  const completeness = student.profileCompleteness || 68;
  const initials = `${student.firstName?.[0] || ""}${student.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-20">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border h-14 flex items-center px-4 sm:px-6 max-w-[1600px] mx-auto w-full">
        <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground hover:text-foreground" onClick={() => navigate("/student/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ══ LEFT COLUMN ══════════════════════════════════════════════════ */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-card border-border/50 shadow-none rounded-xl overflow-hidden text-center">
              <CardContent className="p-6 md:p-8 flex flex-col items-center">
                <Avatar className="h-24 w-24 rounded-full border border-border bg-muted mb-4">
                  <AvatarImage src={student.photo?.url} />
                  <AvatarFallback className="text-2xl font-bold text-primary bg-primary/10">{initials}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-foreground mb-1">{student.firstName} {student.lastName}</h2>
                <p className="text-xs text-muted-foreground font-medium mb-4">
                  {student.department || "B.Tech CS"} · Batch {student.graduationYear || "2026"}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {student.bio || "Update your bio to tell recruiters about your passions and goals."}
                </p>
                <Button variant="outline" size="sm" className="w-full mb-4 text-xs" onClick={openBasicEdit}>
                  Edit Basic Info
                </Button>
                <div className="flex gap-3 w-full">
                  <Button variant="outline" className="flex-1" asChild>
                    <a href={student.links?.github || "#"} target="_blank" rel="noreferrer"
                      className={!student.links?.github ? "opacity-50 pointer-events-none" : ""}>
                      <Github className="w-4 h-4 mr-2" /> GitHub
                    </a>
                  </Button>
                  <Button variant="outline" className="flex-1" asChild>
                    <a href={student.links?.linkedin || "#"} target="_blank" rel="noreferrer"
                      className={!student.links?.linkedin ? "opacity-50 pointer-events-none" : ""}>
                      <Linkedin className="w-4 h-4 mr-2" /> LinkedIn
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50 shadow-none rounded-xl">
              <CardContent className="p-6 space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">Profile completeness</span>
                    <span className="text-sm font-bold text-amber-500">{completeness}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${completeness}%` }} />
                  </div>
                </div>
                <div className="space-y-2.5 text-sm">
                  {[
                    { label: "Photo uploaded", done: !!student.photo?.url },
                    { label: "Bio added", done: !!student.bio },
                    { label: "CGPA entered", done: !!student.cgpa },
                    { label: "Resume uploaded", done: !!student.resume?.url },
                    { label: `Skills added (${student.skills?.length || 0})`, done: (student.skills?.length || 0) >= 5 },
                  ].map(({ label, done }) => (
                    <div key={label} className="flex items-center gap-2.5 text-foreground">
                      {done ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />}
                      {label}
                    </div>
                  ))}
                  {(!student.projects || student.projects.length === 0) && (
                    <div className="flex items-center gap-2.5 text-amber-500 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" /> Add at least 1 project
                    </div>
                  )}
                  {(!student.xthMarks || !student.xIIthMarks) && (
                    <div className="flex items-center gap-2.5 text-amber-500 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" /> Add 10th &amp; 12th marks
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50 shadow-none rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Contact &amp; links</CardTitle>
                <Button variant="outline" size="sm" className="h-7 px-3 text-xs" onClick={openContactEdit}>Edit</Button>
              </CardHeader>
              <CardContent className="p-6 pt-2">
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="text-foreground font-medium">{student.phone || "Not added"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Email</span>
                    <span className="text-foreground font-medium">{user?.email || "student@college.edu"}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">GitHub</span>
                    {student.links?.github
                      ? <a href={student.links.github} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate max-w-[150px]">{student.links.github.replace("https://github.com/", "")}</a>
                      : <span className="text-muted-foreground/50 italic">Not added</span>}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">LinkedIn</span>
                    {student.links?.linkedin
                      ? <a href={student.links.linkedin} target="_blank" rel="noreferrer" className="text-primary hover:underline">View Profile</a>
                      : <span className="text-muted-foreground/50 italic">Not added</span>}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Portfolio</span>
                    {student.links?.portfolio
                      ? <a href={student.links.portfolio} target="_blank" rel="noreferrer" className="text-primary hover:underline">View Website</a>
                      : <span className="text-muted-foreground/50 italic">Not added</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ══ RIGHT COLUMN ═════════════════════════════════════════════════ */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="bg-card border-border/50 shadow-none rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between p-6 pb-0">
                <CardTitle className="text-sm font-semibold text-foreground">Academic details</CardTitle>
                <Button variant="outline" size="sm" className="h-7 px-3 text-xs" onClick={openAcademicEdit}>Edit</Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "CGPA", value: student.cgpa ? `${student.cgpa} / 10` : "N/A", sub: student.department || "Degree", color: "text-emerald-500" },
                    { label: "Graduation year", value: student.graduationYear || "N/A", sub: "Current" },
                    { label: "Active backlogs", value: student.backlogs !== undefined ? student.backlogs : "N/A", sub: student.backlogs > 0 ? "Requires attention" : "No pending subjects", color: student.backlogs > 0 ? "text-destructive" : "text-emerald-500" },
                    { label: "Department", value: student.department || "N/A", sub: "Engineering" },
                    { label: "10th marks", value: student.xthMarks ? `${student.xthMarks}%` : "Not added", sub: !student.xthMarks ? "Required for some drives" : "", color: !student.xthMarks ? "text-amber-500" : undefined },
                    { label: "12th marks", value: student.xIIthMarks ? `${student.xIIthMarks}%` : "Not added", sub: !student.xIIthMarks ? "Required for some drives" : "", color: !student.xIIthMarks ? "text-amber-500" : undefined },
                  ].map(({ label, value, sub, color }) => (
                    <div key={label} className="p-4 bg-muted/50 border border-border/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">{label}</p>
                      <p className={`text-lg font-bold ${color || "text-foreground"} leading-tight`}>{value}</p>
                      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50 shadow-none rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Skills</CardTitle>
                <Button variant="outline" size="sm" className="h-7 px-3 text-xs" onClick={openSkillsEdit}>Edit skills</Button>
              </CardHeader>
              <CardContent className="p-6 pt-2">
                <p className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase mb-3">All Skills</p>
                <div className="flex flex-wrap gap-2">
                  {student.skills && student.skills.length > 0
                    ? student.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1.5 text-xs font-normal">
                          {getSkillLabel(skill)}
                        </Badge>
                      ))
                    : <p className="text-sm text-muted-foreground">No skills added yet.</p>}
                  <Badge variant="outline" className="px-3 py-1.5 text-xs border-dashed font-normal text-muted-foreground hover:text-foreground cursor-pointer transition-colors" onClick={openSkillsEdit}>
                    + Add skill
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50 shadow-none rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
                <CardTitle className="text-sm font-semibold text-foreground">Projects</CardTitle>
                <Button variant="outline" size="sm" className="h-7 px-3 text-xs" onClick={openProjectAdd}>Add project</Button>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                {student.projects && student.projects.length > 0 ? (
                  student.projects.map((proj, idx) => (
                    <div key={idx} className="p-5 rounded-xl border border-border/50 bg-muted/40">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-base font-semibold text-foreground">{proj.title}</h4>
                        {proj.link && (
                          <a href={proj.link} target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs">
                            <ExternalLink className="w-3 h-3" /> View
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{proj.description || "No description provided."}</p>
                      {proj.techStack?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {proj.techStack.map((tech, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px] font-normal px-2 py-0">{tech}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">{proj.duration || "Project duration not specified"}</p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openProjectEdit(idx)}>Edit</Button>
                          <Button variant="outline" size="sm" className="h-7 text-xs text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => deleteProject(idx)} disabled={isUpdating}>Delete</Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 border border-dashed border-border rounded-xl">
                    <p className="text-sm text-muted-foreground">No projects added yet.</p>
                  </div>
                )}
                <Button variant="outline" className="w-full border-dashed text-muted-foreground hover:text-foreground mt-2" onClick={openProjectAdd}>
                  + Add another project
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50 shadow-none rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
                <CardTitle className="text-sm font-semibold text-foreground">Resume</CardTitle>
                <Button variant="outline" size="sm" className="h-7 px-3 text-xs">Replace</Button>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {student.resume?.url ? (
                  <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/40 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-destructive/10 rounded-lg">
                          <FileText className="w-6 h-6 text-destructive" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground mb-0.5">Resume.pdf</p>
                          <p className="text-xs text-muted-foreground">Uploaded {new Date(student.resume.uploadedAt).toLocaleDateString()}</p>
                          <p className="text-[10px] text-amber-500/80 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Keep your resume updated before applying
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="text-xs w-full sm:w-auto" asChild>
                        <a href={student.resume.url} target="_blank" rel="noreferrer">Preview</a>
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Resume requirements</p>
                      <p className="text-sm text-muted-foreground">PDF format only · Max 5 MB</p>
                      <p className="text-xs text-emerald-500 flex items-center gap-1.5 mt-2">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Your resume passes all system checks.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-border rounded-xl space-y-3">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">No resume uploaded</p>
                      <p className="text-xs text-muted-foreground mt-1">Upload a PDF to apply for jobs</p>
                    </div>
                    <Button variant="outline" size="sm">Upload Resume</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50 shadow-none rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
                <CardTitle className="text-sm font-semibold text-foreground">Certifications</CardTitle>
                <Button variant="outline" size="sm" className="h-7 px-3 text-xs" onClick={openCertAdd}>Add</Button>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-2">
                {student.certifications && student.certifications.length > 0 ? (
                  student.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                      <div className="flex items-start gap-3">
                        <Award className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{cert.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {cert.issuer}{cert.issueDate ? ` · Issued ${new Date(cert.issueDate).getFullYear()}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {cert.credentialUrl && (
                          <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80 text-xs font-medium flex items-center gap-1">
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => openCertEdit(idx)}>Edit</Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => deleteCert(idx)} disabled={isUpdating}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-2">No certifications added.</p>
                )}
                <Button variant="outline" className="w-full border-dashed text-muted-foreground hover:text-foreground mt-4" onClick={openCertAdd}>
                  + Add certification
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* ══ DIALOGS ══════════════════════════════════════════════════════════ */}

      <Dialog open={openDialog === "basic"} onOpenChange={(o) => !o && close()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Basic Info</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name">
                <Input value={basicForm.firstName || ""} onChange={(e) => setBasicForm((p) => ({ ...p, firstName: e.target.value }))} placeholder="Arjun" />
              </Field>
              <Field label="Last name">
                <Input value={basicForm.lastName || ""} onChange={(e) => setBasicForm((p) => ({ ...p, lastName: e.target.value }))} placeholder="Sharma" />
              </Field>
            </div>
            <Field label="Bio">
              <Textarea value={basicForm.bio || ""} onChange={(e) => setBasicForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Tell recruiters about your passions and goals..." className="resize-none min-h-[100px]" maxLength={300} />
              <p className="text-[10px] text-muted-foreground text-right mt-1">{(basicForm.bio || "").length}/300</p>
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={saveBasic} disabled={isUpdating}>{isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "contact"} onOpenChange={(o) => !o && close()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Contact &amp; Links</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Phone"><Input value={contactForm.phone || ""} onChange={(e) => setContactForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+91 9876543210" /></Field>
            <Field label="GitHub URL"><Input value={contactForm.github || ""} onChange={(e) => setContactForm((p) => ({ ...p, github: e.target.value }))} placeholder="https://github.com/username" /></Field>
            <Field label="LinkedIn URL"><Input value={contactForm.linkedin || ""} onChange={(e) => setContactForm((p) => ({ ...p, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/username" /></Field>
            <Field label="Portfolio / Website"><Input value={contactForm.portfolio || ""} onChange={(e) => setContactForm((p) => ({ ...p, portfolio: e.target.value }))} placeholder="https://yoursite.dev" /></Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={saveContact} disabled={isUpdating}>{isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "academic"} onOpenChange={(o) => !o && close()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Academic Details</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <Field label="CGPA (out of 10)"><Input type="number" step="0.01" min="0" max="10" value={academicForm.cgpa ?? ""} onChange={(e) => setAcademicForm((p) => ({ ...p, cgpa: e.target.value }))} placeholder="8.5" /></Field>
              <Field label="Graduation year"><Input type="number" min="2020" max="2030" value={academicForm.graduationYear ?? ""} onChange={(e) => setAcademicForm((p) => ({ ...p, graduationYear: e.target.value }))} placeholder="2026" /></Field>
              <Field label="Active backlogs"><Input type="number" min="0" value={academicForm.backlogs ?? 0} onChange={(e) => setAcademicForm((p) => ({ ...p, backlogs: e.target.value }))} placeholder="0" /></Field>
              <Field label="Department"><Input value={academicForm.department ?? ""} onChange={(e) => setAcademicForm((p) => ({ ...p, department: e.target.value }))} placeholder="B.Tech Computer Science" /></Field>
              <Field label="10th marks (%)"><Input type="number" min="0" max="100" value={academicForm.xthMarks ?? ""} onChange={(e) => setAcademicForm((p) => ({ ...p, xthMarks: e.target.value }))} placeholder="92.4" /></Field>
              <Field label="12th marks (%)"><Input type="number" min="0" max="100" value={academicForm.xIIthMarks ?? ""} onChange={(e) => setAcademicForm((p) => ({ ...p, xIIthMarks: e.target.value }))} placeholder="88.0" /></Field>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={saveAcademic} disabled={isUpdating}>{isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Skills dialog uses the custom SkillsCombobox ─────────────────── */}
      <Dialog open={openDialog === "skills"} onOpenChange={(o) => !o && close()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Skills</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Search &amp; add skills">
              <SkillsCombobox
                skillCatalog={skillCatalog}
                selectedSkills={selectedSkills}
                onAdd={(skill) =>
                  setSelectedSkills((prev) =>
                    prev.some((s) => s.skillCode === skill.skillCode) ? prev : [...prev, skill]
                  )
                }
                isLoading={isSkillsCatalogLoading}
              />
            </Field>
            <div className="flex flex-wrap gap-2 min-h-[40px]">
              {selectedSkills.length === 0
                ? <p className="text-xs text-muted-foreground">No skills yet. Start adding above.</p>
                : selectedSkills.map((skill) => (
                    <Badge key={skill.skillCode} variant="secondary" className="px-3 py-1.5 text-xs font-normal gap-1.5">
                      {skill.name}
                      <button type="button" onClick={() => setSelectedSkills((prev) => prev.filter((s) => s.skillCode !== skill.skillCode))} className="ml-0.5 text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={saveSkills} disabled={isUpdating}>{isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "project"} onOpenChange={(o) => !o && close()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingProjectIdx !== null ? "Edit Project" : "Add Project"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Project title *">
              <Input value={projectForm.title || ""} onChange={(e) => setProjectForm((p) => ({ ...p, title: e.target.value }))} placeholder="My Awesome Project" />
            </Field>
            <Field label="Description">
              <Textarea value={projectForm.description || ""} onChange={(e) => setProjectForm((p) => ({ ...p, description: e.target.value }))} placeholder="What does this project do? What problem does it solve?" className="resize-none min-h-[90px]" />
            </Field>
            <Field label="Tech stack">
              <div className="flex gap-2 mb-2">
                <Input value={techInput} onChange={(e) => setTechInput(e.target.value)} placeholder="e.g. React, Node.js" onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTechChip(); } }} />
                <Button type="button" variant="outline" size="icon" onClick={addTechChip}><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(projectForm.techStack || []).map((tech, i) => (
                  <Badge key={i} variant="secondary" className="text-xs font-normal gap-1.5">
                    {tech}
                    <button onClick={() => setProjectForm((p) => ({ ...p, techStack: p.techStack.filter((_, idx) => idx !== i) }))} className="text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Project link"><Input value={projectForm.link || ""} onChange={(e) => setProjectForm((p) => ({ ...p, link: e.target.value }))} placeholder="https://github.com/..." /></Field>
              <Field label="Duration"><Input value={projectForm.duration || ""} onChange={(e) => setProjectForm((p) => ({ ...p, duration: e.target.value }))} placeholder="Jan 2024 – Mar 2024" /></Field>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={saveProject} disabled={isUpdating || !projectForm.title?.trim()}>
              {isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingProjectIdx !== null ? "Save changes" : "Add project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "cert"} onOpenChange={(o) => !o && close()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingCertIdx !== null ? "Edit Certification" : "Add Certification"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Certificate name *"><Input value={certForm.name || ""} onChange={(e) => setCertForm((p) => ({ ...p, name: e.target.value }))} placeholder="AWS Certified Solutions Architect" /></Field>
            <Field label="Issuing organization"><Input value={certForm.issuer || ""} onChange={(e) => setCertForm((p) => ({ ...p, issuer: e.target.value }))} placeholder="Amazon Web Services" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Issue date"><Input type="date" value={certForm.issueDate || ""} onChange={(e) => setCertForm((p) => ({ ...p, issueDate: e.target.value }))} /></Field>
              <Field label="Credential URL"><Input value={certForm.credentialUrl || ""} onChange={(e) => setCertForm((p) => ({ ...p, credentialUrl: e.target.value }))} placeholder="https://..." /></Field>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={saveCert} disabled={isUpdating || !certForm.name?.trim()}>
              {isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingCertIdx !== null ? "Save changes" : "Add certification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}