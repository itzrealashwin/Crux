import React, { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  Bell,
  Search,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";

// Hooks
import { useAuth } from "@/features/auth/hooks/useAuth.js";
import { useTheme } from "@/shared/components/ThemeProvider.jsx"; // Ensure this path is correct

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

// --- Configuration ---
const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Manage Jobs", path: "/admin/jobs", icon: Briefcase },
  { label: "Manage Students", path: "/admin/students", icon: Users },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { setTheme, theme } = useTheme();

  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Helper to get initials safely
  const getInitials = () => {
    const name = user?.name || "Admin User";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card/50">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-border/60">
        <div
          onClick={() => navigate("/")}
          className="flex items-center cursor-default "
        >
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

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 font-['Plus_Jakarta_Sans']">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) => `
                group relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 outline-none
                ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
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
              <span className="tracking-wide">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Admin User Info (Bottom) */}
      <div className="p-4 border-t border-border/60 bg-background/50">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-border rounded-md">
            <AvatarFallback className="bg-primary/10 text-primary font-bold rounded-md">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-foreground">
              {user?.name || "Administrator"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || "admin@crux.com"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/10 flex font-sans text-foreground">
      {/* --- Desktop Sidebar --- */}
      <aside className="hidden lg:block w-64 border-r border-border/60 bg-background sticky top-0 h-screen z-30">
        <SidebarContent />
      </aside>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col min-w-0 bg-background/50 relative">
        {/* Background Texture (Consistent with Student Layout) */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#9ca3af_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#6b7280_1px,transparent_1px)] opacity-60"></div>

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
              <span className="font-medium text-foreground">Admin Console</span>
              <span className="text-border">/</span>
              <span>
                {NAV_ITEMS.find((i) => location.pathname.startsWith(i.path))
                  ?.label || "Overview"}
              </span>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex max-w-sm w-full mx-4">
            <div className="relative w-full group">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search students, jobs..."
                className="pl-9 h-9 bg-muted/30 border-transparent focus:bg-background focus:border-input transition-all rounded-md"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Notification Bell */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-accent text-muted-foreground relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-background"></span>
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="pl-2 pr-1 h-9 rounded-md hover:bg-accent gap-2"
                >
                  <Avatar className="h-6 w-6 rounded-sm">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold rounded-sm">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium">
                    {getInitials()}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
                      {user?.name || "Admin"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate("/")}
                  className="cursor-pointer"
                >
                  Back to Website
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/admin/settings")}
                  className="cursor-pointer"
                >
                  Settings
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
          <Outlet />
        </main>
      </div>
    </div>
  );
}
