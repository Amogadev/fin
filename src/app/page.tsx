
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
import { useState } from 'react';

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the OTP
    console.log(`Sending OTP to ${phoneNumber}`);
    setStep('otp');
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm mx-auto shadow-2xl">
        <CardHeader className="text-center">
          <div className="mb-4 inline-block mx-auto">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-headline">Admin Login</CardTitle>
          <CardDescription>
            {step === 'phone'
              ? 'Enter your phone number to receive a verification code.'
              : `Enter the code sent to ${phoneNumber}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
              >
                Send Code
              </Button>
            </form>
          ) : (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  required
                />
              </div>
              <Button
                asChild
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Link href="/dashboard">Verify & Login</Link>
              </Button>
              <Button variant="link" size="sm" onClick={() => setStep('phone')}>
                Use a different phone number
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
