
"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, use } from "react";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Settings,
  Receipt,
  Moon,
  Sun,
  ChevronDown,
  ArrowLeft,
  CalendarDays,
  Gift,
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
import { format } from 'date-fns';
import { ta } from 'date-fns/locale';


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

function CurrentDate() {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>{format(date, 'PPP', { locale: ta })}</span>
        </div>
    );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get('source');

  const menuItems = [
    { href: "/dashboard", label: "முகப்பு", icon: LayoutDashboard },
    { href: "/dashboard/users", label: "கடன் விவரங்கள்", icon: Users },
    { href: "/dashboard/diwali-fund", label: "தீபாவளி சிட்", icon: Gift },
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
            <h2 className="text-2xl font-bold font-headline">வணக்கம்.</h2>
          </div>
        </div>
        <div>
            <CurrentDate />
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
            
            let isActive = false;
            if ('href' in item) {
                if (source === 'diwali-fund' && (item.href === '/dashboard/diwali-fund' || pathname.startsWith('/dashboard/users/'))) {
                    isActive = item.href === '/dashboard/diwali-fund';
                } else if (!source) {
                     isActive = pathname.startsWith(item.href);
                } else if (source !== 'diwali-fund' && item.href === '/dashboard/users') {
                    isActive = pathname.startsWith(item.href);
                }

                if (item.href === '/dashboard' && pathname !== '/dashboard') {
                    isActive = false;
                }
            }


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
