
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Settings,
  Receipt,
  Moon,
  Sun,
  FileText,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";


function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }
  }, []);

  const toggleTheme = (isDarkMode: boolean) => {
    const newTheme = isDarkMode ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
     <div className="flex items-center space-x-2 px-2 py-1.5" onClick={(e) => { e.stopPropagation(); }}>
      <Label htmlFor="dark-mode-switch" className="flex items-center gap-2 text-sm cursor-pointer">
        {theme === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        <span>இருண்ட பயன்முறை</span>
      </Label>
      <Switch
        id="dark-mode-switch"
        checked={theme === 'dark'}
        onCheckedChange={toggleTheme}
      />
    </div>
  )
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { href: "/dashboard", label: "முகப்பு", icon: LayoutDashboard },
    { href: "/dashboard/users", label: "பயனர்கள்", icon: Users },
    { href: "/dashboard/transactions", label: "பரிவர்த்தனைகள்", icon: Receipt },
    { href: "/dashboard/reports", label: "அறிக்கைகள்", icon: FileText },
    { id: "settings", label: "அமைப்புகள்", icon: Settings },
  ];

  const showBackButton = pathname !== "/dashboard";

  return (
    <div className="flex flex-col min-h-screen bg-muted/40 dark:bg-background">
      <header className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-4">
           {showBackButton && (
             <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">பின்செல்</span>
              </Button>
           )}
          <div>
            <p className="text-sm text-muted-foreground">மீண்டும் வருக!</p>
            <h2 className="text-2xl font-bold font-headline">வணக்கம்.</h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                அறிக்கைகள்
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/reports?tab=loans">கடன்</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/reports?tab=funds">தீபாவளி சேமிப்புத் திட்டம்</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24">{children}</main>
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 h-20 bg-card border rounded-full shadow-lg overflow-hidden">
        <div className="flex justify-around items-center h-full max-w-lg mx-auto px-2">
          {menuItems.map((item) => {
            if ('id' in item && item.id === 'settings') {
                return (
                    <div key={item.id} className="flex flex-col items-center justify-center gap-1 h-full px-4 text-muted-foreground">
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                            className="flex flex-col items-center justify-center gap-1 h-full w-full transition-colors hover:text-accent-foreground/80"
                            >
                            <item.icon className="h-6 w-6" />
                            <span className="text-xs text-center w-full">{item.label}</span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            side="top"
                            align="center"
                            className="mb-2"
                        >
                            <div onMouseDown={(e) => e.preventDefault()}>
                            <ThemeToggle />
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                            <Link href="/">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>வெளியேறு</span>
                            </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            }
            
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href!}
                className={`flex flex-col items-center justify-center gap-1 h-full transition-colors px-4 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-accent-foreground/80"
                }`}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs text-center w-full">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

