import React from "react";
import { AlertCircle, Award, CheckCircle2, ExternalLink, FileText, X } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { getSkillLabel } from "@/features/student/components/profile/profile.utils.js";

const ProfileRightColumn = ({
  student,
  isUpdating,
  onOpenAcademicEdit,
  onOpenSkillsEdit,
  onOpenProjectAdd,
  onOpenProjectEdit,
  onDeleteProject,
  onOpenCertAdd,
  onOpenCertEdit,
  onDeleteCert,
}) => {
  return (
    <div className="lg:col-span-8 space-y-6">
      <Card className="bg-card border-border/50 shadow-none rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-0">
          <CardTitle className="text-sm font-semibold text-foreground">Academic details</CardTitle>
          <Button variant="outline" size="sm" className="h-7 px-3 text-xs" onClick={onOpenAcademicEdit}>Edit</Button>
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
          <Button variant="outline" size="sm" className="h-7 px-3 text-xs" onClick={onOpenSkillsEdit}>Edit skills</Button>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <p className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase mb-3">All Skills</p>
          <div className="flex flex-wrap gap-2">
            {student.skills && student.skills.length > 0 ? (
              student.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1.5 text-xs font-normal">
                  {getSkillLabel(skill)}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No skills added yet.</p>
            )}
            <Badge variant="outline" className="px-3 py-1.5 text-xs border-dashed font-normal text-muted-foreground hover:text-foreground cursor-pointer transition-colors" onClick={onOpenSkillsEdit}>
              + Add skill
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border/50 shadow-none rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <CardTitle className="text-sm font-semibold text-foreground">Projects</CardTitle>
          <Button variant="outline" size="sm" className="h-7 px-3 text-xs" onClick={onOpenProjectAdd}>Add project</Button>
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
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onOpenProjectEdit(idx)}>Edit</Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => onDeleteProject(idx)} disabled={isUpdating}>Delete</Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 border border-dashed border-border rounded-xl">
              <p className="text-sm text-muted-foreground">No projects added yet.</p>
            </div>
          )}
          <Button variant="outline" className="w-full border-dashed text-muted-foreground hover:text-foreground mt-2" onClick={onOpenProjectAdd}>
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
          <Button variant="outline" size="sm" className="h-7 px-3 text-xs" onClick={onOpenCertAdd}>Add</Button>
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
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onOpenCertEdit(idx)}>Edit</Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDeleteCert(idx)} disabled={isUpdating}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-2">No certifications added.</p>
          )}
          <Button variant="outline" className="w-full border-dashed text-muted-foreground hover:text-foreground mt-4" onClick={onOpenCertAdd}>
            + Add certification
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(ProfileRightColumn);
