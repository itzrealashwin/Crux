import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";

import { useAuth } from "@/features/auth/hooks/useAuth.js";
import { useSkills } from "@/features/skills/hooks/useSkills.js";
import { useStudentProfile } from "@/features/student/hooks/useStudent.js";
import { FALLBACK_SKILL_OPTIONS } from "@/features/skills/lib/availableSkills.js";
import { Button } from "@/shared/ui/button";

import ProfileLeftColumn from "@/features/student/components/profile/ProfileLeftColumn.jsx";
import ProfileRightColumn from "@/features/student/components/profile/ProfileRightColumn.jsx";
import ProfileDialogs from "@/features/student/components/profile/ProfileDialogs.jsx";
import { normalizeSkillOption } from "@/features/student/components/profile/profile.utils.js";

export default function ProfileDashboard() {
  const navigate = useNavigate();
  const { profile, isLoading, updateProfile, isUpdating } = useStudentProfile();
  const { user } = useAuth();
  const { data: skillsResponse, isLoading: isSkillsCatalogLoading } = useSkills({ activeOnly: "true" });
  const student = profile?.data || profile;

  const [openDialog, setOpenDialog] = useState(null);
  const close = useCallback(() => setOpenDialog(null), []);

  const [basicForm, setBasicForm] = useState({});
  const [contactForm, setContactForm] = useState({});
  const [academicForm, setAcademicForm] = useState({});
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [projectForm, setProjectForm] = useState({});
  const [techInput, setTechInput] = useState("");
  const [editingProjectIdx, setEditingProjectIdx] = useState(null);
  const [certForm, setCertForm] = useState({});
  const [editingCertIdx, setEditingCertIdx] = useState(null);

  const remoteSkillOptions = useMemo(() => {
    if (Array.isArray(skillsResponse?.data)) return skillsResponse.data;
    if (Array.isArray(skillsResponse)) return skillsResponse;
    return [];
  }, [skillsResponse]);

  const skillCatalog = useMemo(() => {
    if (remoteSkillOptions.length > 0) {
      return remoteSkillOptions.map((skill) => ({
        skillCode: skill.skillCode,
        name: skill.name,
        category: skill.category,
        aliases: skill.aliases || [],
      }));
    }
    return FALLBACK_SKILL_OPTIONS;
  }, [remoteSkillOptions]);

  const skillCodeLookup = useMemo(() => {
    const map = new Map();
    skillCatalog.forEach((skill) => {
      if (skill.name) map.set(skill.name.toLowerCase(), skill.skillCode);
      (skill.aliases || []).forEach((alias) => map.set(alias.toLowerCase(), skill.skillCode));
    });
    return map;
  }, [skillCatalog]);

  const save = useCallback(
    async (payload) => {
      await updateProfile({ profileCode: student.profileCode, ...payload });
      close();
    },
    [close, student?.profileCode, updateProfile],
  );

  const openBasicEdit = useCallback(() => {
    setBasicForm({
      firstName: student.firstName || "",
      lastName: student.lastName || "",
      bio: student.bio || "",
    });
    setOpenDialog("basic");
  }, [student]);

  const openContactEdit = useCallback(() => {
    setContactForm({
      phone: student.phone || "",
      github: student.links?.github || "",
      linkedin: student.links?.linkedin || "",
      portfolio: student.links?.portfolio || "",
    });
    setOpenDialog("contact");
  }, [student]);

  const openAcademicEdit = useCallback(() => {
    setAcademicForm({
      cgpa: student.cgpa ?? "",
      graduationYear: student.graduationYear ?? "",
      backlogs: student.backlogs ?? 0,
      department: student.department ?? "",
      xthMarks: student.xthMarks ?? "",
      xIIthMarks: student.xIIthMarks ?? "",
    });
    setOpenDialog("academic");
  }, [student]);

  const openSkillsEdit = useCallback(() => {
    setSelectedSkills((student.skills || []).map(normalizeSkillOption).filter(Boolean));
    setOpenDialog("skills");
  }, [student]);

  const openProjectAdd = useCallback(() => {
    setProjectForm({ title: "", description: "", techStack: [], link: "", duration: "" });
    setTechInput("");
    setEditingProjectIdx(null);
    setOpenDialog("project");
  }, []);

  const openProjectEdit = useCallback(
    (idx) => {
      const project = student.projects[idx];
      setProjectForm({
        title: project.title || "",
        description: project.description || "",
        techStack: project.techStack ? [...project.techStack] : [],
        link: project.link || "",
        duration: project.duration || "",
      });
      setTechInput("");
      setEditingProjectIdx(idx);
      setOpenDialog("project");
    },
    [student],
  );

  const openCertAdd = useCallback(() => {
    setCertForm({ name: "", issuer: "", issueDate: "", credentialUrl: "" });
    setEditingCertIdx(null);
    setOpenDialog("cert");
  }, []);

  const openCertEdit = useCallback(
    (idx) => {
      const cert = student.certifications[idx];
      setCertForm({
        name: cert.name || "",
        issuer: cert.issuer || "",
        issueDate: cert.issueDate ? cert.issueDate.slice(0, 10) : "",
        credentialUrl: cert.credentialUrl || "",
      });
      setEditingCertIdx(idx);
      setOpenDialog("cert");
    },
    [student],
  );

  const saveBasic = useCallback(() => save(basicForm), [basicForm, save]);

  const saveContact = useCallback(
    () =>
      save({
        phone: contactForm.phone,
        links: {
          github: contactForm.github,
          linkedin: contactForm.linkedin,
          portfolio: contactForm.portfolio,
        },
      }),
    [contactForm, save],
  );

  const saveAcademic = useCallback(
    () =>
      save({
        cgpa: Number(academicForm.cgpa) || undefined,
        graduationYear: Number(academicForm.graduationYear) || undefined,
        backlogs: Number(academicForm.backlogs) || 0,
        department: academicForm.department,
        xthMarks: Number(academicForm.xthMarks) || undefined,
        xIIthMarks: Number(academicForm.xIIthMarks) || undefined,
      }),
    [academicForm, save],
  );

  const saveSkills = useCallback(() => {
    const skillCodes = Array.from(
      new Set(
        selectedSkills
          .map((skill) => skill.skillCode || skillCodeLookup.get((skill.name || "").toLowerCase()))
          .filter(Boolean),
      ),
    );

    save({ skillCodes });
  }, [save, selectedSkills, skillCodeLookup]);

  const saveProject = useCallback(() => {
    const projects = [...(student.projects || [])];
    if (editingProjectIdx !== null) projects[editingProjectIdx] = projectForm;
    else projects.push(projectForm);
    save({ projects });
  }, [editingProjectIdx, projectForm, save, student]);

  const deleteProject = useCallback(
    (idx) =>
      updateProfile({
        profileCode: student.profileCode,
        projects: student.projects.filter((_, i) => i !== idx),
      }),
    [student, updateProfile],
  );

  const addTechChip = useCallback(() => {
    const trimmed = techInput.trim();
    if (trimmed && !projectForm.techStack.includes(trimmed)) {
      setProjectForm((prev) => ({ ...prev, techStack: [...prev.techStack, trimmed] }));
    }
    setTechInput("");
  }, [projectForm.techStack, techInput]);

  const saveCert = useCallback(() => {
    const certifications = [...(student.certifications || [])];
    if (editingCertIdx !== null) certifications[editingCertIdx] = certForm;
    else certifications.push(certForm);
    save({ certifications });
  }, [certForm, editingCertIdx, save, student]);

  const deleteCert = useCallback(
    (idx) =>
      updateProfile({
        profileCode: student.profileCode,
        certifications: student.certifications.filter((_, i) => i !== idx),
      }),
    [student, updateProfile],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-muted-foreground gap-4">
        <p>No profile found. Let's create one.</p>
        <Button onClick={() => navigate("/student/profile/edit")}>Create Profile</Button>
      </div>
    );
  }

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
          <ProfileLeftColumn
            student={student}
            user={user}
            initials={initials}
            completeness={completeness}
            onOpenBasicEdit={openBasicEdit}
            onOpenContactEdit={openContactEdit}
          />

          <ProfileRightColumn
            student={student}
            isUpdating={isUpdating}
            onOpenAcademicEdit={openAcademicEdit}
            onOpenSkillsEdit={openSkillsEdit}
            onOpenProjectAdd={openProjectAdd}
            onOpenProjectEdit={openProjectEdit}
            onDeleteProject={deleteProject}
            onOpenCertAdd={openCertAdd}
            onOpenCertEdit={openCertEdit}
            onDeleteCert={deleteCert}
          />
        </div>
      </main>

      <ProfileDialogs
        openDialog={openDialog}
        close={close}
        isUpdating={isUpdating}
        student={student}
        basicForm={basicForm}
        setBasicForm={setBasicForm}
        contactForm={contactForm}
        setContactForm={setContactForm}
        academicForm={academicForm}
        setAcademicForm={setAcademicForm}
        selectedSkills={selectedSkills}
        setSelectedSkills={setSelectedSkills}
        skillCatalog={skillCatalog}
        isSkillsCatalogLoading={isSkillsCatalogLoading}
        projectForm={projectForm}
        setProjectForm={setProjectForm}
        techInput={techInput}
        setTechInput={setTechInput}
        editingProjectIdx={editingProjectIdx}
        certForm={certForm}
        setCertForm={setCertForm}
        editingCertIdx={editingCertIdx}
        onSaveBasic={saveBasic}
        onSaveContact={saveContact}
        onSaveAcademic={saveAcademic}
        onSaveSkills={saveSkills}
        onAddTechChip={addTechChip}
        onSaveProject={saveProject}
        onSaveCert={saveCert}
      />
    </div>
  );
}
