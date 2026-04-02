import React from "react";
import { Loader2, Plus, X } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import Field from "@/features/student/components/profile/Field.jsx";
import ProfileSkillsCombobox from "@/features/student/components/profile/ProfileSkillsCombobox.jsx";

const ProfileDialogs = ({
  openDialog,
  close,
  isUpdating,
  student,
  basicForm,
  setBasicForm,
  contactForm,
  setContactForm,
  academicForm,
  setAcademicForm,
  selectedSkills,
  setSelectedSkills,
  skillCatalog,
  isSkillsCatalogLoading,
  projectForm,
  setProjectForm,
  techInput,
  setTechInput,
  editingProjectIdx,
  certForm,
  setCertForm,
  editingCertIdx,
  onSaveBasic,
  onSaveContact,
  onSaveAcademic,
  onSaveSkills,
  onAddTechChip,
  onSaveProject,
  onSaveCert,
}) => {
  return (
    <>
      <Dialog open={openDialog === "basic"} onOpenChange={(open) => !open && close()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Basic Info</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name">
                <Input value={basicForm.firstName || ""} onChange={(event) => setBasicForm((prev) => ({ ...prev, firstName: event.target.value }))} placeholder="Arjun" />
              </Field>
              <Field label="Last name">
                <Input value={basicForm.lastName || ""} onChange={(event) => setBasicForm((prev) => ({ ...prev, lastName: event.target.value }))} placeholder="Sharma" />
              </Field>
            </div>
            <Field label="Bio">
              <Textarea value={basicForm.bio || ""} onChange={(event) => setBasicForm((prev) => ({ ...prev, bio: event.target.value }))} placeholder="Tell recruiters about your passions and goals..." className="resize-none min-h-[100px]" maxLength={300} />
              <p className="text-[10px] text-muted-foreground text-right mt-1">{(basicForm.bio || "").length}/300</p>
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={onSaveBasic} disabled={isUpdating}>{isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "contact"} onOpenChange={(open) => !open && close()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Contact & links</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Phone"><Input value={contactForm.phone || ""} onChange={(event) => setContactForm((prev) => ({ ...prev, phone: event.target.value }))} placeholder="+91 9876543210" /></Field>
            <Field label="GitHub URL"><Input value={contactForm.github || ""} onChange={(event) => setContactForm((prev) => ({ ...prev, github: event.target.value }))} placeholder="https://github.com/username" /></Field>
            <Field label="LinkedIn URL"><Input value={contactForm.linkedin || ""} onChange={(event) => setContactForm((prev) => ({ ...prev, linkedin: event.target.value }))} placeholder="https://linkedin.com/in/username" /></Field>
            <Field label="Portfolio / Website"><Input value={contactForm.portfolio || ""} onChange={(event) => setContactForm((prev) => ({ ...prev, portfolio: event.target.value }))} placeholder="https://yoursite.dev" /></Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={onSaveContact} disabled={isUpdating}>{isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "academic"} onOpenChange={(open) => !open && close()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Academic Details</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <Field label="CGPA (out of 10)"><Input type="number" step="0.01" min="0" max="10" value={academicForm.cgpa ?? ""} onChange={(event) => setAcademicForm((prev) => ({ ...prev, cgpa: event.target.value }))} placeholder="8.5" /></Field>
              <Field label="Graduation year"><Input type="number" min="2020" max="2030" value={academicForm.graduationYear ?? ""} onChange={(event) => setAcademicForm((prev) => ({ ...prev, graduationYear: event.target.value }))} placeholder="2026" /></Field>
              <Field label="Active backlogs"><Input type="number" min="0" value={academicForm.backlogs ?? 0} onChange={(event) => setAcademicForm((prev) => ({ ...prev, backlogs: event.target.value }))} placeholder="0" /></Field>
              <Field label="Department"><Input value={academicForm.department ?? ""} onChange={(event) => setAcademicForm((prev) => ({ ...prev, department: event.target.value }))} placeholder="B.Tech Computer Science" /></Field>
              <Field label="10th marks (%)"><Input type="number" min="0" max="100" value={academicForm.xthMarks ?? ""} onChange={(event) => setAcademicForm((prev) => ({ ...prev, xthMarks: event.target.value }))} placeholder="92.4" /></Field>
              <Field label="12th marks (%)"><Input type="number" min="0" max="100" value={academicForm.xIIthMarks ?? ""} onChange={(event) => setAcademicForm((prev) => ({ ...prev, xIIthMarks: event.target.value }))} placeholder="88.0" /></Field>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={onSaveAcademic} disabled={isUpdating}>{isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "skills"} onOpenChange={(open) => !open && close()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Skills</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Search & add skills">
              <ProfileSkillsCombobox
                skillCatalog={skillCatalog}
                selectedSkills={selectedSkills}
                onAdd={(skill) =>
                  setSelectedSkills((prev) => {
                    const skillKey = skill.skillCode || skill.name?.toLowerCase();
                    return prev.some((item) => (item.skillCode || item.name?.toLowerCase()) === skillKey)
                      ? prev
                      : [...prev, skill];
                  })
                }
                isLoading={isSkillsCatalogLoading}
              />
            </Field>
            <div className="flex flex-wrap gap-2 min-h-[40px]">
              {selectedSkills.length === 0 ? (
                <p className="text-xs text-muted-foreground">No skills yet. Start adding above.</p>
              ) : (
                selectedSkills.map((skill) => {
                  const skillKey = skill.skillCode || skill.name;
                  return (
                    <Badge key={skillKey} variant="secondary" className="px-3 py-1.5 text-xs font-normal gap-1.5">
                      {skill.name}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedSkills((prev) => prev.filter((item) => (item.skillCode || item.name) !== skillKey))
                        }
                        className="ml-0.5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={onSaveSkills} disabled={isUpdating}>{isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "project"} onOpenChange={(open) => !open && close()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingProjectIdx !== null ? "Edit Project" : "Add Project"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Project title *">
              <Input value={projectForm.title || ""} onChange={(event) => setProjectForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="My Awesome Project" />
            </Field>
            <Field label="Description">
              <Textarea value={projectForm.description || ""} onChange={(event) => setProjectForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="What does this project do? What problem does it solve?" className="resize-none min-h-[90px]" />
            </Field>
            <Field label="Tech stack">
              <div className="flex gap-2 mb-2">
                <Input value={techInput} onChange={(event) => setTechInput(event.target.value)} placeholder="e.g. React, Node.js" onKeyDown={(event) => { if (event.key === "Enter" || event.key === ",") { event.preventDefault(); onAddTechChip(); } }} />
                <Button type="button" variant="outline" size="icon" onClick={onAddTechChip}><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(projectForm.techStack || []).map((tech, index) => (
                  <Badge key={index} variant="secondary" className="text-xs font-normal gap-1.5">
                    {tech}
                    <button onClick={() => setProjectForm((prev) => ({ ...prev, techStack: prev.techStack.filter((_, idx) => idx !== index) }))} className="text-muted-foreground hover:text-foreground">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Project link"><Input value={projectForm.link || ""} onChange={(event) => setProjectForm((prev) => ({ ...prev, link: event.target.value }))} placeholder="https://github.com/..." /></Field>
              <Field label="Duration"><Input value={projectForm.duration || ""} onChange={(event) => setProjectForm((prev) => ({ ...prev, duration: event.target.value }))} placeholder="Jan 2024 – Mar 2024" /></Field>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={onSaveProject} disabled={isUpdating || !projectForm.title?.trim()}>
              {isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingProjectIdx !== null ? "Save changes" : "Add project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "cert"} onOpenChange={(open) => !open && close()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingCertIdx !== null ? "Edit Certification" : "Add Certification"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Certificate name *"><Input value={certForm.name || ""} onChange={(event) => setCertForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="AWS Certified Solutions Architect" /></Field>
            <Field label="Issuing organization"><Input value={certForm.issuer || ""} onChange={(event) => setCertForm((prev) => ({ ...prev, issuer: event.target.value }))} placeholder="Amazon Web Services" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Issue date"><Input type="date" value={certForm.issueDate || ""} onChange={(event) => setCertForm((prev) => ({ ...prev, issueDate: event.target.value }))} /></Field>
              <Field label="Credential URL"><Input value={certForm.credentialUrl || ""} onChange={(event) => setCertForm((prev) => ({ ...prev, credentialUrl: event.target.value }))} placeholder="https://..." /></Field>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={onSaveCert} disabled={isUpdating || !certForm.name?.trim()}>
              {isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingCertIdx !== null ? "Save changes" : "Add certification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default React.memo(ProfileDialogs);
