
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
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart, Cell } from "recharts";
import { useToast } from "@/hooks/use-toast";
import type { Loan } from "@/lib/data";
import { getUsers } from "@/lib/data";
import { addDays, addMonths, addYears, format } from "date-fns";


const LOAN_TYPE_CONFIG = {
  loan: { interestRate: 0.1, label: "சாதாரண கடன்" }, // 10%
  emi: { interestRate: 0.12, label: "EMI" }, // 12%
};

const PAYMENT_FREQUENCIES = ["தினசரி", "வாராந்திர", "மாதாந்திர", "வருடாந்திர"] as const;
type PaymentFrequency = (typeof PAYMENT_FREQUENCIES)[number];

function getDueDate(startDate: Date, frequency: PaymentFrequency): Date {
  switch (frequency) {
    case "தினசரி":
      return addDays(startDate, 1);
    case "வாராந்திர":
      return addDays(startDate, 7);
    case "மாதாந்திர":
      return addMonths(startDate, 1);
    case "வருடாந்திர":
      return addYears(startDate, 1);
  }
}

export default function ApplyLoanPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const { id: userId } = use(paramsPromise);
  const router = useRouter();
  const { toast } = useToast();

  const [amount, setAmount] = useState(0);
  const [loanType, setLoanType] = useState<"loan" | "emi">();
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>();


  const interestRate = loanType ? LOAN_TYPE_CONFIG[loanType].interestRate : 0;
  const interest = amount * interestRate;
  const principal = amount; // This is the total requested amount
  const disbursedAmount = principal - interest; // Amount given to user
  const totalOwed = principal; // User repays the full requested amount
  const dueDate = paymentFrequency ? getDueDate(new Date(), paymentFrequency) : null;


  const chartData = [
    { name: "வழங்கப்பட்ட தொகை", value: disbursedAmount, fill: "hsl(var(--primary))" },
    { name: "வட்டி (முன்பணம்)", value: interest, fill: "hsl(var(--accent))" },
  ];

  const handleSubmit = async () => {
    if (!loanType || !paymentFrequency || !dueDate) {
      toast({
        variant: "destructive",
        title: "முழுமையற்ற தகவல்",
        description: "கடன் வகை மற்றும் செலுத்தும் கால இடைவெளியைத் தேர்ந்தெடுக்கவும்.",
      });
      return;
    }

    const allUsers = await getUsers();
    const allLoans = allUsers.flatMap(u => u.loans);
    const newLoanId = `loan${allLoans.length + 1}`;
    const newTxnId = `txn${Date.now().toString().slice(-5)}`;
    const createdAt = new Date();


    const newLoan: Loan = {
      id: newLoanId,
      userId,
      amountRequested: amount,
      interest,
      principal: disbursedAmount, // The amount that leaves the vault
      totalOwed, // The amount user needs to repay
      amountRepaid: 0,
      status: 'Active',
      loanType: (loanType === 'loan' ? 'Loan' : 'EMI'),
      paymentFrequency: (paymentFrequency as 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'),
      createdAt: createdAt.toISOString(),
      dueDate: dueDate.toISOString(),
      transactions: [
        {
          id: newTxnId,
          loanId: newLoanId,
          type: 'Disbursement',
          amount: disbursedAmount, // Log the disbursed amount
          date: new Date().toISOString(),
        }
      ]
    };

    const tempLoansJson = localStorage.getItem('temp_new_loans');
    const tempLoans = tempLoansJson ? JSON.parse(tempLoansJson) : {};
    if (!tempLoans[userId]) {
      tempLoans[userId] = [];
    }
    tempLoans[userId].push(newLoan);
    localStorage.setItem('temp_new_loans', JSON.stringify(tempLoans));

    toast({
      title: "விண்ணப்பம் சமர்ப்பிக்கப்பட்டது!",
      description: `₹${totalOwed.toLocaleString('en-IN')} க்கான கடன் ஒப்புதல் அளிக்கப்பட்டது.`,
    });

    router.push(`/dashboard/users/${userId}`);
  };


  return (
    <div className="space-y-6">
      <PageHeader title="புதிய கடன் விண்ணப்பம்">
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/users/${userId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            பயனர் விவரங்களுக்குத் திரும்பு
          </Link>
        </Button>
      </PageHeader>

      <Card>
        <div className="grid md:grid-cols-2">
          {/* Left Side: Form */}
          <div className="p-6 flex flex-col">
            <CardHeader className="p-0 mb-6">
              <CardTitle>கடன் அமைப்பு</CardTitle>
              <CardDescription>
                தொகையைச் சரிசெய்து, கடன் வகையைத் தேர்ந்தெடுக்கவும்.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-0 space-y-8">
              <div className="space-y-4">
                <Label htmlFor="amount">கடன் தொகை (திருப்பிச் செலுத்த வேண்டிய மொத்தம்)</Label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-full"
                    onClick={() => setAmount(Math.max(0, amount - 1000))}
                    disabled={amount <= 0}
                  >
                    <Minus className="h-4 w-4" />
                    <span className="sr-only">குறை</span>
                  </Button>
                  <div className="flex-1 text-center">
                    <div className="text-3xl font-bold tracking-tighter">
                      ₹{amount.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-full"
                    onClick={() => setAmount(amount + 1000)}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">அதிகரி</span>
                  </Button>
                </div>
                <Slider
                  id="amount"
                  min={0}
                  max={100000}
                  step={1000}
                  value={[amount]}
                  onValueChange={(value) => setAmount(value[0])}
                />
              </div>

              <div className="space-y-4">
                <Label>கடன் வகை</Label>
                <RadioGroup
                  value={loanType}
                  onValueChange={(value: "loan" | "emi") => setLoanType(value)}
                  className="grid grid-cols-2 gap-4"
                >
                  {(Object.keys(LOAN_TYPE_CONFIG) as Array<keyof typeof LOAN_TYPE_CONFIG>).map((type) => (
                    <Label
                      key={type}
                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${loanType === type ? 'border-primary' : ''}`}
                    >
                      <RadioGroupItem value={type} className="sr-only" />
                      <span>{LOAN_TYPE_CONFIG[type].label}</span>
                      <span className="text-xs text-muted-foreground mt-1">({LOAN_TYPE_CONFIG[type].interestRate * 100}% வட்டி)</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label>செலுத்தும் கால இடைவெளி</Label>
                <RadioGroup
                  value={paymentFrequency}
                  onValueChange={(value: (typeof PAYMENT_FREQUENCIES)[number]) => setPaymentFrequency(value)}
                  className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  {PAYMENT_FREQUENCIES.map((freq) => (
                    <Label
                      key={freq}
                      className={`flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground text-sm ${paymentFrequency === freq ? 'border-primary' : ''}`}
                    >
                      <RadioGroupItem value={freq} className="sr-only" />
                      <span>{freq}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

            </CardContent>
            <CardFooter className="p-0 pt-6">
              <Button onClick={handleSubmit} disabled={amount <= 0 || !loanType || !paymentFrequency} className="w-full" size="lg">
                விண்ணப்பத்தை சமர்ப்பிக்கவும்
              </Button>
            </CardFooter>
          </div>

          {/* Right Side: Summary */}
          <div className="bg-muted/50 p-6 flex flex-col rounded-r-lg border-l">
            <CardHeader className="p-0 mb-6">
              <CardTitle>கடன் விவரம்</CardTitle>
              <CardDescription>
                நீங்கள் கோரிய கடனின் விவரங்கள்.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-grow flex flex-col items-center justify-center">
              <div className="w-full max-w-[250px] aspect-square">
                <ChartContainer config={{}} className="min-h-[250px]">
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      strokeWidth={5}
                      activeIndex={0}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </div>

              <div className="w-full max-w-sm space-y-3 text-sm">
                <Separator className="my-4" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">கடன் தொகை:</span>
                  <span className="font-medium">
                    ₹{disbursedAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                   <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    <span>வட்டி ({interestRate * 100}%, முன்பணம்):</span>
                  </div>
                  <span className="font-medium">
                    ₹{interest.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">செலுத்த வேண்டிய தேதி:</span>
                    <span className="font-medium">
                        {dueDate ? format(dueDate, 'PPP') : 'கி/இ'}
                    </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold text-base">
                  <span>திருப்பிச் செலுத்த வேண்டிய மொத்தம்:</span>
                  <span>₹{totalOwed.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </CardContent>
          </div>
        </div>
      </Card>
    </div>
  );
}
