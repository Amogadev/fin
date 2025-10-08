"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Settings,
  Receipt,
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

  const getPageTitle = () => {
    if (pathname.includes('/users/new')) return 'Register User';
    if (pathname.match(/\/users\/user\d+$/)) return 'User Details';
    if (pathname.includes('/apply')) return 'Loan Application';
    if (pathname.includes('/verify')) return 'Verify Identity';
    return pathname.split("/").pop()?.replace("-", " ") || "Dashboard";
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between p-4 border-b bg-card">
        <h2 className="text-lg font-semibold font-headline capitalize">
          {getPageTitle()}
        </h2>
        <div className="flex items-center gap-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://picsum.photos/seed/admin/100" />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
          <Button asChild variant="ghost" size="icon">
            <Link href="/">
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Link>
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
