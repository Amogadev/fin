
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/logo';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd handle authentication here.
    // For now, we'll just navigate to the dashboard.
    window.location.href = '/dashboard';
  };

  return (
    <main className="grid min-h-screen">
      <div className="flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm mx-auto shadow-2xl">
          <CardHeader className="text-center">
            <div className="mb-4 inline-block mx-auto">
              <Logo />
            </div>
            <CardTitle className="text-xl font-headline">நிர்வாகி உள்நுழைவு</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLoginSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">மின்னஞ்சல்</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div className="grid gap-2 relative">
                <Label htmlFor="password">கடவுச்சொல்</Label>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
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
                  <span className="sr-only">
                    {showPassword ? 'கடவுச்சொல்லை மறை' : 'கடவுச்சொல்லைக் காட்டு'}
                  </span>
                </Button>
              </div>
              <Button type="submit" className="w-full">
                உள்நுழைக
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
