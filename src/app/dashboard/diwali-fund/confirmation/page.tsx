
"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, PartyPopper } from 'lucide-react';
import { format } from 'date-fns';

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const name = searchParams.get('name');
  const contribution = searchParams.get('contribution');
  const frequency = searchParams.get('frequency');
  const estimatedReturn = searchParams.get('estimatedReturn');
  const nextPaymentDate = searchParams.get('nextPaymentDate');

  // A simple check to see if we have the necessary data.
  // In a real app, you might want a more robust solution.
  if (!name || !contribution || !frequency) {
      if (typeof window !== 'undefined') {
          router.replace('/dashboard/diwali-fund');
      }
      return null;
  }

  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <Card className="w-full max-w-lg mx-auto shadow-lg">
            <CardHeader className="text-center items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                    <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl font-headline">உறுதிப்படுத்தல்</CardTitle>
                <CardDescription>
                    வாழ்த்துக்கள், {name}! நீங்கள் தீபாவளி சேமிப்புத் திட்டத்தில் வெற்றிகரமாக சேர்ந்துவிட்டீர்கள்.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 border rounded-lg bg-muted/50 space-y-3 text-sm">
                    <h3 className="font-semibold mb-2">உங்கள் திட்டத்தின் சுருக்கம்</h3>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">பங்களிப்பு:</span>
                        <span className="font-medium">₹{Number(contribution).toLocaleString('en-IN')} / {frequency.endsWith('ly') ? frequency.slice(0, -2) : frequency}</span>
                    </div>
                    {nextPaymentDate && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">அடுத்த செலுத்த வேண்டிய தேதி:</span>
                            <span className="font-medium">{format(new Date(nextPaymentDate), 'PPP')}</span>
                        </div>
                    )}
                    {estimatedReturn && (
                         <div className="flex justify-between text-base font-semibold text-primary">
                            <span>மதிப்பிடப்பட்ட தீபாவளி வருமானம்:</span>
                            <span>₹{Number(estimatedReturn).toLocaleString('en-IN')}</span>
                        </div>
                    )}
                </div>
                <div className="text-center text-muted-foreground text-xs">
                    உங்கள் கொடுப்பனவுகளுக்கான நினைவூட்டல்களைப் பெறுவீர்கள். நினைவிருக்கட்டும், முன்கூட்டியே எடுத்தால் 10% கழிக்கப்படும்.
                </div>
                <Button asChild className="w-full" size="lg">
                    <Link href="/dashboard">
                        <PartyPopper className="mr-2 h-4 w-4" />
                        முகப்புக்குத் திரும்பு
                    </Link>
                </Button>
            </CardContent>
        </Card>
    </main>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">உங்கள் உறுதிப்படுத்தல் ஏற்றப்படுகிறது...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
