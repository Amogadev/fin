
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, use } from "react";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Settings,
  Receipt,
  Bell,
} from "lucide-react";
import { getAllTransactions } from "@/lib/data";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TransactionWithUser } from "@/lib/data";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [transactionsPromise, setTransactionsPromise] = useState<Promise<TransactionWithUser[]>>();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setTransactionsPromise(getAllTransactions());
  }, [pathname]); // Refetch on path change

  const transactions = transactionsPromise ? use(transactionsPromise) : [];


  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/users", label: "Users", icon: Users },
    { href: "/dashboard/transactions", label: "Transactions", icon: Receipt },
  ];
  
  const notificationCount = isClient ? transactions.length : 0;

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
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {notificationCount}
                  </span>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 bg-notification-popover text-notification-popover-foreground"
            >
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {transactions && transactions.length > 0 ? (
                transactions.map((tx) => (
                  <DropdownMenuItem key={tx.id} className="flex flex-col items-start gap-1">
                    <p className="font-semibold">{tx.userName}</p>
                    <p className="text-xs text-muted-foreground">{tx.type} of ₹{tx.amount}</p>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No new notifications.
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24">{children}</main>
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 h-20 bg-card border rounded-full shadow-lg overflow-hidden">
        <div className="flex justify-around items-center h-full max-w-lg mx-auto px-4">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex flex-col items-center justify-center gap-1 w-20 h-full transition-colors text-muted-foreground hover:text-accent-foreground/80`}
              >
                <Settings className="h-6 w-6" />
                <span className="text-xs">Settings</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="center"
              className="mb-2"
            >
              <DropdownMenuItem asChild>
                <Link href="/">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </div>
  );
}
