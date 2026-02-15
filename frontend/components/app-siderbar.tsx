"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/profile/dashboard" },
    { name: "Profile", href: "/profile/create" },
    { name: "History", href: "/profile/history" },
      { name: "Appointments", href: "/profile/appointment/create" },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-4 font-semibold text-lg">My App</div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <div className="flex flex-col gap-1 p-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm transition ${
                    isActive ? "bg-primary text-white" : "hover:bg-muted"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4 text-xs text-muted-foreground">© 2026</div>
      </SidebarFooter>
    </Sidebar>
  );
}
