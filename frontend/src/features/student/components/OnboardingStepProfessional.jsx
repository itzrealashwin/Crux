import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Github, Globe, Linkedin, Upload, X } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

const OnboardingStepProfessional = ({
  formData,
  resumeFile,
  fileInputRef,
  skillInput,
  isSkillDropdownOpen,
  filteredSkills,
  onChange,
  onSkillInputChange,
  onSkillInputFocus,
  onSkillInputBlur,
  onAddSkill,
  onRemoveSkill,
  onFileChange,
}) => {
  return (
    <div className="grid gap-8">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-base">Technical Skills</Label>
          <Badge variant="secondary" className="font-normal">Optional</Badge>
        </div>

        {formData.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.skills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="px-3 py-1.5 flex items-center gap-1.5 text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                {skill}
                <X className="w-3.5 h-3.5 cursor-pointer hover:text-destructive transition-colors" onClick={() => onRemoveSkill(skill)} />
              </Badge>
            ))}
          </div>
        )}

        <div className="relative">
          <Input
            type="text"
            value={skillInput}
            onChange={onSkillInputChange}
            onFocus={onSkillInputFocus}
            onBlur={onSkillInputBlur}
            placeholder="Search and add skills (e.g. React, MongoDB)..."
            className="bg-background h-11"
          />

          <AnimatePresence>
            {isSkillDropdownOpen && skillInput && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
              >
                {filteredSkills.length > 0 ? (
                  <div className="p-1">
                    {filteredSkills.map((skill) => (
                      <div
                        key={skill.skill}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          onAddSkill(skill.skill);
                        }}
                        className="px-4 py-2.5 hover:bg-muted rounded-lg cursor-pointer flex justify-between items-center transition-colors"
                      >
                        <span className="font-medium text-sm text-foreground">{skill.skill}</span>
                        <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/50">
                          {skill.category}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-4 text-sm text-muted-foreground text-center">No matching skills found.</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-sm text-muted-foreground">Recruiters frequently filter candidates based on these keywords.</p>
      </div>

      <div className="space-y-4">
        <Label className="text-base">Social & Portfolio Links</Label>
        <div className="grid gap-4">
          <div className="relative">
            <Github className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input name="links.github" value={formData.links.github} onChange={onChange} className="pl-11 bg-background h-11" placeholder="GitHub Profile URL" />
          </div>
          <div className="relative">
            <Linkedin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input name="links.linkedin" value={formData.links.linkedin} onChange={onChange} className="pl-11 bg-background h-11" placeholder="LinkedIn Profile URL" />
          </div>
          <div className="relative">
            <Globe className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input name="links.portfolio" value={formData.links.portfolio} onChange={onChange} className="pl-11 bg-background h-11" placeholder="Personal Portfolio or Blog URL" />
          </div>
        </div>
      </div>

      <div className="p-5 border border-border rounded-xl bg-muted/20 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <Label className="text-base text-primary">Featured Project</Label>
          <Badge variant="outline">+10% Profile Score</Badge>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Project Title</Label>
          <Input name="featuredProject.title" value={formData.featuredProject.title} onChange={onChange} placeholder="e.g. Task Management App" className="bg-background h-11" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Tech Stack (comma separated)</Label>
            <Input name="featuredProject.techStack" value={formData.featuredProject.techStack} onChange={onChange} placeholder="React, Node.js" className="bg-background h-11" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Project Link</Label>
            <Input name="featuredProject.link" value={formData.featuredProject.link} onChange={onChange} placeholder="GitHub or Live URL" className="bg-background h-11" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-base">Resume (PDF)</Label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
            resumeFile ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
          }`}
        >
          <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={onFileChange} />

          {resumeFile ? (
            <div className="text-center animate-in fade-in zoom-in">
              <div className="bg-primary text-primary-foreground p-3 rounded-full w-fit mx-auto mb-3 shadow-md">
                <FileText className="h-6 w-6" />
              </div>
              <p className="text-base font-medium text-foreground">{resumeFile.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB - Click to replace</p>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <div className="bg-muted p-3 rounded-full w-fit mx-auto mb-3">
                <Upload className="h-6 w-6 text-foreground" />
              </div>
              <p className="text-base font-medium text-foreground">Click to upload your resume</p>
              <p className="text-sm mt-1">PDF format only. Maximum file size 5MB.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(OnboardingStepProfessional);
