"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  User,
  History,
  CalendarPlus,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    {
      name: "Dashboard",
      href: "/profile/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
    },
    {
      name: "History",
      href: "/profile/history",
      icon: History,
    },
    {
      name: "Appointments",
      href: "/profile/appointment/create",
      icon: CalendarPlus,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-lg">Guidance System</p>
            <p className="text-xs text-muted-foreground">User Portal</p>
          </div>
        </div>
      </SidebarHeader>

      <Separator />

      <SidebarContent>
        <SidebarGroup>
          <div className="flex flex-col gap-1 p-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-3 space-y-3">
          <Separator />

          <div className="px-3 py-2">
            <p className="text-sm font-medium truncate">{user?.email}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role.toLowerCase()}
            </p>
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>

          <div className="px-3 pt-2 border-t">
            <p className="text-xs text-muted-foreground text-center">
              © Code by Andrewboi
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
