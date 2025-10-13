
"use client";

import { notFound, useRouter } from "next/navigation";
import { getUserById, type User, type Loan, getUsers } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";
import { IndianRupee, PlusCircle, ArrowLeft, Loader2, Save, CalendarIcon, History } from "lucide-react";
import { useEffect, useState, use } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

function LoanStatus({ loan }: { loan: Loan }) {
  const today = new Date();
  const dueDate = new Date(loan.dueDate);

  if (loan.status === 'Paid') {
    return <Badge variant="default">முழுமையாக செலுத்தப்பட்டது</Badge>;
  }

  if (loan.status === 'Overdue') {
    const daysOverdue = differenceInDays(today, dueDate);
    return (
      <Badge variant="destructive">
        {daysOverdue} நாள்{daysOverdue > 1 ? 'கள்' : ''} தாமதம் — பின்தொடரவும்
      </Badge>
    );
  }

  // Active
  return (
    <Badge variant="success" className="whitespace-nowrap">
      செயலில் உள்ளது — செலுத்த வேண்டிய நாள்: {format(dueDate, 'PP')}
    </Badge>
  );
}

function OutstandingPaymentCard({ user, onPaymentSaved }: { user: User, onPaymentSaved: () => void }) {
    const { toast } = useToast();
    const activeLoan = user.loans.find(loan => loan.status === 'Active' || loan.status === 'Overdue');
    
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async () => {
        if (!activeLoan) {
            toast({ variant: "destructive", title: "செயலில் கடன்கள் இல்லை" });
            return;
        }
        if (!amount || !date || Number(amount) <= 0) {
            toast({ variant: "destructive", title: "தவறான உள்ளீடு", description: "செல்லுபடியாகும் தொகை மற்றும் தேதியை உள்ளிடவும்." });
            return;
        }

        const repaymentAmount = Number(amount);
        const remainingBalance = activeLoan.totalOwed - activeLoan.amountRepaid;

        if (repaymentAmount > remainingBalance) {
            toast({ variant: "destructive", title: "அதிகப்படியான தொகை", description: `செலுத்தும் தொகை மீதமுள்ள இருப்பை விட அதிகமாக இருக்கக்கூடாது: ₹${remainingBalance.toLocaleString('en-IN')}` });
            return;
        }

        setIsSubmitting(true);
        
        const users = await getUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        
        if (userIndex !== -1) {
            const loanIndex = users[userIndex].loans.findIndex(l => l.id === activeLoan.id);
            if (loanIndex !== -1) {
                const loan = users[userIndex].loans[loanIndex];
                loan.amountRepaid += repaymentAmount;
                loan.transactions.push({
                    id: `txn${Date.now()}`,
                    loanId: loan.id,
                    type: 'Repayment',
                    amount: repaymentAmount,
                    date: date.toISOString(),
                });

                if (loan.amountRepaid >= loan.totalOwed) {
                    loan.status = 'Paid';
                } else if(loan.status === 'Overdue') {
                    loan.status = 'Active';
                }


                localStorage.setItem('temp_new_users', JSON.stringify(users));
                const tempLoansJson = localStorage.getItem('temp_new_loans');
                const tempLoans = tempLoansJson ? JSON.parse(tempLoansJson) : {};
                if (tempLoans[user.id]) {
                    const tempLoanIndex = tempLoans[user.id].findIndex((l:Loan) => l.id === activeLoan.id);
                    if(tempLoanIndex !== -1) {
                       tempLoans[user.id][tempLoanIndex] = loan;
                       localStorage.setItem('temp_new_loans', JSON.stringify(tempLoans));
                    }
                }

                toast({ title: "செலுத்துதல் சேமிக்கப்பட்டது!", description: `₹${repaymentAmount.toLocaleString('en-IN')} தொகை பதிவு செய்யப்பட்டது.` });
                setAmount('');
                setDate(new Date());
                onPaymentSaved();
            }
        } else {
             toast({ variant: "destructive", title: "பயனரைக் கண்டுபிடிக்க முடியவில்லை" });
        }
        
        setIsSubmitting(false);
    };

    if (!activeLoan) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>நிலுவையில் உள்ள தொகை</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">இந்த பயனருக்கு செயலில் கடன்கள் எதுவும் இல்லை.</p>
                </CardContent>
            </Card>
        )
    }
    
    const remainingBalance = activeLoan.totalOwed - activeLoan.amountRepaid;
    const repaymentHistory = activeLoan.transactions.filter(tx => tx.type === 'Repayment').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <Card>
            <CardHeader>
                <CardTitle>நிலுவையில் உள்ள தொகை</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted p-3 text-center">
                    <div>
                        <p className="text-xs text-muted-foreground">மொத்த கடன்</p>
                        <p className="text-xl font-bold">₹{activeLoan.totalOwed.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">மீதமுள்ள இருப்பு</p>
                        <p className="text-xl font-bold text-primary">₹{remainingBalance.toLocaleString('en-IN')}</p>
                    </div>
                </div>
                 <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label htmlFor="outstanding-amount" className="text-xs font-medium">செலுத்தும் தொகை</label>
                        <Input 
                            id="outstanding-amount"
                            type="number"
                            placeholder="தொகை"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="h-9"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="outstanding-date" className="text-xs font-medium">செலுத்தும் தேதி</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-full justify-start text-left font-normal h-9",
                                    !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PP") : <span>தேதி</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                 </div>
                 {repaymentHistory.length > 0 && (
                    <Collapsible>
                        <CollapsibleTrigger asChild>
                            <Button variant="link" className="p-0 text-sm h-auto">
                                <History className="mr-2 h-4 w-4" />
                                கட்டண வரலாற்றைக் காட்டு
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 space-y-2 animate-in fade-in-0">
                             <div className="p-3 rounded-md border bg-muted/50 max-h-32 overflow-y-auto">
                                <h4 className="font-semibold text-sm mb-2">கட்டண வரலாறு</h4>
                                <ul className="space-y-2">
                                    {repaymentHistory.map(tx => (
                                        <li key={tx.id} className="flex justify-between items-center text-sm">
                                            <span>{format(new Date(tx.date), 'PPP')}</span>
                                            <span className="font-mono">₹{tx.amount.toLocaleString('en-IN')}</span>
                                        </li>
                                    ))}
                                </ul>
                             </div>
                        </CollapsibleContent>
                    </Collapsible>
                 )}
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleSave} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    செலுத்துதலைச் சேமி
                </Button>
            </CardFooter>
        </Card>
    );
}


export default function UserDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(paramsPromise);
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const router = useRouter();

  const loadUser = async () => {
    let userData = await getUserById(id);
    if (userData) {
      const tempLoansJson = localStorage.getItem('temp_new_loans');
      if (tempLoansJson) {
          const tempLoans = JSON.parse(tempLoansJson);
          if (tempLoans[id]) {
              const existingLoanIds = new Set(userData.loans.map(l => l.id));
              const newLoans = tempLoans[id].filter((l: Loan) => !existingLoanIds.has(l.id));
              userData.loans = [...userData.loans, ...newLoans].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          }
      }
    }
    setUser(userData || null);
  }

  useEffect(() => {
    loadUser();
  }, [id]);

  if (user === undefined) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user === null) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader title={user.name} description={`பயனர் ஐடி: ${user.id}`}>
        <Button asChild variant="outline">
          <Link href="/dashboard/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            பயனர்கள் பக்கத்திற்குத் திரும்பு
          </Link>
        </Button>
      </PageHeader>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>பயனர் விவரங்கள்</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <Image
                  src={user.faceImageUrl}
                  alt={user.name}
                  width={128}
                  height={128}
                  className="rounded-full border-4 border-primary/20 shadow-lg object-cover"
                  data-ai-hint="person portrait"
                />
              </div>
              <div className="text-sm space-y-2">
                <p>
                  <strong>தொடர்பு எண்:</strong> {user.contact}
                </p>
                <p>
                  <strong>அடையாளச் சான்று:</strong> {user.idProof}
                </p>
                <p>
                  <strong>உறுப்பினர் ஆன நாள்:</strong>{" "}
                  {format(new Date(user.createdAt), "PPP")}
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button asChild>
                  <Link href={`/dashboard/users/${user.id}/apply`}>
                    <PlusCircle className="mr-2 h-4 w-4" /> கடன்/EMIக்கு விண்ணப்பிக்கவும்
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href={`/dashboard/users/${user.id}/repay`}>
                    <IndianRupee className="mr-2 h-4 w-4" /> கடனைத் திருப்பிச் செலுத்து
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
           <OutstandingPaymentCard user={user} onPaymentSaved={loadUser} />
          <Card>
            <CardHeader>
              <CardTitle>கடன் வரலாறு</CardTitle>
              <CardDescription>
                {user.name} எடுத்த அனைத்து கடன்கள் மற்றும் EMIகள்.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>கடன் ஐடி</TableHead>
                    <TableHead>தொகை</TableHead>
                    <TableHead>நிலை</TableHead>
                    <TableHead className="text-right">திருப்பிச் செலுத்தப்பட்டது</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.loans && user.loans.length > 0 ? (
                    user.loans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell className="font-mono">{loan.id}</TableCell>
                        <TableCell>
                          ₹{loan.totalOwed.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell>
                          <LoanStatus loan={loan} />
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{loan.amountRepaid.toLocaleString("en-IN")} / ₹
                          {loan.totalOwed.toLocaleString("en-IN")}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground h-24"
                      >
                        இன்னும் கடன்கள் எடுக்கப்படவில்லை.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

    

    