"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  Users,
  Trash2,
  Menu,
  X,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Map,
  BarChart3,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "@/providers/theme-provider";
import { cn } from "@/utils/cn";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/drivers", label: "Drivers", icon: Truck },
  { href: "/dashboard/residents", label: "Residents", icon: Users },
  { href: "/dashboard/collections", label: "Waste Collection", icon: Trash2 },
  { href: "/dashboard/route-management", label: "Route Management", icon: Map },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    auth.checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.logout();
      toast.success("Logged out successfully.");
      router.push("/login");
    } catch {
      toast.error("Logout failed.");
    }
  };

  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 1) {
      return [{ label: "Dashboard", href: undefined, active: true }];
    }

    return segments.map((seg, idx) => {
      const href = "/" + segments.slice(0, idx + 1).join("/");
      const label = seg.charAt(0).toUpperCase() + seg.slice(1);
      const isLast = idx === segments.length - 1;

      return {
        label: label === "Dashboard" ? "Dashboard" : label.replace("-", " "),
        href: isLast ? undefined : href,
        active: isLast,
      };
    });
  };

  return (
    <div className="relative min-h-screen flex bg-background transition-colors duration-300">
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-sidebar-border bg-sidebar-bg backdrop-blur-md transition-all duration-300 z-30",
          isSidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2 overflow-hidden">
            <img src="/logo_new.png" className="h-19 w-8.5 object-contain shrink-0" alt="Green City Logo" />
            {!isSidebarCollapsed && (
              <span className="text-[20px] font-black uppercase tracking-tight text-foreground whitespace-nowrap">
                Green <span className="text-primary-green">City</span>
              </span>
            )}
          </div>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1 rounded-full text-muted-text hover:bg-muted-bg hover:text-foreground cursor-pointer"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-3 rounded-full text-[14.5px] font-bold transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-primary-green text-white shadow-md shadow-primary-green/10"
                      : "text-muted-text hover:bg-muted-bg hover:text-foreground"
                  )}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border flex flex-col gap-3">
          <div
            onClick={() => router.push("/dashboard/settings?focus=profile")}
            className={cn(
              "flex items-center gap-3 cursor-pointer hover:bg-muted-bg/50 p-1.5 rounded-2xl transition-all duration-300",
              isSidebarCollapsed && "justify-center"
            )}
            title="View Profile Settings"
          >
            <img
              src={auth.user?.profilePic || "https://res.cloudinary.com/dfgkfyldd/image/upload/v1784293764/ChatGPT_Image_Jun_21_2026_12_32_07_AM_o0o1d3.png"}
              className="h-11 w-11 rounded-full object-cover shrink-0 border border-primary-green/20"
              alt="Admin Avatar"
            />
            {!isSidebarCollapsed && (
              <div className="overflow-hidden min-w-0">
                <h5 className="text-[14.5px] font-bold text-foreground truncate">
                  {auth.user?.name || "Council Admin"}
                </h5>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-3.5 py-3 rounded-full text-[13px] font-bold text-red-500 hover:bg-red-500/5 hover:text-red-600 transition duration-200 w-full cursor-pointer",
              isSidebarCollapsed && "justify-center"
            )}
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-background/50 backdrop-blur-sm"
          />
          <aside className="relative flex flex-col w-64 max-w-xs bg-sidebar-bg border-r border-sidebar-border z-10 p-4">
            <div className="flex items-center justify-between pb-4 border-b border-sidebar-border mb-4">
              <div className="flex items-center gap-2">
                <img src="/logo_new.png" className="h-8.5 w-8.5 object-contain shrink-0" alt="Green City Logo" />
                <span className="text-[13px] font-black uppercase tracking-wider text-foreground">
                  Green <span className="text-primary-green">City</span>
                </span>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1 rounded-full text-muted-text hover:bg-muted-bg hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-3 px-4 py-3.5 rounded-full text-[14.5px] font-bold transition-all cursor-pointer",
                        isActive
                          ? "bg-primary-green text-white shadow-md"
                          : "text-muted-text hover:bg-muted-bg hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4.5 w-4.5" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-sidebar-border flex flex-col gap-3">
              <div
                onClick={() => {
                  setIsMobileOpen(false);
                  router.push("/dashboard/settings?focus=profile");
                }}
                className="flex items-center gap-3 cursor-pointer hover:bg-muted-bg/50 p-1.5 rounded-2xl transition-all duration-300"
              >
                <img
                  src={auth.user?.profilePic || "https://images..com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80"}
                  className="h-11 w-11 rounded-full object-cover shrink-0 border border-primary-green/20"
                  alt="Admin Avatar"
                />
                <div>
                  <h5 className="text-[14.5px] font-bold text-foreground">
                    {auth.user?.name || "Council Admin"}
                  </h5>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3.5 rounded-full text-[13px] font-bold text-red-500 hover:bg-red-500/5 transition w-full cursor-pointer"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen bg-muted-bg transition-colors duration-300">
        
        <header className="h-16 border-b border-sidebar-border bg-sidebar-bg dark:bg-sidebar-bg/60 dark:backdrop-blur-md flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-20">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-1 rounded-full text-muted-text hover:bg-muted-bg hover:text-foreground md:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            <nav className="hidden sm:flex items-center gap-1.5 text-[13px] font-bold text-muted-text uppercase tracking-wider">
              {getBreadcrumbs().map((b, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span>/</span>}
                  {b.href ? (
                    <Link href={b.href} className="hover:text-primary-green">
                      {b.label}
                    </Link>
                  ) : (
                    <span className="text-foreground">{b.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-card-border bg-card-bg text-muted-text hover:text-foreground hover:bg-muted-bg/50 transition cursor-pointer"
              aria-label="Toggle light/dark theme"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </button>

            <img
              onClick={() => router.push("/dashboard/settings?focus=profile")}
              src={auth.user?.profilePic || "https://images..com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80"}
              className="h-9 w-9 rounded-full object-cover border border-primary-green/20 sm:hidden cursor-pointer"
              alt="Admin Avatar"
            />
          </div>

        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

    </div>
  );
}
