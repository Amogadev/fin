
"use client";

import { useState, use, useMemo, useEffect } from "react";
import { useRouter, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PageHeader from "@/components/page-header";
import { Loader2, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { differenceInWeeks, differenceInMonths, addWeeks, addMonths } from 'date-fns';
import type { User } from "@/lib/data";
import { getUserById } from "@/lib/data";

const CONTRIBUTION_AMOUNTS = [100, 1000, 5000];
const FREQUENCIES = ["Weekly", "Monthly"];
const DIWALI_DATE = new Date(new Date().getFullYear(), 10, 1); // Approx. Nov 1st

export default function DiwaliFundPlanPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const { id: userId } = use(paramsPromise);
  const router = useRouter();
  const { toast } = useToast();
  
  const [user, setUser] = useState<User | null| undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [contribution, setContribution] = useState<number | undefined>();
  const [frequency, setFrequency] = useState<string | undefined>();
  
  useEffect(() => {
    getUserById(userId).then(setUser);
  }, [userId]);


  const numberOfPayments = useMemo(() => {
    if (!frequency) return 0;
    const now = new Date();
    if (frequency === 'Weekly') {
        return differenceInWeeks(DIWALI_DATE, now);
    } else { // Monthly
        return differenceInMonths(DIWALI_DATE, now);
    }
  }, [frequency]);

  const estimatedReturn = useMemo(() => {
    if (!contribution || !numberOfPayments) return 0;
    return contribution * numberOfPayments * 1.10;
  }, [contribution, numberOfPayments]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contribution || !frequency || !user) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a contribution plan.",
      });
      return;
    }

    setIsSubmitting(true);
    
    const nextPaymentDate = frequency === 'Weekly' ? addWeeks(new Date(), 1) : addMonths(new Date(), 1);

    const fundDetails = {
      name: user.name,
      contribution,
      frequency,
      estimatedReturn,
      nextPaymentDate: nextPaymentDate.toISOString(),
    };

    // Simulate submission
    setTimeout(() => {
      localStorage.setItem('diwali_fund_confirmation', JSON.stringify(fundDetails));
      
      toast({
        title: "Successfully Joined!",
        description: `Welcome to the Diwali Fund, ${user.name}!`,
      });
      
      router.push(`/diwali-fund/confirmation`);

      setIsSubmitting(false);
    }, 1000);
  };
  
  if (user === undefined) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }
  
  if (user === null) {
      notFound();
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Join the Diwali Fund"
        description={`Step 2: Choose a contribution plan for ${user.name}.`}
      />
      
      <form onSubmit={handleSubmit} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Contribution Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Contribution Amount</Label>
                            <Select value={contribution?.toString()} onValueChange={(val) => setContribution(Number(val))}>
                                <SelectTrigger><SelectValue placeholder="Select amount" /></SelectTrigger>
                                <SelectContent>
                                    {CONTRIBUTION_AMOUNTS.map(amount => (
                                        <SelectItem key={amount} value={amount.toString()}>₹{amount.toLocaleString('en-IN')}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Frequency</Label>
                            <Select value={frequency} onValueChange={setFrequency}>
                                <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                                <SelectContent>
                                    {FREQUENCIES.map(freq => (
                                        <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

        <div className="space-y-8">
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>How it Works</AlertTitle>
                <AlertDescription>
                    Save ₹100, ₹1,000, or ₹5,000 weekly or monthly and receive a <span className="font-bold text-primary">+10% bonus</span> at Diwali. Early withdrawal will incur a 10% deduction on your total saved amount.
                </AlertDescription>
            </Alert>
            <Card className="bg-primary text-primary-foreground">
                <CardHeader>
                    <CardTitle>Estimated Diwali Return</CardTitle>
                    <CardDescription className="text-primary-foreground/80">Your total contribution plus your 10% bonus.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">₹{Math.round(estimatedReturn).toLocaleString('en-IN')}</p>
                </CardContent>
            </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={isSubmitting || !contribution || !frequency}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              "Join Now"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
