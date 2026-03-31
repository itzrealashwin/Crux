import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check, Menu, X, ArrowRight, ShieldCheck, Users, BarChart3,
  Briefcase, Sun, Moon, Quote, ArrowUpRight, Zap, Clock,
  TrendingUp, ChevronRight, MoveRight,
} from "lucide-react";
import { Button } from "@/shared/ui/button.jsx";
import { Card, CardContent, CardTitle, CardHeader } from "@/shared/ui/card.jsx";
import { Badge } from "@/shared/ui/badge.jsx";
import InfiniteGridHero from "@/shared/components/infinite-grid-hero.jsx";
import { useTheme } from "@/shared/components/ThemeProvider.jsx";
import { useAuth } from "@/features/auth/hooks/useAuth.js";

/* ─── Font & animation styles ───────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  .font-body     { font-family: 'DM Sans', sans-serif; }
  .font-mono-alt { font-family: 'JetBrains Mono', monospace; }

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .anim-fade-up { animation: fade-up 0.55s cubic-bezier(.22,1,.36,1) both; }
  .anim-fade-in { animation: fade-in 0.4s ease both; }
  .d1 { animation-delay: 0.05s; }
  .d2 { animation-delay: 0.15s; }
  .d3 { animation-delay: 0.28s; }
  .d4 { animation-delay: 0.42s; }
  .d5 { animation-delay: 0.56s; }

  .nav-link { position: relative; }
  .nav-link::after {
    content: '';
    position: absolute;
    left: 0; bottom: -2px;
    width: 100%; height: 1px;
    background: currentColor;
    transform: scaleX(0); transform-origin: right;
    transition: transform 0.22s ease;
  }
  .nav-link:hover::after { transform: scaleX(1); transform-origin: left; }

  .feat-card { transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease; }
  .feat-card:hover { transform: translateY(-2px); box-shadow: 0 12px 32px -8px hsl(var(--primary)/0.12); border-color: hsl(var(--primary)/0.35) !important; }

  .step-connector { position: relative; }
  .step-connector:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 19px; top: 42px;
    width: 2px; height: calc(100% - 4px);
    background: linear-gradient(to bottom, hsl(var(--border)), transparent);
  }

  .testimonial-card { transition: border-color 0.18s ease; }
  .testimonial-card:hover { border-color: hsl(var(--primary)/0.3); }

  .stat-num { font-variant-numeric: tabular-nums; }
`;

/* ─── Data ───────────────────────────────────────────────────── */
const STATS = [
  { value: "2,000+", label: "Student profiles", icon: Users },
  { value: "94%",    label: "Less manual work",  icon: Zap },
  { value: "3×",     label: "Faster cycles",     icon: Clock },
  { value: "100%",   label: "Live tracking",     icon: TrendingUp },
];

const STEPS = [
  { n: "01", title: "Officers post jobs", desc: "Set eligibility, salary, and deadlines. The system enforces them automatically." },
  { n: "02", title: "Students build profiles", desc: "One-time setup of academics, resume, and skills. No re-entering per company." },
  { n: "03", title: "Eligibility auto-checked", desc: "Only qualified students can apply. Manual shortlisting is eliminated." },
  { n: "04", title: "Outcomes tracked live", desc: "Both sides see every status update in real time — no chasing emails." },
];

const TESTIMONIALS = [
  {
    quote: "We processed 400 applications for a single drive in under two hours. What used to take three days now runs itself.",
    author: "Placement Coordinator",
    role: "Engineering College, Pune",
    color: "hsl(var(--primary)/0.65)",
    initial: "P",
  },
  {
    quote: "I can see exactly which companies I'm eligible for and track every application without chasing anyone for updates.",
    author: "Final Year Student",
    role: "Computer Engineering",
    color: "#7C9EB2",
    initial: "S",
  },
  {
    quote: "The analytics dashboard alone justified switching. Department-wise placement stats ready in minutes for the board.",
    author: "HOD, CSE Department",
    role: "Faculty Member",
    color: "#B2917C",
    initial: "H",
  },
];

/* ══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { setTheme, theme } = useTheme();
  const { user } = useAuth();

  const isLoggedIn = !!user?.data;
  const handleAuthAction = () => navigate(isLoggedIn ? "/student/dashboard" : "/login");
  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setIsMenuOpen(false); };

  return (
    <div className="font-body min-h-screen bg-background text-foreground flex flex-col">
      <style>{STYLES}</style>

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">

          {/* ✅ Original logo — preserved exactly */}
          <div onClick={() => navigate("/")} className="flex items-center cursor-pointer">
            <div className="relative flex items-center justify-center text-4xl text-primary rounded-md shadow-sm">
              <span className="font-['Outfit'] font-bold text-4xl">C</span>
            </div>
            <div className="flex items-baseline font-['Outfit'] font-bold text-4xl tracking-tight text-foreground">
              rux
              <span className="w-1.5 h-1.5 rounded-full bg-primary ml-1 animate-pulse" />
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {["features", "how-it-works", "testimonials"].map((id) => (
              <button key={id} onClick={() => scrollTo(id)}
                className="nav-link text-muted-foreground hover:text-foreground transition-colors capitalize">
                {id.replace("-", " ")}
              </button>
            ))}
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all">
              <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </button>
            <Button size="sm" onClick={handleAuthAction} className="gap-1.5 px-5 h-8 text-xs font-medium">
              {isLoggedIn ? "Dashboard" : "Get Started"}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </nav>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 text-muted-foreground" onClick={() => setIsMenuOpen(v => !v)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 pb-4 pt-3 anim-fade-in">
            <nav className="flex flex-col gap-1 text-sm">
              {["features", "how-it-works", "testimonials"].map((id) => (
                <button key={id} onClick={() => scrollTo(id)}
                  className="text-left py-2.5 px-3 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors capitalize">
                  {id.replace("-", " ")}
                </button>
              ))}
              <div className="border-t border-border my-2" />
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-muted-foreground">Appearance</span>
                <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="h-8 w-8 rounded-full border border-border flex items-center justify-center">
                  {theme === "dark" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                </button>
              </div>
              <Button className="w-full mt-1" onClick={handleAuthAction}>
                {isLoggedIn ? "Go to Dashboard" : "Get Started"}
              </Button>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">

        {/* ══ SECTION 1 — HERO: Centered editorial ══════════════════ */}
        <InfiniteGridHero className="relative overflow-hidden bg-background pt-24 pb-28 md:pt-36 md:pb-40">
          <div className="container mx-auto px-4 md:px-8 relative z-10">
            <div className="max-w-3xl mx-auto flex flex-col items-center text-center">

              <div className="anim-fade-up d1 mb-7">
                <span className="inline-flex items-center gap-2 border border-border rounded-full px-4 py-1.5 font-mono-alt text-xs text-muted-foreground bg-background/80 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  Built for placement cells — not spreadsheets
                </span>
              </div>

              <h1 className="anim-fade-up d2 text-5xl md:text-[4.5rem] lg:text-[5.5rem] font-bold tracking-tighter leading-[1.04] text-foreground mb-6">
                From job posting<br className="hidden md:block" /> to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">
                  final offer.
                </span>
              </h1>

              <p className="anim-fade-up d3 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed mb-10">
                Crux replaces the chaos of spreadsheets and email threads with one
                structured platform your entire placement cell can rely on.
              </p>

              <div className="anim-fade-up d4 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Button size="lg" onClick={handleAuthAction}
                  className="h-12 px-8 gap-2 text-sm font-medium shadow-lg shadow-primary/20 w-full sm:w-auto">
                  {isLoggedIn ? "Go to Dashboard" : "Start for free"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => scrollTo("how-it-works")}
                  className="h-12 px-8 text-sm font-medium bg-transparent w-full sm:w-auto">
                  See how it works
                </Button>
              </div>

              <div className="anim-fade-up d5 mt-12 flex items-center gap-4">
                <div className="flex -space-x-2.5">
                  {["#E2C9A0","#A8BFCE","#C4B5C8","#B5C4A8"].map((bg, i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background flex items-center justify-center text-[9px] font-bold text-background"
                      style={{ background: bg }}>
                      {["PC","S","H","A"][i]}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Trusted by <span className="text-foreground font-medium">10+ colleges</span>
                </p>
              </div>
            </div>
          </div>
        </InfiniteGridHero>

        {/* ══ SECTION 2 — STATS: Full-bleed divided grid ════════════ */}
        <section className="border-y border-border bg-muted/20">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
            {STATS.map(({ value, label, icon: Icon }, i) => (
              <div key={i} className="px-8 py-10 flex flex-col gap-3 group cursor-default">
                <Icon className="h-4 w-4 text-primary/50 group-hover:text-primary transition-colors" />
                <div className="flex items-end gap-1.5">
                  <span className="stat-num text-4xl md:text-5xl font-bold tracking-tighter text-foreground leading-none">
                    {value}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-primary mb-1 opacity-0 group-hover:opacity-100 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ SECTION 3 — FEATURES: Bento grid ═════════════════════ */}
        <section id="features" className="py-24 md:py-32 bg-background">
          <div className="container mx-auto px-4 md:px-8">

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
              <div>
                <p className="font-mono-alt text-xs text-primary tracking-widest uppercase mb-3">Features</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground leading-tight">
                  Everything a placement cell<br className="hidden md:block" /> actually needs.
                </h2>
              </div>
              <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                No bloat. No training required. Just the core workflows that get
                students placed and coordinators out of their inboxes.
              </p>
            </div>

            {/* Bento grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Wide card */}
              <div className="feat-card md:col-span-2 border border-border rounded-2xl p-8 bg-card group cursor-default relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-7">
                    <div className="h-11 w-11 rounded-xl border border-border bg-muted flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-colors">
                      <Briefcase className="h-5 w-5 text-foreground/60 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="font-mono-alt text-[10px] text-muted-foreground border border-border rounded-full px-2.5 py-1">Core</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Structured Job Postings</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-md text-sm">
                    Define salary, eligibility, and deadlines once. Rules are enforced at apply-time —
                    no manual gatekeeping, no missed exceptions.
                  </p>
                  <div className="mt-8 rounded-xl border border-border bg-background/60 p-4 space-y-2">
                    {[["Software Engineer Intern","₹6 LPA","CGPA ≥ 7.5"],["Full Stack Developer","₹8 LPA","No active backlogs"],["Data Analyst","₹7 LPA","CSE / IT only"]].map(([role,pkg,rule]) => (
                      <div key={role} className="flex items-center justify-between text-xs py-1.5 border-b border-border/50 last:border-0">
                        <span className="font-medium text-foreground">{role}</span>
                        <span className="text-primary font-mono-alt">{pkg}</span>
                        <span className="text-muted-foreground hidden sm:block">{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <BentoCard icon={ShieldCheck} title="Auto-Eligibility Engine" tag="Automation"
                desc="CGPA, backlog limits, and branch rules checked instantly. Students only see jobs they qualify for." />

              <BentoCard icon={Users} title="Unified Student Profiles" tag="Profiles"
                desc="Academics, skills, and resume in one verified record. No re-entering data per company." />

              {/* Wide card */}
              <div className="feat-card md:col-span-2 border border-border rounded-2xl p-8 bg-card group cursor-default relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-bl from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-7">
                    <div className="h-11 w-11 rounded-xl border border-border bg-muted flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-colors">
                      <BarChart3 className="h-5 w-5 text-foreground/60 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="font-mono-alt text-[10px] text-muted-foreground border border-border rounded-full px-2.5 py-1">Analytics</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Placement Analytics</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-md text-sm">
                    Track placement rates by branch, batch, and company. Present data to the board
                    without building a single report manually.
                  </p>
                  <div className="mt-8 flex items-end gap-2 h-20">
                    {[55,72,48,88,65,95,78].map((h,i) => (
                      <div key={i} className="flex-1 rounded-t-sm bg-primary/15 relative" style={{ height: `${h}%` }}>
                        <div className="absolute bottom-0 left-0 right-0 rounded-t-sm bg-primary/50 group-hover:bg-primary/70 transition-colors"
                          style={{ height: `${h * 0.45}%` }} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    {["Aug","Sep","Oct","Nov","Dec","Jan","Feb"].map(m => (
                      <span key={m} className="font-mono-alt text-[9px] text-muted-foreground flex-1 text-center">{m}</span>
                    ))}
                  </div>
                </div>
              </div>

              <BentoCard icon={Check} title="Live Application Tracking" tag="Transparency"
                desc="Applied → Shortlisted → Selected. One-click updates visible to everyone instantly." />
            </div>
          </div>
        </section>

        {/* ══ SECTION 4 — HOW IT WORKS: Steps + sticky dashboard ═══ */}
        <section id="how-it-works" className="py-24 md:py-32 bg-muted/20 border-t border-border">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

              <div>
                <p className="font-mono-alt text-xs text-primary tracking-widest uppercase mb-4">How it works</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground mb-12">
                  Four steps.<br />That's the whole workflow.
                </h2>
                <div className="space-y-0">
                  {STEPS.map(({ n, title, desc }, i) => (
                    <div key={i} className={`step-connector flex gap-5 pb-8 ${i === STEPS.length - 1 ? 'pb-0' : ''}`}>
                      <div className="flex-shrink-0 h-10 w-10 rounded-full border-2 border-border bg-background flex items-center justify-center z-10">
                        <span className="font-mono-alt text-xs text-muted-foreground">{n}</span>
                      </div>
                      <div className="pt-1.5">
                        <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sticky mock dashboard */}
              <div className="lg:sticky lg:top-24">
                <div className="rounded-2xl border border-border bg-card shadow-xl shadow-black/5 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                    {["#FF5F57","#FEBC2E","#28C840"].map(c => (
                      <div key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
                    ))}
                    <div className="flex-1 ml-3 h-5 rounded bg-border/50 font-mono-alt text-[10px] text-muted-foreground flex items-center px-3">
                      crux.place / admin / dashboard
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {[["42","Open Roles"],["386","Applicants"],["91%","Eligible"]].map(([v,l]) => (
                        <div key={l} className="bg-muted/40 rounded-xl p-3.5">
                          <div className="text-2xl font-bold text-foreground leading-none mb-1">{v}</div>
                          <div className="font-mono-alt text-[10px] text-muted-foreground">{l}</div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl border border-border overflow-hidden">
                      <div className="grid grid-cols-3 px-3 py-2 bg-muted/30 font-mono-alt text-[10px] text-muted-foreground uppercase tracking-wide">
                        <span>Company</span><span>Role</span><span>Status</span>
                      </div>
                      {[
                        ["Infosys","SDE Intern","Shortlisted","text-yellow-500 dark:text-yellow-400"],
                        ["TCS Digital","Full Stack","Applied","text-blue-500"],
                        ["Persistent","Backend Eng.","Selected","text-green-500"],
                        ["Wipro","Systems Eng.","Applied","text-blue-500"],
                      ].map(([co,role,status,color]) => (
                        <div key={co} className="grid grid-cols-3 px-3 py-2.5 border-t border-border text-xs items-center hover:bg-muted/20 transition-colors">
                          <span className="font-medium text-foreground">{co}</span>
                          <span className="text-muted-foreground">{role}</span>
                          <span className={`font-mono-alt text-[10px] font-medium ${color}`}>{status}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="font-mono-alt text-[10px] text-muted-foreground uppercase tracking-wide">Recent Activity</p>
                      {[
                        ["Riya S. applied to Infosys","2m ago"],
                        ["Arjun K. shortlisted for TCS","15m ago"],
                        ["New drive: Wipro Systems","1h ago"],
                      ].map(([event,time]) => (
                        <div key={event} className="flex items-center justify-between text-xs py-1.5 border-b border-border/40 last:border-0">
                          <span className="text-foreground/70">{event}</span>
                          <span className="font-mono-alt text-[10px] text-muted-foreground ml-4 flex-shrink-0">{time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ SECTION 5 — TESTIMONIALS: Staggered offset cards ═════ */}
        <section id="testimonials" className="py-24 md:py-32 bg-background border-t border-border">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
              <div>
                <p className="font-mono-alt text-xs text-primary tracking-widest uppercase mb-3">Testimonials</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground">
                  Real feedback from<br className="hidden md:block" /> real placement teams.
                </h2>
              </div>
              <Button variant="ghost" size="sm" onClick={handleAuthAction}
                className="self-start gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                Join them <MoveRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:items-start">
              {TESTIMONIALS.map(({ quote, author, role, color, initial }, i) => (
                <div key={i}
                  className={`testimonial-card border border-border rounded-2xl p-7 bg-card flex flex-col justify-between
                    ${i === 1 ? 'md:mt-8' : ''}
                    ${i === 2 ? 'md:mt-4' : ''}
                  `}
                >
                  <div>
                    <Quote className="h-6 w-6 mb-5" style={{ color }} />
                    <p className="text-foreground/80 leading-relaxed text-[15px] italic">
                      "{quote}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-8 pt-6 border-t border-border">
                    <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: color }}>
                      {initial}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-none mb-1">{author}</p>
                      <p className="text-xs text-muted-foreground">{role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ SECTION 6 — CTA: Asymmetric split ════════════════════ */}
        <section className="border-t border-border bg-muted/20">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border py-20 md:py-28 gap-0">
              <div className="md:pr-16 pb-12 md:pb-0">
                <p className="font-mono-alt text-xs text-primary tracking-widest uppercase mb-6">Get started today</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground leading-tight mb-6">
                  Your placement cell deserves better than a spreadsheet.
                </h2>
                <p className="text-muted-foreground leading-relaxed max-w-sm">
                  Set up in minutes. No training required. Used by placement
                  coordinators who have better things to do than chase emails.
                </p>
              </div>
              <div className="md:pl-16 pt-12 md:pt-0 flex flex-col justify-center gap-6">
                <div className="space-y-3">
                  {["Free to get started","No credit card required","Works for any college size"].map(item => (
                    <div key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" onClick={handleAuthAction}
                    className="h-12 px-8 gap-2 text-sm font-medium shadow-lg shadow-primary/20">
                    {isLoggedIn ? "Go to Dashboard" : "Start for free"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => scrollTo("features")}
                    className="h-12 px-8 text-sm font-medium bg-transparent">
                    View features
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-background py-14">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2">
              {/* ✅ Original logo in footer */}
              <div className="flex items-center mb-4 cursor-default">
                <div className="relative flex items-center justify-center text-2xl text-primary rounded-md">
                  <span className="font-['Outfit'] font-bold text-2xl">C</span>
                </div>
                <div className="flex items-baseline font-['Outfit'] font-bold text-2xl tracking-tight text-foreground">
                  rux
                  <span className="w-1 h-1 rounded-full bg-primary ml-1 animate-pulse" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                A placement management system for colleges that have outgrown spreadsheets.
                Structured, transparent, and fast.
              </p>
            </div>

            <div>
              <h4 className="font-mono-alt text-xs uppercase tracking-widest text-muted-foreground mb-5">Product</h4>
              <ul className="space-y-3 text-sm">
                {[["Home","#"],["Features","#features"],["How It Works","#how-it-works"]].map(([label,href]) => (
                  <li key={label}>
                    <a href={href} className="text-muted-foreground hover:text-foreground transition-colors">{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-mono-alt text-xs uppercase tracking-widest text-muted-foreground mb-5">Support</h4>
              <ul className="space-y-3 text-sm">
                {["Contact","Privacy Policy","Terms of Service"].map(l => (
                  <li key={l}>
                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">© 2025 Project Crux. All rights reserved.</p>
            <p className="font-mono-alt text-xs text-muted-foreground">v1.0.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Reusable small bento card ─────────────────────────────── */
function BentoCard({ icon: Icon, title, tag, desc }) {
  return (
    <div className="feat-card border border-border rounded-2xl p-7 bg-card group cursor-default">
      <div className="flex items-start justify-between mb-6">
        <div className="h-10 w-10 rounded-xl border border-border bg-muted flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-colors">
          <Icon className="h-[18px] w-[18px] text-foreground/60 group-hover:text-primary transition-colors" />
        </div>
        <span className="font-mono-alt text-[10px] text-muted-foreground border border-border rounded-full px-2.5 py-1">{tag}</span>
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}