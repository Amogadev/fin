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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  6
                </span>
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 bg-notification-popover text-notification-popover-foreground"
            >
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-2">
                <p className="text-sm font-semibold text-muted-foreground px-2 mb-2">
                  Upcoming Payments
                </p>
                <DropdownMenuItem className="flex flex-col items-start gap-1">
                  <p>
                    Anjali Sharma - EMI Due{" "}
                    <span className="font-bold">₹500</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Due in 3 days
                  </p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1">
                  <p>
                    Priya Singh - EMI Due{" "}
                    <span className="font-bold">₹1250</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Due in 5 days
                  </p>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <div className="p-2">
                <p className="text-sm font-semibold text-muted-foreground px-2 mb-2">
                  Pending
                </p>
                <DropdownMenuItem className="flex flex-col items-start gap-1">
                  <p>
                    Loan Application from Rohan Verma
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Amount: ₹25,000
                  </p>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24">{children}</main>
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 h-20 bg-card border rounded-full shadow-lg overflow-hidden">
        <div className="flex justify-around items-center h-full max-w-sm mx-auto px-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 w-20 h-full transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-accent-foreground/80"
                }`}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
