import React, { useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  User,
  LogOut,
  Menu,
  Bell,
  Search,
  Sun,
  Moon,
} from "lucide-react";

// Hooks
import { useAuth } from "@/features/auth/hooks/useAuth.js";
import { useStudentProfile } from "@/features/student/hooks/useStudent.js";
import { useTheme } from "@/shared/components/ThemeProvider.jsx"; // <--- Import Theme Hook

// UI Components
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/sheet";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";

// --- Configuration ---
const NAV_ITEMS = [
  { label: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
  { label: "Jobs", path: "/student/jobs", icon: Briefcase },
  { label: "Applications", path: "/student/applications", icon: FileText },
  { label: "Profile", path: "/student/profile", icon: User },
];

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const { profile: studentProfileData } = useStudentProfile();
  const { setTheme, theme } = useTheme(); // <--- Use Theme Hook

  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Helper to get initials safely
  const getInitials = () => {
    if (!studentProfileData) return "ST";
    const profile = studentProfileData.data || studentProfileData;
    const first = profile?.firstName || user?.name?.split(" ")[0] || "S";
    const last = profile?.lastName || user?.name?.split(" ")[1] || "T";
    return `${first[0]}${last[0]}`.toUpperCase();
  };

  const getFullName = () => {
    const profile = studentProfileData?.data || studentProfileData;
    if (profile?.firstName) return `${profile.firstName} ${profile.lastName}`;
    return user?.name || "Student User";
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card/50 border-r border-border/60">
      {/* --- BRAND SECTION --- */}
      {/* Added h-16, px-6 to center it properly like the header */}
      <div className="h-16 flex items-center px-6 border-b border-border/60">
        <div onClick={()=>navigate("/")} className="flex items-center cursor-default ">
          {/* Logo Icon */}
          <div className="relative flex items-center justify-center text-2xl text-primary rounded-md shadow-sm">
            <span className="font-['Outfit'] font-bold text-2xl">C</span>
          </div>

          {/* Logo Text - Using 'Outfit' font */}
          <div className="flex items-baseline font-['Outfit'] font-bold text-2xl tracking-tight text-foreground">
            rux
            {/* Subtle Dot Accent */}
            <span className="w-1.5 h-1.5 rounded-full bg-primary ml-1 animate-pulse" />
          </div>
        </div>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="flex-1 py-6 px-3 space-y-1 font-['Plus_Jakarta_Sans']">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) => `
              group relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring
              ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }
            `}
            >
              <item.icon
                className={`h-[18px] w-[18px] transition-colors ${
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
              {/* Added tracking-wide for better legibility on small text */}
              <span className="tracking-wide">{item.label}</span>

              {/* Active Indicator Line (Optional aesthetic touch) */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground/20 rounded-r-full" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* --- USER INFO --- */}
      <div className="p-4 border-t border-border/60 bg-background/30 font-['Plus_Jakarta_Sans']">
        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-card transition-colors cursor-pointer group">
          <Avatar className="h-9 w-9 border border-border rounded-md shadow-sm transition-transform group-hover:scale-105">
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold rounded-md text-xs">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate leading-none">
              {getFullName()}
            </p>
            <p className="text-[11px] font-medium text-muted-foreground truncate mt-1">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-muted/10 flex font-sans text-foreground">
      {/* --- Desktop Sidebar --- */}
      <aside className="hidden lg:block w-52 border-r border-border/60 bg-background sticky top-0 h-screen z-30">
        <SidebarContent />
      </aside>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col min-w-0 bg-background/50 relative">
        {/* Background Texture */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] opacity-50"></div>

        {/* Top Header */}
        <header className="h-16 border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
          {/* Left: Mobile Toggle & Breadcrumb */}
          <div className="flex items-center gap-4">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-9 w-9 rounded-md"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="p-0 w-72 border-r border-border/60"
              >
                <SidebarContent />
              </SheetContent>
            </Sheet>

            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Student</span>
              <span className="text-border">/</span>
              <span>
                {NAV_ITEMS.find((i) => i.path === location.pathname)?.label ||
                  "Overview"}
              </span>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex max-w-sm w-full mx-4">
            <div className="relative w-full group">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search jobs..."
                className="pl-9 h-9 bg-muted/30 border-transparent focus:bg-background focus:border-input transition-all rounded-md"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* 1. THEME TOGGLE BUTTON */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {/* This animation rotates the sun/moon based on class presence */}
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Notification Bell */}
            <Button
              variant="ghost"
              onClick={()=>{navigate("notifications")}}
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-accent text-muted-foreground relative"
            >
              <Bell  className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-background"></span>
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-xl p-0 hover:bg-accent/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <Avatar className="h-8 w-8 rounded-md">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold rounded-md">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-background border-border"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {getFullName()}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate("/student/profile")}
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/student/applications")}
                  className="cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>My Applications</span>
                  <Badge
                    variant="secondary"
                    className="ml-auto text-xs h-5 px-1.5"
                  >
                    3
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-[1600px] mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
