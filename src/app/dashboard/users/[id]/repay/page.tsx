
"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Loan, User } from "@/lib/data";
import { getUserById } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export default function RepayLoanPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const { id: userId } = use(paramsPromise);
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  const [selectedLoanId, setSelectedLoanId] = useState<string | undefined>();
  const [repaymentAmount, setRepaymentAmount] = useState(0);

  useState(() => {
    async function loadUser() {
      const userData = await getUserById(userId);
      setUser(userData || null);
      const activeLoan = userData?.loans.find(l => l.status === 'Active' || l.status === 'Overdue');
      if (activeLoan) {
        setSelectedLoanId(activeLoan.id);
      }
    }
    loadUser();
  });

  const selectedLoan = user?.loans.find(l => l.id === selectedLoanId);
  const remainingBalance = selectedLoan ? selectedLoan.totalOwed - selectedLoan.amountRepaid : 0;

  const handleRepayment = async () => {
    if (!selectedLoan || repaymentAmount <= 0) {
      toast({
        variant: "destructive",
        title: "தவறான திருப்பிச் செலுத்துதல்",
        description: "దయచేసి ఒక кредитуను ఎంచుకుని, చెల్లుబాటు అయ్యే మొత్తాన్ని నమోదు చేయండి.",
      });
      return;
    }

    if (repaymentAmount > remainingBalance) {
      toast({
        variant: "destructive",
        title: "தவறான தொகை",
        description: `திருப்பிச் செலுத்தும் தொகை மீதமுள்ள இருப்பை விட அதிகமாக இருக்கக்கூடாது ₹${remainingBalance.toLocaleString('en-IN')}.`,
      });
      return;
    }
    
    // In a real app, you'd have a proper backend call here.
    // We'll simulate by updating localStorage.
    const tempUsersJson = localStorage.getItem('temp_new_users');
    const tempLoansJson = localStorage.getItem('temp_new_loans');
    let users = tempUsersJson ? JSON.parse(tempUsersJson) : [];
    let allLoans = tempLoansJson ? JSON.parse(tempLoansJson) : {};

    const userIndex = users.findIndex((u:User) => u.id === userId);
    const loanList = allLoans[userId] || [];
    const loanIndex = loanList.findIndex((l:Loan) => l.id === selectedLoanId);

    if (loanIndex > -1) {
        loanList[loanIndex].amountRepaid += repaymentAmount;

        const newRemaining = loanList[loanIndex].totalOwed - loanList[loanIndex].amountRepaid;
        if (newRemaining <= 0) {
            loanList[loanIndex].status = 'Paid';
        }

        const newTxnId = `txn${Date.now().toString().slice(-5)}`;
        loanList[loanIndex].transactions.push({
            id: newTxnId,
            loanId: selectedLoanId,
            type: 'Repayment',
            amount: repaymentAmount,
            date: new Date().toISOString(),
        });

        allLoans[userId] = loanList;
        if(userIndex > -1) {
            users[userIndex].loans = loanList;
        }

        localStorage.setItem('temp_new_users', JSON.stringify(users));
        localStorage.setItem('temp_new_loans', JSON.stringify(allLoans));
        
        toast({
            title: "திருப்பிச் செலுத்துதல் வெற்றி",
            description: `₹${repaymentAmount.toLocaleString('en-IN')} கடன் ${selectedLoanId} க்காக செலுத்தப்பட்டது.`,
        });

        router.push(`/dashboard/users/${userId}`);
    } else {
        toast({
            variant: "destructive",
            title: "கடன் கிடைக்கவில்லை",
            description: "திருப்பிச் செலுத்துதலைச் செயல்படுத்த முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.",
        });
    }

  };

  const activeLoans = user?.loans.filter(l => l.status === 'Active' || l.status === 'Overdue');

  return (
    <div className="space-y-6">
      <PageHeader title="கடன் திருப்பிச் செலுத்துதல்">
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/users/${userId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            பயனர் விவரங்களுக்கு திரும்ப
          </Link>
        </Button>
      </PageHeader>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>திருப்பிச் செலுத்துதலைச் சமர்ப்பிக்கவும்</CardTitle>
          <CardDescription>
            ஒரு கடனைத் தேர்ந்தெடுத்து, திருப்பிச் செலுத்த வேண்டிய தொகையை உள்ளிடவும்.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            {!activeLoans || activeLoans.length === 0 ? (
                 <div className="text-center text-muted-foreground py-8">
                    <p>{user?.name} திருப்பிச் செலுத்த செயலில் கடன்கள் இல்லை.</p>
                </div>
            ) : (
                <>
                <div className="space-y-2">
                    <Label htmlFor="loan-select">கடன் தேர்ந்தெடுக்கவும்</Label>
                    <Select value={selectedLoanId} onValueChange={setSelectedLoanId}>
                    <SelectTrigger id="loan-select">
                        <SelectValue placeholder="செயலில் உள்ள கடனைத் தேர்ந்தெடுக்கவும்..." />
                    </SelectTrigger>
                    <SelectContent>
                        {activeLoans.map(loan => (
                        <SelectItem key={loan.id} value={loan.id}>
                            கடன் {loan.id} - (செலுத்த வேண்டியது: ₹{(loan.totalOwed - loan.amountRepaid).toLocaleString('en-IN')})
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>

                {selectedLoan && (
                    <div className="space-y-4 pt-4">
                         <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">மொத்த செலுத்த வேண்டியது:</span>
                                <span className="font-mono">₹{selectedLoan.totalOwed.toLocaleString('en-IN')}</span>
                            </div>
                             <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">திருப்பிச் செலுத்திய தொகை:</span>
                                <span className="font-mono">₹{selectedLoan.amountRepaid.toLocaleString('en-IN')}</span>
                            </div>
                             <div className="flex justify-between font-semibold text-base">
                                <span>மீதமுள்ள இருப்பு:</span>
                                <span className="font-mono">₹{remainingBalance.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="repayment-amount">திருப்பிச் செலுத்தும் தொகை</Label>
                             <div className="flex items-center gap-4">
                                <div className="flex-1 text-center">
                                    <div className="text-3xl font-bold tracking-tighter">
                                    ₹{repaymentAmount.toLocaleString("en-IN")}
                                    </div>
                                </div>
                            </div>
                            <Slider
                                id="repayment-amount"
                                min={0}
                                max={remainingBalance}
                                step={100}
                                value={[repaymentAmount]}
                                onValueChange={(value) => setRepaymentAmount(value[0])}
                                disabled={!selectedLoan}
                            />
                        </div>
                    </div>
                )}
                </>
            )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleRepayment} disabled={!selectedLoan || repaymentAmount <= 0} className="w-full" size="lg">
            திருப்பிச் செலுத்துதலைச் சமர்ப்பிக்கவும்
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
