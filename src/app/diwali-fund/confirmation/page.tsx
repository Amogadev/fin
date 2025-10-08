
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, PartyPopper } from 'lucide-react';
import { format } from 'date-fns';

interface FundDetails {
    name: string;
    contribution: number;
    frequency: string;
    estimatedReturn: number;
    nextPaymentDate: string;
}

export default function ConfirmationPage() {
    const router = useRouter();
    const [details, setDetails] = useState<FundDetails | null>(null);

    useEffect(() => {
        const storedDetails = localStorage.getItem('diwali_fund_confirmation');
        if (storedDetails) {
            setDetails(JSON.parse(storedDetails));
            // Optional: clear the item after reading to prevent re-displaying
            // localStorage.removeItem('diwali_fund_confirmation');
        } else {
            // Redirect if no details are found
            router.push('/dashboard');
        }
    }, [router]);

    if (!details) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading your confirmation...</p>
            </div>
        );
    }

    return (
        <main className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
            <Card className="w-full max-w-lg mx-auto shadow-lg">
                <CardHeader className="text-center items-center">
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                        <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-2xl font-headline">Confirmation</CardTitle>
                    <CardDescription>
                        Congratulations, {details.name}! You've successfully joined the Diwali Fund.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 border rounded-lg bg-muted/50 space-y-3 text-sm">
                        <h3 className="font-semibold mb-2">Your Plan Summary</h3>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Contribution:</span>
                            <span className="font-medium">₹{details.contribution.toLocaleString('en-IN')} / {details.frequency.slice(0, -2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Next Payment Due:</span>
                            <span className="font-medium">{format(new Date(details.nextPaymentDate), 'PPP')}</span>
                        </div>
                        <div className="flex justify-between text-base font-semibold text-primary">
                            <span>Estimated Diwali Return:</span>
                            <span>₹{Math.round(details.estimatedReturn).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                    <div className="text-center text-muted-foreground text-xs">
                        You will receive reminders for your payments. Remember, early withdrawal will incur a 10% deduction.
                    </div>
                    <Button asChild className="w-full" size="lg">
                        <Link href="/dashboard">
                            <PartyPopper className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
}
