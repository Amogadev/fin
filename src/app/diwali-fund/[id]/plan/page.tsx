
"use client";

import { useState, useMemo, useEffect, use } from "react";
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
import type { User, Loan } from "@/lib/data";
import { getUserById } from "@/lib/data";

const CONTRIBUTION_AMOUNTS = [100, 1000, 5000];
const FREQUENCIES = ["வாராந்திர", "மாதாந்திர"];
const DIWALI_DATE = new Date(new Date().getFullYear(), 10, 1); // Approx. Nov 1st

export default function DiwaliFundPlanPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const { id: userId } = use(paramsPromise);
  const router = useRouter();
  const { toast } = useToast();
  
  const [user, setUser] = useState<User | null| undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [contribution, setContribution] = useState<number | undefined>();
  const [frequency, setFrequency] = useState<"வாராந்திர" | "மாதாந்திர" | undefined>();
  
  useEffect(() => {
    getUserById(userId).then(setUser);
  }, [userId]);


  const numberOfPayments = useMemo(() => {
    if (!frequency) return 0;
    const now = new Date();
    if (frequency === 'வாராந்திர') {
        return differenceInWeeks(DIWALI_DATE, now);
    } else { // Monthly
        return differenceInMonths(DIWALI_DATE, now);
    }
  }, [frequency]);
  
  const totalContribution = useMemo(() => {
    if (!contribution || !numberOfPayments) return 0;
    return contribution * numberOfPayments;
  }, [contribution, numberOfPayments]);


  const estimatedReturn = useMemo(() => {
    if (!totalContribution) return 0;
    return totalContribution * 1.10; // 10% bonus
  }, [totalContribution]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contribution || !frequency || !user) {
      toast({
        variant: "destructive",
        title: "முழுமையற்ற தகவல்",
        description: "பங்களிப்புத் திட்டத்தைத் தேர்ந்தெடுக்கவும்.",
      });
      return;
    }

    setIsSubmitting(true);
    
    const nextPaymentDate = frequency === 'வாராந்திர' ? addWeeks(new Date(), 1) : addMonths(new Date(), 1);
    const createdAt = new Date();

    const allUsersJson = localStorage.getItem('temp_new_users');
    const allUsers: User[] = allUsersJson ? JSON.parse(allUsersJson) : [];
    
    const allLoansJson = localStorage.getItem('temp_new_loans');
    const allLoans: Record<string, Loan[]> = allLoansJson ? JSON.parse(allLoansJson) : {};
    
    const userIndex = allUsers.findIndex(u => u.id === userId);
    if(userIndex === -1) {
        toast({ variant: "destructive", title: "பயனர் கிடைக்கவில்லை!" });
        setIsSubmitting(false);
        return;
    }

    const newLoanId = `diwali${user.id}${Date.now().toString().slice(-3)}`;
    const newTxnId = `txn${Date.now().toString().slice(-5)}`;

    const newFundLoan: Loan = {
        id: newLoanId,
        userId: user.id,
        amountRequested: totalContribution,
        interest: totalContribution * 0.10,
        principal: 0, // No disbursement
        totalOwed: totalContribution, // This is the savings goal
        amountRepaid: contribution, // First contribution is made now
        status: 'Active',
        loanType: 'Diwali Fund',
        paymentFrequency: (frequency as 'Weekly' | 'Monthly'),
        createdAt: createdAt.toISOString(),
        dueDate: nextPaymentDate.toISOString(),
        transactions: [
            {
                id: newTxnId,
                loanId: newLoanId,
                type: 'Repayment', // Contribution is like a repayment to their own fund
                amount: contribution,
                date: createdAt.toISOString(),
            }
        ]
    };
    
    if (!allLoans[user.id]) {
      allLoans[user.id] = [];
    }
    allLoans[user.id].push(newFundLoan);
    
    allUsers[userIndex].loans.push(newFundLoan);

    // Simulate submission
    setTimeout(() => {
      localStorage.setItem('temp_new_users', JSON.stringify(allUsers));
      localStorage.setItem('temp_new_loans', JSON.stringify(allLoans));

      const confirmationDetails = {
        name: user.name,
        contribution,
        frequency,
        estimatedReturn,
        nextPaymentDate: nextPaymentDate.toISOString(),
      }
      localStorage.setItem('diwali_fund_confirmation', JSON.stringify(confirmationDetails));
      
      toast({
        title: "வெற்றிகரமாக சேர்ந்தீர்கள்!",
        description: `தீபாவளி நிதிக்கு வரவேற்கிறோம், ${user.name}!`,
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
        title="தீபாவளி நிதியில் சேரவும்"
        description={`படி 2: ${user.name} க்கான பங்களிப்புத் திட்டத்தைத் தேர்ந்தெடுக்கவும்.`}
      />
      
      <form onSubmit={handleSubmit} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>பங்களிப்புத் திட்டம்</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>பங்களிப்புத் தொகை</Label>
                            <Select value={contribution?.toString()} onValueChange={(val) => setContribution(Number(val))}>
                                <SelectTrigger><SelectValue placeholder="தொகையைத் தேர்ந்தெடுக்கவும்" /></SelectTrigger>
                                <SelectContent>
                                    {CONTRIBUTION_AMOUNTS.map(amount => (
                                        <SelectItem key={amount} value={amount.toString()}>₹{amount.toLocaleString('en-IN')}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>கால இடைவெளி</Label>
                            <Select value={frequency} onValueChange={(val: "வாராந்திர" | "மாதாந்திர") => setFrequency(val)}>
                                <SelectTrigger><SelectValue placeholder="கால இடைவெளியைத் தேர்ந்தெடுக்கவும்" /></SelectTrigger>
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
                <AlertTitle>இது எப்படி வேலை செய்கிறது</AlertTitle>
                <AlertDescription>
                ₹100, ₹1,000, அல்லது ₹5,000 வாராந்திரம் அல்லது மாதாந்திரம் சேமித்து, தீபாவளி அன்று <span className="font-bold text-primary">+10% போனஸ்</span> பெறுங்கள். முன்கூட்டியே எடுத்தால் உங்கள் மொத்த சேமிப்பில் 10% கழிக்கப்படும்.
                </AlertDescription>
            </Alert>
            <Card className="bg-primary text-primary-foreground">
                <CardHeader>
                    <CardTitle>மதிப்பிடப்பட்ட தீபாவளி வருமானம்</CardTitle>
                    <CardDescription className="text-primary-foreground/80">உங்கள் மொத்த பங்களிப்பு மற்றும் உங்கள் 10% போனஸ்.</CardDescription>
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
                சேர்க்கப்படுகிறது...
              </>
            ) : (
              "இப்போது சேரவும்"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
