
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/logo';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd handle authentication here.
    // For now, we'll just navigate to the dashboard.
    window.location.href = '/dashboard';
  };

  return (
    <main className="grid md:grid-cols-2 min-h-screen">
      <div className="relative hidden md:block">
        <Image
            src="/finance.jpeg"
            alt="Financial background"
            layout="fill"
            objectFit="cover"
            data-ai-hint="finance abstract"
        />
      </div>
      <div className="flex items-center justify-center bg-muted p-4">
        <Card className="w-full max-w-sm mx-auto shadow-2xl">
          <CardHeader className="text-center">
            <div className="mb-4 inline-block mx-auto">
              <Logo />
            </div>
            <CardTitle className="text-2xl font-headline">Admin Login</CardTitle>
            
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLoginSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div className="grid gap-2 relative">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-7 h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                  <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                </Button>
              </div>
              <Button
                type="submit"
                className="w-full"
              >
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
