"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Settings,
  Receipt,
  Bell,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/users", label: "Users", icon: Users },
    { href: "/dashboard/transactions", label: "Transactions", icon: Receipt },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between p-4 border-b bg-card">
        <div>
          <p className="text-sm text-muted-foreground">Welcome Back!</p>
          <h2 className="text-2xl font-bold font-headline">Hi.</h2>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-6 w-6" />
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              6
            </span>
            <span className="sr-only">Notifications</span>
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24">{children}</main>
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-auto mx-auto">
        <div className="bg-foreground text-background rounded-full shadow-lg p-2 flex items-center gap-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-center h-12 w-12 rounded-full transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-primary-foreground"
                }`}
              >
                <item.icon className="h-6 w-6" />
                <span className="sr-only">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
