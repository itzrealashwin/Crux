import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  FileText,
  Github,
  Linkedin,
  Globe,
  Loader2,
  X,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// UI Components
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { useStudentProfile } from "@/features/student/hooks/useStudent.js";

const AVAILABLE_SKILLS = [
  /* Languages */
  {
    skillCode: "SKL5NLMLP",
    skill: "Java",
    category: "Language",
    aliases: ["java"],
  },
  {
    skillCode: "SKLMVKXX0",
    skill: "Python",
    category: "Language",
    aliases: ["py", "python3"],
  },
  {
    skillCode: "SKLCQASXR",
    skill: "JavaScript",
    category: "Language",
    aliases: ["js", "es6"],
  },
  {
    skillCode: "SKLN2GA8C",
    skill: "TypeScript",
    category: "Language",
    aliases: ["ts"],
  },
  {
    skillCode: "SKLIBE6R6",
    skill: "C++",
    category: "Language",
    aliases: ["cpp"],
  },
  { skillCode: "SKL7VPWTD", skill: "C", category: "Language", aliases: [] },
  {
    skillCode: "SKLQS2HDA",
    skill: "C#",
    category: "Language",
    aliases: ["csharp"],
  },
  {
    skillCode: "SKLOGLNRA",
    skill: "Go",
    category: "Language",
    aliases: ["golang"],
  },
  { skillCode: "SKLQ3LXY0", skill: "Rust", category: "Language", aliases: [] },
  {
    skillCode: "SKLSD20HR",
    skill: "Kotlin",
    category: "Language",
    aliases: [],
  },
  { skillCode: "SKLP0B95E", skill: "Swift", category: "Language", aliases: [] },
  { skillCode: "SKLNXQMAI", skill: "PHP", category: "Language", aliases: [] },
  { skillCode: "SKLYNEGI6", skill: "Dart", category: "Language", aliases: [] },

  /* Frontend */
  {
    skillCode: "SKL8YOBF8",
    skill: "HTML",
    category: "Frontend",
    aliases: ["html5"],
  },
  {
    skillCode: "SKLMTC894",
    skill: "CSS",
    category: "Frontend",
    aliases: ["css3"],
  },
  {
    skillCode: "SKLKOSLNP",
    skill: "React",
    category: "Frontend",
    aliases: ["reactjs", "react.js"],
  },
  {
    skillCode: "SKLYPVYNG",
    skill: "Next.js",
    category: "Frontend",
    aliases: ["next"],
  },
  {
    skillCode: "SKLP0FPG7",
    skill: "Angular",
    category: "Frontend",
    aliases: [],
  },
  {
    skillCode: "SKLI8DD11",
    skill: "Vue.js",
    category: "Frontend",
    aliases: ["vue"],
  },
  {
    skillCode: "SKLUGYZEJ",
    skill: "Tailwind CSS",
    category: "Frontend",
    aliases: ["tailwind"],
  },
  {
    skillCode: "SKLLEZP45",
    skill: "Bootstrap",
    category: "Frontend",
    aliases: [],
  },
  { skillCode: "SKLOEUG8X", skill: "Redux", category: "Frontend", aliases: [] },
  {
    skillCode: "SKL95IR4N",
    skill: "ShadCN",
    category: "Frontend",
    aliases: ["shadcn-ui"],
  },

  /* Backend */
  {
    skillCode: "SKL9AIRPJ",
    skill: "Node.js",
    category: "Backend",
    aliases: ["node", "nodejs"],
  },
  {
    skillCode: "SKL37UI66",
    skill: "Express.js",
    category: "Backend",
    aliases: ["express"],
  },
  {
    skillCode: "SKLL32R14",
    skill: "Spring Boot",
    category: "Backend",
    aliases: ["spring", "springboot"],
  },
  { skillCode: "SKL09FCWU", skill: "Django", category: "Backend", aliases: [] },
  { skillCode: "SKLSSMODY", skill: "Flask", category: "Backend", aliases: [] },
  {
    skillCode: "SKL4BEAWN",
    skill: "Laravel",
    category: "Backend",
    aliases: [],
  },
  {
    skillCode: "SKLSUPPOE",
    skill: "NestJS",
    category: "Backend",
    aliases: ["nestjs"],
  },
  {
    skillCode: "SKLVYHI74",
    skill: "ASP.NET",
    category: "Backend",
    aliases: ["dotnet"],
  },
  {
    skillCode: "SKL2OY7TI",
    skill: "GraphQL",
    category: "Backend",
    aliases: [],
  },

  /* Mobile */
  {
    skillCode: "SKLRZOKLN",
    skill: "Android Development",
    category: "Mobile",
    aliases: ["android"],
  },
  { skillCode: "SKLQ748QS", skill: "Flutter", category: "Mobile", aliases: [] },
  {
    skillCode: "SKLKGGS15",
    skill: "React Native",
    category: "Mobile",
    aliases: ["react-native"],
  },
  {
    skillCode: "SKLHWO6WU",
    skill: "iOS Development",
    category: "Mobile",
    aliases: ["ios"],
  },
  {
    skillCode: "SKL63YXOP",
    skill: "Kotlin Android",
    category: "Mobile",
    aliases: [],
  },

  /* Database */
  {
    skillCode: "SKLXJZU1N",
    skill: "MongoDB",
    category: "Database",
    aliases: ["mongo"],
  },
  {
    skillCode: "SKL0260DV",
    skill: "PostgreSQL",
    category: "Database",
    aliases: ["postgres", "psql"],
  },
  { skillCode: "SKL09GN0C", skill: "MySQL", category: "Database", aliases: [] },
  {
    skillCode: "SKLFQFPET",
    skill: "SQLite",
    category: "Database",
    aliases: [],
  },
  { skillCode: "SKLW19MST", skill: "Redis", category: "Database", aliases: [] },
  {
    skillCode: "SKLQ4Q5OV",
    skill: "Firebase",
    category: "Database",
    aliases: [],
  },
  {
    skillCode: "SKLTETZ5Z",
    skill: "Oracle DB",
    category: "Database",
    aliases: ["oracle"],
  },

  /* Cloud & DevOps */
  {
    skillCode: "SKLYNEV7F",
    skill: "AWS",
    category: "Cloud & DevOps",
    aliases: ["amazon web services"],
  },
  {
    skillCode: "SKL2DA1NL",
    skill: "Google Cloud",
    category: "Cloud & DevOps",
    aliases: ["gcp"],
  },
  {
    skillCode: "SKL3U8O4K",
    skill: "Microsoft Azure",
    category: "Cloud & DevOps",
    aliases: ["azure"],
  },
  {
    skillCode: "SKLFFGOWO",
    skill: "Docker",
    category: "Cloud & DevOps",
    aliases: [],
  },
  {
    skillCode: "SKLPFM75P",
    skill: "Kubernetes",
    category: "Cloud & DevOps",
    aliases: ["k8s"],
  },
  {
    skillCode: "SKLRF7MGE",
    skill: "CI/CD",
    category: "Cloud & DevOps",
    aliases: [],
  },
  {
    skillCode: "SKL8SI7GF",
    skill: "Jenkins",
    category: "Cloud & DevOps",
    aliases: [],
  },
  {
    skillCode: "SKL1YYOKG",
    skill: "Terraform",
    category: "Cloud & DevOps",
    aliases: [],
  },
  {
    skillCode: "SKLVN8GZP",
    skill: "Linux",
    category: "Cloud & DevOps",
    aliases: [],
  },

  /* Data & AI */
  {
    skillCode: "SKLQRWMPG",
    skill: "Machine Learning",
    category: "Data & AI",
    aliases: ["ml"],
  },
  {
    skillCode: "SKLCNPVR2",
    skill: "Deep Learning",
    category: "Data & AI",
    aliases: ["dl"],
  },
  {
    skillCode: "SKLLYPFCK",
    skill: "Data Science",
    category: "Data & AI",
    aliases: [],
  },
  {
    skillCode: "SKL4AW4M2",
    skill: "TensorFlow",
    category: "Data & AI",
    aliases: [],
  },
  {
    skillCode: "SKLHLMYOC",
    skill: "PyTorch",
    category: "Data & AI",
    aliases: [],
  },
  {
    skillCode: "SKLUD8HBF",
    skill: "Pandas",
    category: "Data & AI",
    aliases: [],
  },
  {
    skillCode: "SKLVX5W0R",
    skill: "NumPy",
    category: "Data & AI",
    aliases: [],
  },
  {
    skillCode: "SKLOI2924",
    skill: "Natural Language Processing",
    category: "Data & AI",
    aliases: ["nlp"],
  },
  {
    skillCode: "SKLR1J5R4",
    skill: "Computer Vision",
    category: "Data & AI",
    aliases: ["cv"],
  },

  /* Cybersecurity */
  {
    skillCode: "SKL1HK2CG",
    skill: "Ethical Hacking",
    category: "Cybersecurity",
    aliases: [],
  },
  {
    skillCode: "SKLC5GI5Y",
    skill: "Network Security",
    category: "Cybersecurity",
    aliases: [],
  },
  {
    skillCode: "SKLICHZQ0",
    skill: "Penetration Testing",
    category: "Cybersecurity",
    aliases: ["pentest"],
  },
  {
    skillCode: "SKLCBM1VS",
    skill: "Cryptography",
    category: "Cybersecurity",
    aliases: [],
  },

  /* Testing & QA */
  {
    skillCode: "SKLFBOVEP",
    skill: "Unit Testing",
    category: "Testing & QA",
    aliases: [],
  },
  {
    skillCode: "SKLV9HVC0",
    skill: "Jest",
    category: "Testing & QA",
    aliases: [],
  },
  {
    skillCode: "SKLSBK19P",
    skill: "Mocha",
    category: "Testing & QA",
    aliases: [],
  },
  {
    skillCode: "SKL86EV60",
    skill: "Selenium",
    category: "Testing & QA",
    aliases: [],
  },
  {
    skillCode: "SKLUN5F4E",
    skill: "Cypress",
    category: "Testing & QA",
    aliases: [],
  },
  {
    skillCode: "SKLOGWAYB",
    skill: "Postman",
    category: "Testing & QA",
    aliases: [],
  },

  /* Tools */
  {
    skillCode: "SKLM80RFP",
    skill: "Git",
    category: "Tools",
    aliases: ["github", "gitlab"],
  },
  {
    skillCode: "SKLTMYDOR",
    skill: "VS Code",
    category: "Tools",
    aliases: ["vscode"],
  },
  {
    skillCode: "SKL3VAEPB",
    skill: "IntelliJ IDEA",
    category: "Tools",
    aliases: ["intellij"],
  },
  { skillCode: "SKLWZQTLO", skill: "Jira", category: "Tools", aliases: [] },
  { skillCode: "SKL3SVL2A", skill: "Slack", category: "Tools", aliases: [] },
  { skillCode: "SKLCF7Q7R", skill: "Notion", category: "Tools", aliases: [] },

  /* Design */
  { skillCode: "SKLT9YBZ1", skill: "Figma", category: "Design", aliases: [] },
  {
    skillCode: "SKLWRPOMC",
    skill: "UI Design",
    category: "Design",
    aliases: [],
  },
  {
    skillCode: "SKLEN3PL7",
    skill: "UX Design",
    category: "Design",
    aliases: [],
  },
  {
    skillCode: "SKLVPXI21",
    skill: "Adobe XD",
    category: "Design",
    aliases: [],
  },

  /* Soft Skills */
  {
    skillCode: "SKLF4M0NB",
    skill: "Communication",
    category: "Soft Skill",
    aliases: [],
  },
  {
    skillCode: "SKLF0DVDS",
    skill: "Leadership",
    category: "Soft Skill",
    aliases: [],
  },
  {
    skillCode: "SKL4J2U2R",
    skill: "Problem Solving",
    category: "Soft Skill",
    aliases: [],
  },
  {
    skillCode: "SKLSHIPLH",
    skill: "Teamwork",
    category: "Soft Skill",
    aliases: [],
  },
  {
    skillCode: "SKLGI3Z9K",
    skill: "Time Management",
    category: "Soft Skill",
    aliases: [],
  },
];

// Animation Configuration
const formVariants = {
  hidden: { opacity: 0, x: 15 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, x: -15, transition: { duration: 0.2 } },
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { createProfile, isCreating } = useStudentProfile();

  // --- State ---
  const [currentStep, setCurrentStep] = useState(0);
  const [resumeFile, setResumeFile] = useState(null);
  // 3. Add these two local states for the search dropdown
  const [skillInput, setSkillInput] = useState("");
  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    bio: "", // Add this
    department: "",
    graduationYear: "",
    cgpa: "",
    backlogs: "",
    xthMarks: "", // Add this
    xIIthMarks: "", // Add this
    skills: [],
    links: {
      github: "",
      linkedin: "",
      portfolio: "",
    },
    // Add this temporary object to capture one project during onboarding
    featuredProject: { title: "", techStack: "", link: "" },
  });

  // Fix: Use s.skill instead of skill.name
  const filteredSkills = AVAILABLE_SKILLS.filter(
    (s) =>
      // Don't show skills that are already selected
      !formData.skills.includes(s.skill) &&
      // Match by skill name OR alias
      (s.skill.toLowerCase().includes(skillInput.toLowerCase()) ||
        s.aliases.some((alias) =>
          alias.toLowerCase().includes(skillInput.toLowerCase()),
        )),
  );

  const handleAddSkill = (skillName) => {
    setFormData((prev) => ({ ...prev, skills: [...prev.skills, skillName] }));
    setSkillInput("");
    setIsSkillDropdownOpen(false);
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  // --- Steps Configuration ---
  const steps = [
    {
      id: 0,
      label: "Personal Info",
      description:
        "Let's start with the basics so recruiters know who you are.",
      icon: User,
    },
    {
      id: 1,
      label: "Academic Background",
      description: "Details about your current degree and academic standing.",
      icon: GraduationCap,
    },
    {
      id: 2,
      label: "Professional Details",
      description: "Showcase your skills, projects, and online presence.",
      icon: Briefcase,
    },
    {
      id: 3,
      label: "Review & Submit",
      description: "Verify your information before finalizing your profile.",
      icon: CheckCircle2,
    },
  ];

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;

    // Prevent negative numbers
    if (Number(newValue) < 0) return;

    // Limit marks fields
    if (name === "xthMarks" || name === "xIIthMarks") {
      if (Number(newValue) > 100) newValue = 100;
    }

    // Limit CGPA
    if (name === "cgpa") {
      if (Number(newValue) > 10) newValue = 10;
    }

    // Nested field support
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: newValue },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setResumeFile(file);
    } else {
      alert("Please upload a PDF file.");
    }
  };

  // --- Validation ---
  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.firstName.trim() && formData.lastName.trim();
      case 1:
        // Added xthMarks and xIIthMarks validation
        return (
          formData.department &&
          formData.graduationYear &&
          formData.xthMarks &&
          formData.xIIthMarks
        );
      case 2:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    // Transform the array of skill names into an array of skillCodes
    const skillCodesArray = formData.skills
      .map((selectedSkillName) => {
        const foundSkill = AVAILABLE_SKILLS.find(
          (s) => s.skill === selectedSkillName,
        );
        return foundSkill ? foundSkill.skillCode : null;
      })
      .filter(Boolean);

    const payload = {
      ...formData,

      // 1. CONVERT STRINGS TO NUMBERS HERE:
      graduationYear: Number(formData.graduationYear),
      cgpa: formData.cgpa ? Number(formData.cgpa) : 0, // Fallback to 0 if empty
      backlogs: Number(formData.backlogs) || 0,
      xthMarks: Number(formData.xthMarks),
      xIIthMarks: Number(formData.xIIthMarks),

      skills: skillCodesArray,

      projects: formData.featuredProject.title
        ? [
            {
              title: formData.featuredProject.title,
              techStack: formData.featuredProject.techStack
                ? formData.featuredProject.techStack
                    .split(",")
                    .map((s) => s.trim())
                : [],
              link: formData.featuredProject.link,
            },
          ]
        : [],
    };

    delete payload.featuredProject;

    try {
      await createProfile(payload);
      navigate("/student/dashboard");
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };
  return (
    // 1. Full-screen split layout wrapper
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-background flex flex-col lg:flex-row font-sans text-foreground">
      {" "}
      {/* 2. LEFT SIDEBAR: Full height, fixed width on large screens */}
      <div className="bg-muted/30 lg:w-[400px] xl:w-[450px] p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border lg:h-full lg:overflow-y-auto">
        {" "}
        <div>
          {/* Logo Section */}
          <div className="flex items-center gap-2 text-primary">
            <div
              onClick={() => navigate("/")}
              className="flex items-center cursor-pointer"
            >
              <div className="relative flex items-center justify-center text-2xl text-primary rounded-md shadow-sm">
                <span className="font-['Outfit'] font-bold text-2xl">C</span>
              </div>
              <div className="flex items-baseline font-['Outfit'] font-bold text-2xl tracking-tight text-foreground">
                rux
                <span className="w-1.5 h-1.5 rounded-full bg-primary ml-1 animate-pulse" />
              </div>
            </div>
          </div>

          {/* ADDED CONTENT: Motivation / Context */}
          <div className="mt-10 mb-12">
            <h1 className="text-2xl font-bold tracking-tight mb-2">
              Build Your Profile
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your profile is your digital resume on campus. A complete and
              accurate representation of your academic and professional journey
              significantly increases your chances of matching with top
              recruiting companies.
            </p>
          </div>

          {/* Stepper Navigation */}
          <nav className="space-y-8">
            {steps.map((step, index) => {
              const isActive = currentStep === index;
              const isCompleted = currentStep > index;

              return (
                <div key={step.id} className="flex items-start gap-4 relative">
                  {/* Connecting Line */}
                  {index !== steps.length - 1 && (
                    <div
                      className={`absolute left-3.5 top-10 w-0.5 h-10 ${
                        isCompleted ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}

                  {/* Icon Bubble */}
                  <div
                    className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/10"
                        : isCompleted
                          ? "bg-primary text-primary-foreground"
                          : "bg-background border-2 border-border text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Step Text */}
                  <div
                    className={`transition-opacity duration-300 pt-0.5 ${
                      isActive ? "opacity-100" : "opacity-60"
                    }`}
                  >
                    <p
                      className={`text-sm font-semibold ${
                        isActive ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {step.label}
                    </p>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="text-xs text-muted-foreground mt-1"
                      >
                        {step.description}
                      </motion.p>
                    )}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
        {/* ADDED CONTENT: Pro Tip & Help */}
        <div className="hidden lg:block mt-12 space-y-6">
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-2">
              <Info className="w-4 h-4" />
              Pro Tip
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Students who upload their resume and provide links to active
              GitHub repositories or live portfolios are 3x more likely to be
              shortlisted for technical interviews.
            </p>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Facing issues?{" "}
            <a href="#" className="text-primary hover:underline font-medium">
              Contact Placement Cell
            </a>
          </p>
        </div>
      </div>
      {/* 3. RIGHT CONTENT: Centered form within full-screen space */}
      <div className="flex-1 flex flex-col lg:h-full lg:overflow-y-auto scroll-smooth">
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 w-full">
          <div className="w-full max-w-2xl py-8">
            <div className="mb-10">
              <p className="text-sm font-medium text-primary mb-2 tracking-wide uppercase">
                Step {currentStep + 1} of {steps.length}
              </p>
              <h2 className="text-3xl font-bold text-foreground">
                {steps[currentStep].label}
              </h2>
              <p className="text-muted-foreground mt-2 text-lg">
                {steps[currentStep].description}
              </p>
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
                {/* --- STEP 1: PERSONAL --- */}
                {currentStep === 0 && (
                  <div className="grid gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-base">
                          First Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="e.g. Jane"
                          className="bg-background h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base">
                          Last Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="e.g. Doe"
                          className="bg-background h-11"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-base">Short Bio</Label>
                        <Badge variant="secondary" className="font-normal">
                          Boosts Score
                        </Badge>
                      </div>
                      <Textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="A brief summary about your academic interests and career goals (max 500 chars)"
                        maxLength={500}
                        className="bg-background resize-none min-h-[100px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-base">Phone Number</Label>
                        <Badge variant="secondary" className="font-normal">
                          Optional
                        </Badge>
                      </div>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 99999 99999"
                        className="bg-background h-11"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        We'll only use this for urgent placement updates or
                        interview scheduling.
                      </p>
                    </div>
                  </div>
                )}

                {/* --- STEP 2: EDUCATION --- */}
                {currentStep === 1 && (
                  <div className="grid gap-8">
                    <div className="space-y-2">
                      <Label className="text-base">
                        Department <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.department}
                        onValueChange={(val) =>
                          handleSelectChange("department", val)
                        }
                      >
                        <SelectTrigger className="bg-background h-11">
                          <SelectValue placeholder="Select your current department" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "Computer Science",
                            "Information Technology",
                            "Electronics",
                            "Mechanical",
                            "Civil",
                            "MCA",
                            "MBA",
                          ].map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-base">
                          Expected Graduation Year{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="number"
                          name="graduationYear"
                          value={formData.graduationYear}
                          onChange={handleChange}
                          placeholder="e.g. 2025"
                          className="bg-background h-11 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label className="text-base">
                          10th Marks (%){" "}
                          <span className="text-destructive">*</span>
                        </Label>

                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          name="xthMarks"
                          value={formData.xthMarks}
                          onChange={handleChange}
                          onWheel={(e) => e.target.blur()}
                          placeholder="e.g. 85.4"
                          className="bg-background h-11 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base">
                          12th Marks (%){" "}
                          <span className="text-destructive">*</span>
                        </Label>

                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          name="xIIthMarks"
                          value={formData.xIIthMarks}
                          onChange={handleChange}
                          onWheel={(e) => e.target.blur()}
                          placeholder="e.g. 82.1"
                          className="bg-background h-11 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base">Current CGPA</Label>

                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          name="cgpa"
                          value={formData.cgpa}
                          onChange={handleChange}
                          onWheel={(e) => e.target.blur()}
                          placeholder="e.g. 8.75"
                          className="bg-background h-11 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* --- STEP 3: PROFESSIONAL --- */}
                {currentStep === 2 && (
                  <div className="grid gap-8">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-base">Technical Skills</Label>
                        <Badge variant="secondary" className="font-normal">
                          Optional
                        </Badge>
                      </div>

                      {/* Display Selected Skills as Badges */}
                      {formData.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.skills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="px-3 py-1.5 flex items-center gap-1.5 text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              {skill}
                              <X
                                className="w-3.5 h-3.5 cursor-pointer hover:text-destructive transition-colors"
                                onClick={() => handleRemoveSkill(skill)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Search Input and Dropdown */}
                      <div className="relative">
                        <Input
                          type="text"
                          value={skillInput}
                          onChange={(e) => {
                            setSkillInput(e.target.value);
                            setIsSkillDropdownOpen(true);
                          }}
                          onFocus={() => setIsSkillDropdownOpen(true)}
                          onBlur={() => {
                            // Slight delay allows the onMouseDown event on the dropdown item to fire first
                            setTimeout(
                              () => setIsSkillDropdownOpen(false),
                              150,
                            );
                          }}
                          placeholder="Search and add skills (e.g. React, MongoDB)..."
                          className="bg-background h-11"
                        />

                        {/* Dropdown Menu */}
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
                                      // We use onMouseDown instead of onClick so it fires before the Input's onBlur event
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleAddSkill(skill.skill);
                                      }}
                                      className="px-4 py-2.5 hover:bg-muted rounded-lg cursor-pointer flex justify-between items-center transition-colors"
                                    >
                                      <span className="font-medium text-sm text-foreground">
                                        {skill.skill}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] text-muted-foreground border-border/50"
                                      >
                                        {skill.category}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="px-4 py-4 text-sm text-muted-foreground text-center">
                                  No matching skills found.
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        Recruiters frequently filter candidates based on these
                        keywords.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-base">
                        Social & Portfolio Links
                      </Label>
                      <div className="grid gap-4">
                        <div className="relative">
                          <Github className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                          <Input
                            name="links.github"
                            value={formData.links.github}
                            onChange={handleChange}
                            className="pl-11 bg-background h-11"
                            placeholder="GitHub Profile URL"
                          />
                        </div>
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                          <Input
                            name="links.linkedin"
                            value={formData.links.linkedin}
                            onChange={handleChange}
                            className="pl-11 bg-background h-11"
                            placeholder="LinkedIn Profile URL"
                          />
                        </div>
                        <div className="relative">
                          <Globe className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                          <Input
                            name="links.portfolio"
                            value={formData.links.portfolio}
                            onChange={handleChange}
                            className="pl-11 bg-background h-11"
                            placeholder="Personal Portfolio or Blog URL"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Featured Project UI */}
                    <div className="p-5 border border-border rounded-xl bg-muted/20 space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-base text-primary">
                          Featured Project
                        </Label>
                        <Badge variant="outline">+10% Profile Score</Badge>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Project Title
                        </Label>
                        <Input
                          name="featuredProject.title"
                          value={formData.featuredProject.title}
                          onChange={handleChange}
                          placeholder="e.g. Task Management App"
                          className="bg-background h-11"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Tech Stack (comma separated)
                          </Label>
                          <Input
                            name="featuredProject.techStack"
                            value={formData.featuredProject.techStack}
                            onChange={handleChange}
                            placeholder="React, Node.js"
                            className="bg-background h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Project Link
                          </Label>
                          <Input
                            name="featuredProject.link"
                            value={formData.featuredProject.link}
                            onChange={handleChange}
                            placeholder="GitHub or Live URL"
                            className="bg-background h-11"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base">Resume (PDF)</Label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                          resumeFile
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }`}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept=".pdf"
                          onChange={handleFileChange}
                        />

                        {resumeFile ? (
                          <div className="text-center animate-in fade-in zoom-in">
                            <div className="bg-primary text-primary-foreground p-3 rounded-full w-fit mx-auto mb-3 shadow-md">
                              <FileText className="h-6 w-6" />
                            </div>
                            <p className="text-base font-medium text-foreground">
                              {resumeFile.name}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {(resumeFile.size / 1024 / 1024).toFixed(2)} MB •
                              Click to replace
                            </p>
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground">
                            <div className="bg-muted p-3 rounded-full w-fit mx-auto mb-3">
                              <Upload className="h-6 w-6 text-foreground" />
                            </div>
                            <p className="text-base font-medium text-foreground">
                              Click to upload your resume
                            </p>
                            <p className="text-sm mt-1">
                              PDF format only. Maximum file size 5MB.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* --- STEP 4: REVIEW --- */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <p className="text-muted-foreground mb-6 text-sm">
                      Take a moment to verify your information. You can always
                      edit these details later from your dashboard settings, but
                      it's best to start strong!
                    </p>

                    <div className="bg-muted/30 border border-border rounded-xl divide-y divide-border overflow-hidden">
                      <div className="p-5 flex justify-between items-center hover:bg-muted/50 transition-colors">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Full Name
                          </p>
                          <p className="text-lg font-semibold">
                            {formData.firstName} {formData.lastName}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentStep(0)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Edit
                        </Button>
                      </div>

                      <div className="p-5 flex justify-between items-center hover:bg-muted/50 transition-colors">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Academic Details
                          </p>
                          <p className="text-lg font-semibold">
                            {formData.department} • Class of{" "}
                            {formData.graduationYear}
                          </p>
                          {formData.cgpa && (
                            <p className="text-sm text-muted-foreground mt-1">
                              CGPA: {formData.cgpa}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentStep(1)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Edit
                        </Button>
                      </div>

                      <div className="p-5 flex justify-between items-center hover:bg-muted/50 transition-colors">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Attached Resume
                          </p>
                          <div
                            className={`text-base font-semibold flex items-center gap-2 ${
                              resumeFile
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          >
                            {resumeFile ? (
                              <>
                                <FileText className="h-5 w-5" />
                                {resumeFile.name}
                              </>
                            ) : (
                              "No resume uploaded"
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentStep(2)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Edit
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-3 p-4 bg-primary/10 text-primary rounded-xl text-sm border border-primary/20">
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        By clicking finish, you agree to make this profile
                        visible to verified recruiting companies interacting
                        with the placement cell.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* --- FOOTER ACTIONS --- */}
            <div className="mt-12 pt-6 border-t border-border flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0 || isCreating}
                className="w-32 h-11 text-base font-medium"
              >
                Back
              </Button>

              {currentStep === steps.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isCreating}
                  className="w-40 h-11 text-base font-medium gap-2"
                >
                  {isCreating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5" />
                  )}
                  Finish
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid()}
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
