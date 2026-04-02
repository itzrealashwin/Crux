import React, { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/shared/ui/button";
import { useStudentProfile } from "@/features/student/hooks/useStudent.js";
import OnboardingSidebar from "@/features/student/components/OnboardingSidebar.jsx";
import OnboardingStepPersonal from "@/features/student/components/OnboardingStepPersonal.jsx";
import OnboardingStepAcademic from "@/features/student/components/OnboardingStepAcademic.jsx";
import OnboardingStepProfessional from "@/features/student/components/OnboardingStepProfessional.jsx";
import OnboardingStepReview from "@/features/student/components/OnboardingStepReview.jsx";
import {
  AVAILABLE_SKILLS,
  DEPARTMENTS,
  formVariants,
  ONBOARDING_STEPS,
} from "@/features/student/components/onboarding.constants.js";

const initialFormData = {
  firstName: "",
  lastName: "",
  phone: "",
  bio: "",
  department: "",
  graduationYear: "",
  cgpa: "",
  backlogs: "",
  xthMarks: "",
  xIIthMarks: "",
  skills: [],
  links: {
    github: "",
    linkedin: "",
    portfolio: "",
  },
  featuredProject: { title: "", techStack: "", link: "" },
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { createProfile, isCreating } = useStudentProfile();

  const [currentStep, setCurrentStep] = useState(0);
  const [resumeFile, setResumeFile] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  const skillCodeByName = useMemo(
    () => new Map(AVAILABLE_SKILLS.map((skill) => [skill.skill, skill.skillCode])),
    [],
  );

  const filteredSkills = useMemo(() => {
    const query = skillInput.trim().toLowerCase();
    if (!query) return [];

    return AVAILABLE_SKILLS.filter(
      (skill) =>
        !formData.skills.includes(skill.skill) &&
        (skill.skill.toLowerCase().includes(query) ||
          skill.aliases.some((alias) => alias.toLowerCase().includes(query))),
    );
  }, [skillInput, formData.skills]);

  const isStepValid = useMemo(() => {
    if (currentStep === 0) {
      return formData.firstName.trim() && formData.lastName.trim();
    }

    if (currentStep === 1) {
      return (
        formData.department &&
        formData.graduationYear &&
        formData.xthMarks &&
        formData.xIIthMarks
      );
    }

    return true;
  }, [currentStep, formData]);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    let nextValue = value;

    if (Number(nextValue) < 0) return;

    if ((name === "xthMarks" || name === "xIIthMarks") && Number(nextValue) > 100) {
      nextValue = 100;
    }

    if (name === "cgpa" && Number(nextValue) > 10) {
      nextValue = 10;
    }

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: nextValue },
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  }, []);

  const handleSelectChange = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setResumeFile(file);
      return;
    }

    if (file) {
      alert("Please upload a PDF file.");
    }
  }, []);

  const handleAddSkill = useCallback((skillName) => {
    setFormData((prev) => ({ ...prev, skills: [...prev.skills, skillName] }));
    setSkillInput("");
    setIsSkillDropdownOpen(false);
  }, []);

  const handleRemoveSkill = useCallback((skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, ONBOARDING_STEPS.length - 1));
  }, []);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleSubmit = useCallback(async () => {
    const skillCodes = formData.skills
      .map((skillName) => skillCodeByName.get(skillName) || null)
      .filter(Boolean);

    const payload = {
      ...formData,
      graduationYear: Number(formData.graduationYear),
      cgpa: formData.cgpa ? Number(formData.cgpa) : 0,
      backlogs: Number(formData.backlogs) || 0,
      xthMarks: Number(formData.xthMarks),
      xIIthMarks: Number(formData.xIIthMarks),
      skillCodes,
      projects: formData.featuredProject.title
        ? [
            {
              title: formData.featuredProject.title,
              techStack: formData.featuredProject.techStack
                ? formData.featuredProject.techStack.split(",").map((item) => item.trim())
                : [],
              link: formData.featuredProject.link,
            },
          ]
        : [],
    };

    delete payload.featuredProject;
    delete payload.skills;

    try {
      await createProfile(payload);
      navigate("/student/dashboard");
    } catch (error) {
      console.error("Submission failed:", error);
    }
  }, [createProfile, formData, navigate, skillCodeByName]);

  const renderStep = () => {
    if (currentStep === 0) {
      return <OnboardingStepPersonal formData={formData} onChange={handleChange} />;
    }

    if (currentStep === 1) {
      return (
        <OnboardingStepAcademic
          formData={formData}
          departments={DEPARTMENTS}
          onChange={handleChange}
          onSelectChange={handleSelectChange}
        />
      );
    }

    if (currentStep === 2) {
      return (
        <OnboardingStepProfessional
          formData={formData}
          resumeFile={resumeFile}
          fileInputRef={fileInputRef}
          skillInput={skillInput}
          isSkillDropdownOpen={isSkillDropdownOpen}
          filteredSkills={filteredSkills}
          onChange={handleChange}
          onSkillInputChange={(event) => {
            setSkillInput(event.target.value);
            setIsSkillDropdownOpen(true);
          }}
          onSkillInputFocus={() => setIsSkillDropdownOpen(true)}
          onSkillInputBlur={() => {
            setTimeout(() => setIsSkillDropdownOpen(false), 150);
          }}
          onAddSkill={handleAddSkill}
          onRemoveSkill={handleRemoveSkill}
          onFileChange={handleFileChange}
        />
      );
    }

    return (
      <OnboardingStepReview
        formData={formData}
        resumeFile={resumeFile}
        onEditStep={setCurrentStep}
      />
    );
  };

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-background flex flex-col lg:flex-row font-sans text-foreground">
      <OnboardingSidebar
        steps={ONBOARDING_STEPS}
        currentStep={currentStep}
        onNavigateHome={() => navigate("/")}
      />

      <div className="flex-1 flex flex-col lg:h-full lg:overflow-y-auto scroll-smooth">
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 w-full">
          <div className="w-full max-w-2xl py-8">
            <div className="mb-10">
              <p className="text-sm font-medium text-primary mb-2 tracking-wide uppercase">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
              </p>
              <h2 className="text-3xl font-bold text-foreground">{step.label}</h2>
              <p className="text-muted-foreground mt-2 text-lg">{step.description}</p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-8"
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            <div className="mt-12 pt-6 border-t border-border flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0 || isCreating}
                className="w-32 h-11 text-base font-medium"
              >
                Back
              </Button>

              {currentStep === ONBOARDING_STEPS.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isCreating}
                  className="w-40 h-11 text-base font-medium gap-2"
                >
                  {isCreating ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                  Finish
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid}
                  className="w-32 h-11 text-base font-medium gap-2"
                >
                  Next <ChevronRight className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
