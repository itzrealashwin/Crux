/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║       MES Pune Placement Portal — MongoDB Seed Script        ║
 * ║                                                              ║
 * ║  Usage:  node seed.js <MONGO_URI>                            ║
 * ║  Default URI: mongodb://localhost:27017/mes_placement         ║
 * ║                                                              ║
 * ║  Password for ALL accounts: Test@1234                        ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Collections seeded (in dependency order):
 *   1. skills          — master skill taxonomy (20 skills)
 *   2. users           — 1 super_admin, 2 admins, 12 students
 *   3. adminprofiles   — one per admin user
 *   4. studentprofiles — one per student, skills[] = ObjectId refs
 *   5. jobs            — 6 Pune companies (TCS, Infosys, Wipro, KPIT, Persistent, Cognizant)
 *   6. applications    — 25 applications, relations + snapshots wired correctly
 *   7. notifications   — shortlist/rejection/new-job alerts
 *   8. auditlogs       — admin actions trail
 *
 * Note: authtokens is left empty — tokens are created at login time.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ─── Config ───────────────────────────────────────────────────────────────────

const MONGO_URI =
  process.argv[2] || "mongodb://localhost:27017/mes_placement";
const PASSWORD = "Test@1234";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function genCode(prefix) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let r = prefix + "-";
  for (let i = 0; i < 8; i++)
    r += chars[Math.floor(Math.random() * chars.length)];
  return r;
}

const oid    = () => new mongoose.Types.ObjectId();
const pick   = (arr) => arr[Math.floor(Math.random() * arr.length)];
const ri     = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const rf     = (min, max, d = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(d));
const ago    = (days) => new Date(Date.now() - days * 86_400_000);
const from   = (days) => new Date(Date.now() + days * 86_400_000);

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅  Connected →", MONGO_URI);

  const db = mongoose.connection.db;

  // Drop collections so the script is idempotent
  const COLS = [
    "skills", "users", "adminprofiles", "studentprofiles",
    "jobs", "applications", "notifications", "auditlogs", "authtokens",
  ];
  for (const c of COLS) {
    try { await db.collection(c).drop(); } catch (_) {}
  }
  console.log("🗑   Dropped existing collections");

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  console.log("🔐  Bcrypt hash generated for:", PASSWORD);

  // ════════════════════════════════════════════════════════════════
  //  1. SKILLS
  // ════════════════════════════════════════════════════════════════

  const SKILL_DEFS = [
    { name: "JavaScript",       category: "Language",        aliases: ["js", "javascript"] },
    { name: "Python",           category: "Language",        aliases: ["py", "python3"] },
    { name: "Java",             category: "Language",        aliases: ["java", "core java"] },
    { name: "C++",              category: "Language",        aliases: ["cpp", "c plus plus"] },
    { name: "TypeScript",       category: "Language",        aliases: ["ts", "typescript"] },
    { name: "React",            category: "Frontend",        aliases: ["reactjs", "react.js"] },
    { name: "HTML & CSS",       category: "Frontend",        aliases: ["html", "css", "html5"] },
    { name: "Node.js",          category: "Backend",         aliases: ["nodejs", "node"] },
    { name: "Express.js",       category: "Backend",         aliases: ["express", "expressjs"] },
    { name: "Spring Boot",      category: "Backend",         aliases: ["spring", "springboot"] },
    { name: "MongoDB",          category: "Database",        aliases: ["mongo", "nosql"] },
    { name: "PostgreSQL",       category: "Database",        aliases: ["postgres", "psql"] },
    { name: "MySQL",            category: "Database",        aliases: ["mysql", "sql"] },
    { name: "Docker",           category: "Cloud & DevOps",  aliases: ["docker", "containers"] },
    { name: "AWS",              category: "Cloud & DevOps",  aliases: ["amazon web services", "cloud"] },
    { name: "Git",              category: "Tools",           aliases: ["github", "version control", "git"] },
    { name: "Figma",            category: "Design",          aliases: ["figma", "ui design", "ux"] },
    { name: "Machine Learning", category: "Data & AI",       aliases: ["ml", "ai", "deep learning"] },
    { name: "Network Security", category: "Cybersecurity",   aliases: ["cybersecurity", "infosec", "network sec"] },
    { name: "REST APIs",        category: "Backend",         aliases: ["rest", "api", "restful"] },
  ];

  const skillDocs = SKILL_DEFS.map((s) => ({
    _id:        oid(),
    skillCode:  genCode("SKL"),
    ...s,
    isActive:   true,
    usageCount: ri(8, 120),
    createdAt:  ago(180),
    updatedAt:  ago(30),
  }));

  await db.collection("skills").insertMany(skillDocs);
  console.log(`✅  Inserted ${skillDocs.length} skills`);

  // Lookup helper: skill ObjectId by name
  const sid = (name) => skillDocs.find((s) => s.name === name)?._id;

  // ════════════════════════════════════════════════════════════════
  //  2. USERS
  // ════════════════════════════════════════════════════════════════

  const superAdmin = {
    _id:         oid(),
    userCode:    genCode("USR"),
    email:       "superadmin@mespune.in",
    passwordHash,
    role:        "SUPER_ADMIN",
    isActive:    true,
    isVerified:  true,
    lastLoginAt: ago(1),
    createdAt:   ago(365),
    updatedAt:   ago(1),
  };

  // ── Admin users (carry _meta for profile building; stripped before insert)
  const ADMIN_META = [
    { email: "tpo@mespune.in",               firstName: "Rajesh",  lastName: "Sharma",   department: "Training & Placement Cell" },
    { email: "placement.officer@mespune.in", firstName: "Meena",   lastName: "Kulkarni", department: "Computer Science & Engineering" },
  ];

  const adminUsers = ADMIN_META.map((m) => ({
    _id:         oid(),
    userCode:    genCode("USR"),
    email:       m.email,
    passwordHash,
    role:        "ADMIN",
    isActive:    true,
    isVerified:  true,
    lastLoginAt: ago(ri(1, 4)),
    createdAt:   ago(300),
    updatedAt:   ago(2),
    _meta:       m,          // stripped before DB insert
  }));

  // ── Student users
  const STUDENT_META = [
    { email: "rohan.sharma@mespune.in",     firstName: "Rohan",   lastName: "Sharma",   dept: "MCA",    year: 2025, cgpa: 8.4, phone: "+91 9823401122" },
    { email: "priya.patel@mespune.in",      firstName: "Priya",   lastName: "Patel",    dept: "B.Tech", year: 2025, cgpa: 9.1, phone: "+91 9823401133" },
    { email: "arjun.desai@mespune.in",      firstName: "Arjun",   lastName: "Desai",    dept: "MCA",    year: 2025, cgpa: 7.6, phone: "+91 9823401144" },
    { email: "neha.kulkarni@mespune.in",    firstName: "Neha",    lastName: "Kulkarni", dept: "B.Tech", year: 2025, cgpa: 8.9, phone: "+91 9823401155" },
    { email: "vikas.joshi@mespune.in",      firstName: "Vikas",   lastName: "Joshi",    dept: "BCA",    year: 2025, cgpa: 7.2, phone: "+91 9823401166" },
    { email: "sneha.patil@mespune.in",      firstName: "Sneha",   lastName: "Patil",    dept: "B.Tech", year: 2025, cgpa: 8.7, phone: "+91 9823401177" },
    { email: "rahul.mehta@mespune.in",      firstName: "Rahul",   lastName: "Mehta",    dept: "MCA",    year: 2025, cgpa: 6.8, phone: "+91 9823401188" },
    { email: "anjali.singh@mespune.in",     firstName: "Anjali",  lastName: "Singh",    dept: "B.Tech", year: 2025, cgpa: 9.3, phone: "+91 9823401199" },
    { email: "kiran.nair@mespune.in",       firstName: "Kiran",   lastName: "Nair",     dept: "BCA",    year: 2025, cgpa: 7.9, phone: "+91 9823401200" },
    { email: "divya.reddy@mespune.in",      firstName: "Divya",   lastName: "Reddy",    dept: "MBA",    year: 2025, cgpa: 8.2, phone: "+91 9823401211" },
    { email: "aditya.kumar@mespune.in",     firstName: "Aditya",  lastName: "Kumar",    dept: "B.Tech", year: 2025, cgpa: 8.0, phone: "+91 9823401222" },
    { email: "pooja.gupta@mespune.in",      firstName: "Pooja",   lastName: "Gupta",    dept: "MCA",    year: 2025, cgpa: 7.5, phone: "+91 9823401233" },
  ];

  const studentUsers = STUDENT_META.map((m) => ({
    _id:         oid(),
    userCode:    genCode("USR"),
    email:       m.email,
    passwordHash,
    role:        "STUDENT",
    isActive:    true,
    isVerified:  true,
    lastLoginAt: ago(ri(1, 14)),
    createdAt:   ago(150),
    updatedAt:   ago(ri(1, 10)),
    _meta:       m,
  }));

  const stripMeta = ({ _meta, ...u }) => u;
  await db.collection("users").insertMany(
    [superAdmin, ...adminUsers.map(stripMeta), ...studentUsers.map(stripMeta)]
  );
  console.log(`✅  Inserted ${1 + adminUsers.length + studentUsers.length} users`);

  // ════════════════════════════════════════════════════════════════
  //  3. ADMIN PROFILES
  // ════════════════════════════════════════════════════════════════

  const adminProfiles = adminUsers.map((u) => ({
    _id:         oid(),
    adminCode:   genCode("ADM"),
    userId:      u._id,
    firstName:   u._meta.firstName,
    lastName:    u._meta.lastName,
    email:       u.email,
    phone:       `+91 9${ri(700000000, 999999999)}`,
    department:  u._meta.department,
    isActive:    true,
    isVerified:  true,
    createdAt:   ago(300),
    updatedAt:   ago(5),
  }));

  await db.collection("adminprofiles").insertMany(adminProfiles);
  console.log(`✅  Inserted ${adminProfiles.length} admin profiles`);

  // ════════════════════════════════════════════════════════════════
  //  4. STUDENT PROFILES
  // ════════════════════════════════════════════════════════════════

  // Skills each department typically has
  const DEPT_SKILLS = {
    "MCA":    [sid("Java"), sid("Spring Boot"), sid("MySQL"), sid("Git"), sid("HTML & CSS"), sid("REST APIs")],
    "B.Tech": [sid("Python"), sid("React"), sid("Node.js"), sid("MongoDB"), sid("Git"), sid("Docker"), sid("JavaScript")],
    "BCA":    [sid("JavaScript"), sid("HTML & CSS"), sid("React"), sid("MySQL"), sid("Git")],
    "MBA":    [sid("REST APIs"), sid("Figma"), sid("Machine Learning"), sid("Git"), sid("PostgreSQL")],
  };

  const CERT_POOL = [
    { name: "AWS Cloud Practitioner",            issuer: "Amazon Web Services" },
    { name: "Oracle Certified Java SE 11",        issuer: "Oracle" },
    { name: "Google Associate Cloud Engineer",    issuer: "Google" },
    { name: "MongoDB Certified Developer",        issuer: "MongoDB" },
    { name: "Microsoft Azure Fundamentals AZ-900",issuer: "Microsoft" },
  ];

  const PROJECT_NAMES = [
    "E-Commerce Platform",
    "Library Management System",
    "Student Attendance Portal",
    "Real-Time Chat Application",
    "Inventory Management Dashboard",
    "Healthcare Appointment Booking",
    "Online Examination System",
  ];

  const studentProfiles = studentUsers.map((u) => {
    const m = u._meta;
    const skills = (DEPT_SKILLS[m.dept] || []).filter(Boolean);
    const backlogs = m.cgpa >= 8.0 ? 0 : ri(0, 1);
    const xth = rf(70, 95, 2);
    const xIIth = rf(68, 93, 2);
    const hasCert = m.cgpa >= 8.5;
    const cert = pick(CERT_POOL);
    const projName = pick(PROJECT_NAMES);
    const techNames = skills.slice(0, 3).map((id) => skillDocs.find((s) => s._id.equals(id))?.name).filter(Boolean);
    const ghSlug = `${m.firstName.toLowerCase()}${m.lastName.toLowerCase()}`;
    const completeness = m.cgpa >= 8.0 ? ri(82, 96) : ri(66, 81);

    return {
      _id:           oid(),
      profileCode:   genCode("STU"),
      userId:        u._id,

      // Identity
      firstName:  m.firstName,
      lastName:   m.lastName,
      photo: {
        url:        `https://api.dicebear.com/7.x/initials/svg?seed=${m.firstName}${m.lastName}&backgroundColor=4f46e5`,
        uploadedAt: ago(100),
      },
      bio: `Final-year ${m.dept} student at MES College of Engineering, Pune. ${
        m.dept === "MBA"
          ? "Keen interest in product management and business analytics."
          : "Passionate about building scalable web applications and exploring cloud technologies."
      }`,
      phone: m.phone,

      // Academic
      department:     m.dept,
      graduationYear: m.year,
      cgpa:           m.cgpa,
      backlogs,
      xthMarks:       xth,
      xIIthMarks:     xIIth,

      // Skills (ObjectId refs)
      skills,

      // Projects
      projects: [{
        title:       projName,
        description: `A full-stack ${m.dept === "MBA" ? "analytics" : "web"} application built during the final year. Features include user authentication, role-based access, and real-time updates.`,
        techStack:   techNames,
        link:        `https://github.com/${ghSlug}/${projName.toLowerCase().replace(/\s+/g, "-")}`,
        duration:    "Jan 2024 – Apr 2024",
      }],

      // Certifications (only for high scorers)
      certifications: hasCert ? [{
        name:          cert.name,
        issuer:        cert.issuer,
        issueDate:     ago(ri(60, 180)),
        credentialUrl: "https://www.credly.com/badges/example-badge-id",
      }] : [],

      // Resume
      resume: {
        url:              `https://storage.mespune.in/resumes/${ghSlug}_resume_2025.pdf`,
        uploadedAt:       ago(ri(10, 50)),
        fileSizeMB:       rf(0.4, 1.3, 2),
        pageCount:        pick([1, 1, 2]),
        isTextSelectable: true,
      },

      // Social links
      links: {
        github:    `https://github.com/${ghSlug}`,
        linkedin:  `https://linkedin.com/in/${m.firstName.toLowerCase()}-${m.lastName.toLowerCase()}-pune`,
        portfolio: m.cgpa >= 8.5 ? `https://${ghSlug}.vercel.app` : "",
      },

      placementStatus:     "NOT_PLACED",
      profileCompleteness: completeness,
      createdAt:           ago(140),
      updatedAt:           ago(ri(3, 15)),
    };
  });

  // Mark two top students as placed (wired to HIRED applications below)
  // Priya Patel (index 1) → Infosys
  studentProfiles[1].placementStatus = "PLACED";
  studentProfiles[1].placedAt = { company: "Infosys", packageLPA: 6.5, placedDate: ago(8) };
  // Anjali Singh (index 7) → TCS
  studentProfiles[7].placementStatus = "PLACED";
  studentProfiles[7].placedAt = { company: "Tata Consultancy Services", packageLPA: 7.0, placedDate: ago(4) };

  await db.collection("studentprofiles").insertMany(studentProfiles);
  console.log(`✅  Inserted ${studentProfiles.length} student profiles`);

  // ════════════════════════════════════════════════════════════════
  //  5. JOBS
  // ════════════════════════════════════════════════════════════════

  const tpoId = adminUsers[0]._id;

  const baseTimeline = (closeInDays) => [
    { key: "APPLICATION_OPEN",    label: "Applications Open",   date: ago(10),              isDone: true,  note: "Drive announced on college portal" },
    { key: "APPLICATION_CLOSE",   label: "Application Deadline",date: from(closeInDays),    isDone: false, note: "" },
    { key: "SHORTLIST_RELEASED",  label: "Shortlist Released",  date: from(closeInDays + 5),isDone: false, note: "" },
    { key: "TECHNICAL_INTERVIEW", label: "Technical Interview", date: from(closeInDays + 9),isDone: false, note: "" },
    { key: "HR_INTERVIEW",        label: "HR Interview",        date: from(closeInDays + 12),isDone: false, note: "" },
    { key: "OFFER_ROLLOUT",       label: "Offer Rollout",       date: from(closeInDays + 16),isDone: false, note: "" },
  ];

  const JOB_DEFS = [
    {
      company: {
        name:    "Tata Consultancy Services",
        website: "https://www.tcs.com",
        logoUrl: "https://logo.clearbit.com/tcs.com",
        about:   "TCS is a global leader in IT services, consulting, and business solutions with a presence in 46 countries.",
      },
      title:       "Software Developer",
      description: "Join TCS Pune as a Software Developer. You will work on enterprise-grade applications for global BFSI, retail, and manufacturing clients. TCS offers structured career paths, international exposure, and industry certifications.",
      type:        "Full Time",
      workMode:    "On-site",
      location:    "Pune, Maharashtra",
      packageLPA:  7.0,
      salaryBreakup: { fixed: 5.5, variable: 1.5 },
      eligibility: {
        minCgpa: 7.0, maxBacklogs: 0, targetBatch: [2025],
        allowedDepartments: ["MCA", "B.Tech", "BCA"],
        genderAllowed: "Any", minXthMarks: 60, minXIIthMarks: 60, minProfileCompleteness: 70,
      },
      selectionProcess: [
        { step: 1, name: "TCS National Qualifier Test (NQT)" },
        { step: 2, name: "Technical Interview" },
        { step: 3, name: "HR Interview" },
      ],
      skillsRequired: ["Java", "Python", "SQL", "Data Structures"],
      vacancies: 30,
      deadline:  from(20),
      status:    "OPEN",
    },
    {
      company: {
        name:    "Infosys",
        website: "https://www.infosys.com",
        logoUrl: "https://logo.clearbit.com/infosys.com",
        about:   "Infosys is a global leader in next-generation digital services and consulting, enabling clients in 50+ countries.",
      },
      title:       "Systems Engineer",
      description: "Infosys is hiring Systems Engineers for its Pune campus under the InfyTQ programme. Selected engineers undergo a 6-week Foundation Training followed by client project assignment. Strong focus on Agile delivery and cloud-native development.",
      type:        "Full Time",
      workMode:    "Hybrid",
      location:    "Pune, Maharashtra",
      packageLPA:  6.5,
      salaryBreakup: { fixed: 5.0, variable: 1.5 },
      eligibility: {
        minCgpa: 6.5, maxBacklogs: 1, targetBatch: [2025],
        allowedDepartments: ["MCA", "B.Tech", "BCA"],
        genderAllowed: "Any", minXthMarks: 55, minXIIthMarks: 55, minProfileCompleteness: 65,
      },
      selectionProcess: [
        { step: 1, name: "HackWithInfy Online Test" },
        { step: 2, name: "Technical Interview" },
        { step: 3, name: "HR Interview" },
      ],
      skillsRequired: ["Python", "Java", "SQL", "Communication"],
      vacancies: 25,
      deadline:  from(15),
      status:    "OPEN",
    },
    {
      company: {
        name:    "Wipro Technologies",
        website: "https://www.wipro.com",
        logoUrl: "https://logo.clearbit.com/wipro.com",
        about:   "Wipro is a leading global IT company providing technology and consulting services across 66 countries.",
      },
      title:       "Project Engineer",
      description: "Wipro Pune is hiring fresh Project Engineers under its ELITE programme. Candidates undergo a 3-month structured training in Pune covering full-stack development, DevOps, and project delivery before being assigned to live client projects.",
      type:        "Full Time",
      workMode:    "On-site",
      location:    "Pune, Maharashtra",
      packageLPA:  6.5,
      salaryBreakup: { fixed: 5.2, variable: 1.3 },
      eligibility: {
        minCgpa: 7.0, maxBacklogs: 0, targetBatch: [2025],
        allowedDepartments: ["B.Tech", "MCA", "BCA"],
        genderAllowed: "Any", minXthMarks: 60, minXIIthMarks: 60, minProfileCompleteness: 70,
      },
      selectionProcess: [
        { step: 1, name: "AMCAT Test" },
        { step: 2, name: "Group Discussion" },
        { step: 3, name: "Technical Interview" },
        { step: 4, name: "HR Interview" },
      ],
      skillsRequired: ["Java", "Python", "JavaScript", "Problem Solving"],
      vacancies: 20,
      deadline:  from(25),
      status:    "OPEN",
    },
    {
      company: {
        name:    "KPIT Technologies",
        website: "https://www.kpit.com",
        logoUrl: "https://logo.clearbit.com/kpit.com",
        about:   "KPIT is a global technology company specialising in automotive and mobility software solutions, headquartered in Pune.",
      },
      title:       "Software Engineer – Automotive",
      description: "KPIT Pune is hiring Software Engineers for its Automotive Engineering division. The role involves developing and testing software for ADAS, powertrain, and infotainment systems for Tier-1 OEM clients. Strong C++ and embedded Linux knowledge required.",
      type:        "Full Time",
      workMode:    "On-site",
      location:    "Pune, Maharashtra",
      packageLPA:  8.5,
      salaryBreakup: { fixed: 7.0, variable: 1.5 },
      eligibility: {
        minCgpa: 7.5, maxBacklogs: 0, targetBatch: [2025],
        allowedDepartments: ["B.Tech"],
        genderAllowed: "Any", minXthMarks: 65, minXIIthMarks: 65, minProfileCompleteness: 75,
      },
      selectionProcess: [
        { step: 1, name: "Online Technical Assessment (C++/DSA)" },
        { step: 2, name: "Technical Interview Round 1" },
        { step: 3, name: "Technical Interview Round 2" },
        { step: 4, name: "HR Interview" },
      ],
      skillsRequired: ["C++", "Python", "Git", "Data Structures"],
      vacancies: 10,
      deadline:  from(18),
      status:    "OPEN",
    },
    {
      company: {
        name:    "Persistent Systems",
        website: "https://www.persistent.com",
        logoUrl: "https://logo.clearbit.com/persistent.com",
        about:   "Persistent Systems is a global software solutions company specialising in product engineering and digital transformation, with its HQ in Pune.",
      },
      title:       "Software Development Engineer – Intern",
      description: "6-month paid internship at Persistent's Pune HQ. Interns work directly with product teams on live SaaS products used by global customers. Pre-placement offer (PPO) is available for top performers. Excellent mentorship and a real-work environment from day one.",
      type:        "Intern + PPO",
      workMode:    "Hybrid",
      location:    "Pune, Maharashtra",
      packageLPA:  4.8,
      salaryBreakup: { fixed: 4.8, variable: 0 },
      stipend:     { amount: 25000, frequency: "Monthly" },
      eligibility: {
        minCgpa: 7.0, maxBacklogs: 1, targetBatch: [2025],
        allowedDepartments: ["B.Tech", "MCA", "BCA"],
        genderAllowed: "Any", minXthMarks: 60, minXIIthMarks: 60, minProfileCompleteness: 70,
      },
      selectionProcess: [
        { step: 1, name: "Online Coding Test (HackerRank)" },
        { step: 2, name: "Technical Interview" },
        { step: 3, name: "HR Interview" },
      ],
      skillsRequired: ["JavaScript", "React", "Node.js", "MongoDB"],
      vacancies: 15,
      deadline:  from(12),
      status:    "OPEN",
    },
    {
      company: {
        name:    "Cognizant Technology Solutions",
        website: "https://www.cognizant.com",
        logoUrl: "https://logo.clearbit.com/cognizant.com",
        about:   "Cognizant is one of the world's leading professional services companies, transforming clients' business, operating, and technology models.",
      },
      title:       "Programmer Analyst",
      description: "Cognizant Pune is hiring Programmer Analysts under its GenC programme. Selected candidates undergo a 4-month paid training at Cognizant's Pune campus covering full-stack technologies, cloud, and Agile practices before project allocation.",
      type:        "Full Time",
      workMode:    "On-site",
      location:    "Pune, Maharashtra",
      packageLPA:  4.5,
      salaryBreakup: { fixed: 3.8, variable: 0.7 },
      eligibility: {
        minCgpa: 6.0, maxBacklogs: 2, targetBatch: [2025],
        allowedDepartments: ["MCA", "B.Tech", "BCA", "MBA"],
        genderAllowed: "Any", minXthMarks: 55, minXIIthMarks: 55, minProfileCompleteness: 60,
      },
      selectionProcess: [
        { step: 1, name: "GenC Online Assessment" },
        { step: 2, name: "Technical Interview" },
        { step: 3, name: "Communication Skills Assessment" },
        { step: 4, name: "HR Interview" },
      ],
      skillsRequired: ["SQL", "Java", "Communication", "Analytical Thinking"],
      vacancies: 40,
      deadline:  from(30),
      status:    "OPEN",
    },
  ];

  const jobDocs = JOB_DEFS.map((j, i) => ({
    _id:      oid(),
    jobCode:  genCode("JOB"),
    ...j,
    stipend:  j.stipend  || { amount: 0, frequency: "Monthly" },
    bond:     j.bond     || { hasBond: false },
    driveTimeline: baseTimeline(j.deadline ? Math.round((j.deadline - Date.now()) / 86_400_000) : 20),
    attachmentUrl: "",
    createdBy: tpoId,
    stats:    { totalApplications: 0, eligible: 0, borderline: 0, ineligible: 0, shortlisted: 0, selected: 0, hired: 0 },
    createdAt: ago(12),
    updatedAt: ago(1),
  }));

  // Aliases for readability below
  const [jobTCS, jobInfosys, jobWipro, jobKPIT, jobPersistent, jobCognizant] = jobDocs;

  await db.collection("jobs").insertMany(jobDocs);
  console.log(`✅  Inserted ${jobDocs.length} jobs`);

  // ════════════════════════════════════════════════════════════════
  //  6. APPLICATIONS
  //  Each row: { su, sp, job, status, tag }
  //  su  = studentUsers[n]   → studentId
  //  sp  = studentProfiles[n]→ studentProfileId + eligibilitySnapshot
  //  tag = autoScreeningTag
  // ════════════════════════════════════════════════════════════════

  //  0 Rohan Sharma    MCA   8.4
  //  1 Priya Patel     B.Tech 9.1  ← placed @ Infosys
  //  2 Arjun Desai     MCA   7.6
  //  3 Neha Kulkarni   B.Tech 8.9
  //  4 Vikas Joshi     BCA   7.2
  //  5 Sneha Patil     B.Tech 8.7
  //  6 Rahul Mehta     MCA   6.8
  //  7 Anjali Singh    B.Tech 9.3  ← placed @ TCS
  //  8 Kiran Nair      BCA   7.9
  //  9 Divya Reddy     MBA   8.2
  // 10 Aditya Kumar    B.Tech 8.0
  // 11 Pooja Gupta     MCA   7.5

  const APP_PLAN = [
    // Rohan Sharma
    { i: 0,  job: jobTCS,        status: "SHORTLISTED", tag: "ELIGIBLE"   },
    { i: 0,  job: jobCognizant,  status: "APPLIED",     tag: "ELIGIBLE"   },

    // Priya Patel (placed @ Infosys)
    { i: 1,  job: jobInfosys,    status: "HIRED",       tag: "ELIGIBLE"   },
    { i: 1,  job: jobKPIT,       status: "REJECTED",    tag: "ELIGIBLE",
      rejectionReason: "FAILED_TECHNICAL_INTERVIEW",
      feedback: "Your aptitude scores were excellent, but the technical round score for the Automotive role did not meet the cutoff. We encourage you to strengthen your C++/Embedded concepts." },

    // Arjun Desai
    { i: 2,  job: jobTCS,        status: "APPLIED",     tag: "ELIGIBLE"   },
    { i: 2,  job: jobWipro,      status: "INTERVIEW",   tag: "ELIGIBLE"   },

    // Neha Kulkarni
    { i: 3,  job: jobWipro,      status: "SHORTLISTED", tag: "ELIGIBLE"   },
    { i: 3,  job: jobKPIT,       status: "INTERVIEW",   tag: "ELIGIBLE"   },
    { i: 3,  job: jobPersistent, status: "APPLIED",     tag: "ELIGIBLE"   },

    // Vikas Joshi (BCA — borderline for TCS min CGPA)
    { i: 4,  job: jobTCS,        status: "APPLIED",     tag: "BORDERLINE" },
    { i: 4,  job: jobCognizant,  status: "APPLIED",     tag: "ELIGIBLE"   },

    // Sneha Patil
    { i: 5,  job: jobKPIT,       status: "SHORTLISTED", tag: "ELIGIBLE"   },
    { i: 5,  job: jobPersistent, status: "APPLIED",     tag: "ELIGIBLE"   },

    // Rahul Mehta (CGPA 6.8 — borderline for Infosys 6.5 cutoff)
    { i: 6,  job: jobCognizant,  status: "APPLIED",     tag: "ELIGIBLE"   },
    { i: 6,  job: jobInfosys,    status: "REJECTED",    tag: "BORDERLINE",
      rejectionReason: "CGPA_BELOW_CUTOFF",
      feedback: "Your application was reviewed but your CGPA is marginally below our preferred range for the Systems Engineer role. Please focus on building strong project experience." },

    // Anjali Singh (placed @ TCS)
    { i: 7,  job: jobTCS,        status: "HIRED",       tag: "ELIGIBLE"   },
    { i: 7,  job: jobKPIT,       status: "SHORTLISTED", tag: "ELIGIBLE"   },

    // Kiran Nair
    { i: 8,  job: jobPersistent, status: "APPLIED",     tag: "ELIGIBLE"   },
    { i: 8,  job: jobCognizant,  status: "INTERVIEW",   tag: "ELIGIBLE"   },

    // Divya Reddy (MBA)
    { i: 9,  job: jobCognizant,  status: "SHORTLISTED", tag: "ELIGIBLE"   },

    // Aditya Kumar
    { i: 10, job: jobInfosys,    status: "APPLIED",     tag: "ELIGIBLE"   },
    { i: 10, job: jobWipro,      status: "APPLIED",     tag: "ELIGIBLE"   },
    { i: 10, job: jobPersistent, status: "INTERVIEW",   tag: "ELIGIBLE"   },

    // Pooja Gupta
    { i: 11, job: jobTCS,        status: "APPLIED",     tag: "ELIGIBLE"   },
    { i: 11, job: jobCognizant,  status: "APPLIED",     tag: "ELIGIBLE"   },
  ];

  // Round label by status
  const currentRoundFor = (status) => {
    if (status === "APPLIED")     return { step: 1, name: "Resume Screening" };
    if (status === "SHORTLISTED") return { step: 2, name: "Technical Interview" };
    if (status === "INTERVIEW")   return { step: 3, name: "HR Interview" };
    return                               { step: 4, name: "Offer / Decision" };
  };

  const applicationDocs = APP_PLAN.map(({ i, job, status, tag, rejectionReason, feedback }) => {
    const su = studentUsers[i];
    const sp = studentProfiles[i];
    const el = job.eligibility;

    const isPlaced = status === "HIRED" || status === "SELECTED";

    const doc = {
      _id:              oid(),
      appId:            genCode("APP"),
      jobId:            job._id,
      studentId:        su._id,
      studentProfileId: sp._id,

      // ── Eligibility snapshot frozen at apply-time
      eligibilitySnapshot: {
        cgpa:           sp.cgpa,
        backlogs:       sp.backlogs,
        department:     sp.department,
        graduationYear: sp.graduationYear,
        xthMarks:       sp.xthMarks,
        xIIthMarks:     sp.xIIthMarks,
        resumeUrl:      sp.resume.url,
        isEligible:     tag !== "INELIGIBLE",
      },

      // ── Auto screening
      autoScreeningTag: tag,
      screeningDetails: {
        cgpaPass:       sp.cgpa           >= el.minCgpa,
        backlogPass:    sp.backlogs       <= el.maxBacklogs,
        departmentPass: el.allowedDepartments.includes(sp.department),
        batchPass:      el.targetBatch.includes(sp.graduationYear),
        xthPass:        sp.xthMarks       >= el.minXthMarks,
        xIIthPass:      sp.xIIthMarks     >= el.minXIIthMarks,
        skillsMatch:   ["Java", "Python"].slice(0, ri(1, 2)),
        skillsMissing: tag === "BORDERLINE" ? ["C++"] : [],
      },

      // ── Status & rounds
      status,
      currentRound:  currentRoundFor(status),
      roundResults:  status !== "APPLIED" ? [
        { step: 1, name: "Resume Screening", result: "PASSED", note: "Profile matches all criteria.",        updatedAt: ago(5) },
        ...(["INTERVIEW", "SELECTED", "HIRED", "SHORTLISTED"].includes(status)
          ? [{ step: 2, name: "Technical Assessment", result: "PASSED", note: "Cleared cut-off score.", updatedAt: ago(3) }]
          : []),
      ] : [],
      adminComments: status === "SHORTLISTED" ? "Strong profile. Shortlisted for tech round." :
                     status === "INTERVIEW"   ? "Cleared screening. Scheduled for HR." : "",

      // ── Rejection (optional)
      ...(rejectionReason ? { rejectionReason }                    : {}),
      ...(feedback        ? { feedbackForStudent: feedback }       : {}),

      // ── Offer (only for SELECTED / HIRED)
      ...(isPlaced ? {
        offerDetails: {
          packageLPA:     job.packageLPA,
          offerLetterUrl: `https://storage.mespune.in/offers/${genCode("OFR")}.pdf`,
          joiningDate:    from(60),
          offerStatus:    status === "HIRED" ? "ACCEPTED" : "PENDING",
          responseDeadline: from(10),
        },
      } : {}),

      // ── History trail
      history: [
        { status: "APPLIED",  updatedBy: su._id,           timestamp: ago(8), comment: "Application submitted by student." },
        ...(status !== "APPLIED" ? [{
          status,
          updatedBy: adminUsers[0]._id,
          timestamp: ago(ri(1, 4)),
          comment:   `Status updated to ${status} by TPO.`,
        }] : []),
      ],

      createdAt: ago(8),
      updatedAt: ago(ri(1, 5)),
    };

    return doc;
  });

  await db.collection("applications").insertMany(applicationDocs);
  console.log(`✅  Inserted ${applicationDocs.length} applications`);

  // ── Update denormalised stats on each job ────────────────────────────────
  for (const job of jobDocs) {
    const jApps = applicationDocs.filter((a) => a.jobId.equals(job._id));
    await db.collection("jobs").updateOne({ _id: job._id }, {
      $set: {
        "stats.totalApplications": jApps.length,
        "stats.eligible":          jApps.filter((a) => a.autoScreeningTag === "ELIGIBLE").length,
        "stats.borderline":        jApps.filter((a) => a.autoScreeningTag === "BORDERLINE").length,
        "stats.ineligible":        jApps.filter((a) => a.autoScreeningTag === "INELIGIBLE").length,
        "stats.shortlisted":       jApps.filter((a) => a.status === "SHORTLISTED").length,
        "stats.selected":          jApps.filter((a) => a.status === "SELECTED").length,
        "stats.hired":             jApps.filter((a) => a.status === "HIRED").length,
      },
    });
  }
  console.log("✅  Job stats updated");

  // ════════════════════════════════════════════════════════════════
  //  7. NOTIFICATIONS
  // ════════════════════════════════════════════════════════════════

  const notifDocs = [];

  // Shortlisted / Interview / Selected / Hired → high priority alert
  applicationDocs
    .filter((a) => ["SHORTLISTED", "INTERVIEW", "SELECTED", "HIRED"].includes(a.status))
    .forEach((a) => {
      const job = jobDocs.find((j) => j._id.equals(a.jobId));
      notifDocs.push({
        _id:              oid(),
        notificationCode: genCode("NOTI"),
        userId:           a.studentId,
        type:             "APPLICATION_SHORTLISTED",
        title:            "You've been shortlisted! 🎉",
        message:          `Your application for ${job.title} at ${job.company.name} has been moved forward. Check the drive timeline for next steps.`,
        link:             { entityType: "APPLICATION", entityId: a._id },
        isRead:           false,
        priority:         "HIGH",
        expiresAt:        from(60),
        createdAt:        ago(3),
        updatedAt:        ago(3),
      });
    });

  // Rejected → normal priority
  applicationDocs
    .filter((a) => a.status === "REJECTED")
    .forEach((a) => {
      const job = jobDocs.find((j) => j._id.equals(a.jobId));
      notifDocs.push({
        _id:              oid(),
        notificationCode: genCode("NOTI"),
        userId:           a.studentId,
        type:             "APPLICATION_REJECTED",
        title:            "Application Update",
        message:          `Your application for ${job.title} at ${job.company.name} was not taken forward at this stage. View feedback on your applications page.`,
        link:             { entityType: "APPLICATION", entityId: a._id },
        isRead:           false,
        priority:         "NORMAL",
        expiresAt:        from(60),
        createdAt:        ago(4),
        updatedAt:        ago(4),
      });
    });

  // New job alert for all students — Persistent Systems (latest drive)
  studentUsers.forEach((su) => {
    notifDocs.push({
      _id:              oid(),
      notificationCode: genCode("NOTI"),
      userId:           su._id,
      type:             "NEW_JOB_POSTED",
      title:            "New Drive: Persistent Systems",
      message:          "A new Intern + PPO opportunity at Persistent Systems is open. ₹25,000/month stipend. Deadline in 12 days — don't miss it!",
      link:             { entityType: "JOB", entityId: jobPersistent._id },
      isRead:           Math.random() > 0.6,
      priority:         "NORMAL",
      expiresAt:        from(60),
      createdAt:        ago(2),
      updatedAt:        ago(2),
    });
  });

  // Profile incomplete reminder for low completeness students
  studentProfiles
    .filter((sp) => sp.profileCompleteness < 75)
    .forEach((sp) => {
      notifDocs.push({
        _id:              oid(),
        notificationCode: genCode("NOTI"),
        userId:           sp.userId,
        type:             "PROFILE_INCOMPLETE_REMINDER",
        title:            "Complete your profile to apply",
        message:          `Your profile is ${sp.profileCompleteness}% complete. Several companies require a minimum of 70% completeness to apply. Add your resume and projects to unlock more drives.`,
        link:             { entityType: "PROFILE", entityId: sp._id },
        isRead:           false,
        priority:         "HIGH",
        expiresAt:        from(30),
        createdAt:        ago(1),
        updatedAt:        ago(1),
      });
    });

  await db.collection("notifications").insertMany(notifDocs);
  console.log(`✅  Inserted ${notifDocs.length} notifications`);

  // ════════════════════════════════════════════════════════════════
  //  8. AUDIT LOGS
  // ════════════════════════════════════════════════════════════════

  const auditDocs = [
    // Super admin created admin accounts
    { actorId: superAdmin._id,    action: "ADMIN_CREATED",               targetType: "AdminProfile",  targetId: adminProfiles[0]._id, metadata: { email: adminUsers[0].email, role: "ADMIN" } },
    { actorId: superAdmin._id,    action: "ADMIN_CREATED",               targetType: "AdminProfile",  targetId: adminProfiles[1]._id, metadata: { email: adminUsers[1].email, role: "ADMIN" } },
    // Admin created jobs
    { actorId: adminUsers[0]._id, action: "JOB_CREATED",                 targetType: "Job",           targetId: jobTCS._id,           metadata: { title: jobTCS.title,        company: "TCS" } },
    { actorId: adminUsers[0]._id, action: "JOB_CREATED",                 targetType: "Job",           targetId: jobInfosys._id,       metadata: { title: jobInfosys.title,    company: "Infosys" } },
    { actorId: adminUsers[0]._id, action: "JOB_CREATED",                 targetType: "Job",           targetId: jobWipro._id,         metadata: { title: jobWipro.title,      company: "Wipro" } },
    { actorId: adminUsers[0]._id, action: "JOB_CREATED",                 targetType: "Job",           targetId: jobKPIT._id,          metadata: { title: jobKPIT.title,       company: "KPIT" } },
    { actorId: adminUsers[0]._id, action: "JOB_CREATED",                 targetType: "Job",           targetId: jobPersistent._id,    metadata: { title: jobPersistent.title, company: "Persistent" } },
    // Admin updated application statuses
    { actorId: adminUsers[0]._id, action: "APPLICATION_STATUS_UPDATED",  targetType: "Application",   targetId: applicationDocs.find(a => a.status === "HIRED" && a.jobId.equals(jobTCS._id))?._id,     metadata: { from: "SHORTLISTED", to: "HIRED",       studentEmail: "anjali.singh@mespune.in" } },
    { actorId: adminUsers[0]._id, action: "APPLICATION_STATUS_UPDATED",  targetType: "Application",   targetId: applicationDocs.find(a => a.status === "HIRED" && a.jobId.equals(jobInfosys._id))?._id, metadata: { from: "SHORTLISTED", to: "HIRED",       studentEmail: "priya.patel@mespune.in" } },
    { actorId: adminUsers[1]._id, action: "APPLICATION_STATUS_UPDATED",  targetType: "Application",   targetId: applicationDocs.find(a => a.status === "REJECTED")?._id,                               metadata: { from: "APPLIED",     to: "REJECTED",    reason: "FAILED_TECHNICAL_INTERVIEW" } },
    // Admin added skills
    { actorId: adminUsers[1]._id, action: "SKILL_ADDED",                 targetType: "Skill",         targetId: skillDocs[0]._id,    metadata: { name: "JavaScript",     category: "Language" } },
    { actorId: adminUsers[1]._id, action: "SKILL_ADDED",                 targetType: "Skill",         targetId: skillDocs[18]._id,   metadata: { name: "Network Security",category: "Cybersecurity" } },
    // Admin reviewed a profile
    { actorId: adminUsers[0]._id, action: "STUDENT_PROFILE_REVIEWED",    targetType: "StudentProfile", targetId: studentProfiles[7]._id, metadata: { studentName: "Anjali Singh", note: "Reviewed before shortlisting for TCS." } },
    { actorId: adminUsers[0]._id, action: "STUDENT_PROFILE_REVIEWED",    targetType: "StudentProfile", targetId: studentProfiles[1]._id, metadata: { studentName: "Priya Patel",  note: "Reviewed before shortlisting for Infosys." } },
  ].map((log) => ({
    _id:       oid(),
    auditCode: genCode("AUD"),
    ...log,
    createdAt: ago(ri(1, 9)),
    updatedAt: ago(ri(1, 9)),
  }));

  await db.collection("auditlogs").insertMany(auditDocs);
  console.log(`✅  Inserted ${auditDocs.length} audit logs`);

  // ════════════════════════════════════════════════════════════════
  //  SUMMARY
  // ════════════════════════════════════════════════════════════════

  const W = 62;
  const line  = "═".repeat(W);
  const dline = "─".repeat(W);
  const pad   = (s, n) => s + " ".repeat(Math.max(0, n - s.length));

  console.log("\n" + line);
  console.log("  🌱  SEED COMPLETE — MES Pune Placement Portal");
  console.log(line);
  console.log(`  Password for ALL accounts : ${PASSWORD}`);
  console.log(dline);
  console.log("  SUPER ADMIN");
  console.log(`    superadmin@mespune.in`);
  console.log(dline);
  console.log("  ADMINS");
  adminUsers.forEach((u) => console.log(`    ${u.email}`));
  console.log(dline);
  console.log("  STUDENTS                               CGPA   STATUS");
  studentUsers.forEach((u, i) => {
    const sp = studentProfiles[i];
    console.log(`    ${pad(u.email, 40)} ${sp.cgpa}   ${sp.placementStatus}`);
  });
  console.log(dline);
  console.log("  JOBS");
  jobDocs.forEach((j) => {
    const s = applicationDocs.filter((a) => a.jobId.equals(j._id)).length;
    console.log(`    ${pad(j.company.name, 36)} ${pad(j.title, 26)}  ${s} apps`);
  });
  console.log(line);

  await mongoose.disconnect();
  console.log("🔌  Disconnected. Done.\n");
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});