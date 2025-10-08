
'use client';

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

export default function LoginPage() {
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd handle authentication here.
    // For now, we'll just navigate to the dashboard.
    window.location.href = '/dashboard';
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-background">
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
                defaultValue="login@gmail.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required defaultValue="12345" />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
