"use client";

import { useState } from "react";
import Link from "next/link";
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

const LOAN_TYPE_CONFIG = {
  loan: { interestRate: 0.1, label: "Standard Loan" }, // 10%
  emi: { interestRate: 0.12, label: "EMI" }, // 12%
};

export default function ApplyLoanPage({ params }: { params: { id: string } }) {
  const [amount, setAmount] = useState(10000);
  const [loanType, setLoanType] = useState<"loan" | "emi">("loan");

  const interestRate = LOAN_TYPE_CONFIG[loanType].interestRate;
  const interest = amount * interestRate;
  const principal = amount - interest;
  const totalOwed = amount;

  const chartData = [
    { name: "Principal", value: principal, fill: "hsl(var(--primary))" },
    { name: "Interest", value: interest, fill: "hsl(var(--accent))" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="New Loan Application">
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/users/${params.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to User
          </Link>
        </Button>
      </PageHeader>

      <Card>
        <div className="grid md:grid-cols-2">
          {/* Left Side: Form */}
          <div className="p-6 flex flex-col">
            <CardHeader className="p-0 mb-6">
              <CardTitle>Configure Your Loan</CardTitle>
              <CardDescription>
                Adjust the amount and select the loan type.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-0 space-y-8">
              <div className="space-y-4">
                <Label htmlFor="amount">Loan Amount</Label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-full"
                    onClick={() => setAmount(Math.max(0, amount - 1000))}
                    disabled={amount <= 0}
                  >
                    <Minus className="h-4 w-4" />
                    <span className="sr-only">Decrease</span>
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
                    <span className="sr-only">Increase</span>
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
                <Label>Loan Type</Label>
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
                      <span className="text-xs text-muted-foreground mt-1">({LOAN_TYPE_CONFIG[type].interestRate * 100}% Interest)</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter className="p-0 pt-6">
              <Button disabled={amount <= 0} className="w-full" size="lg">
                Submit Application
              </Button>
            </CardFooter>
          </div>

          {/* Right Side: Summary */}
          <div className="bg-muted/50 p-6 flex flex-col rounded-r-lg border-l">
            <CardHeader className="p-0 mb-6">
              <CardTitle>Loan Summary</CardTitle>
              <CardDescription>
                A breakdown of your requested loan.
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
                  <span className="text-muted-foreground">Total Requested:</span>
                  <span className="font-medium">
                    ₹{totalOwed.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    <span>Interest ({interestRate * 100}%):</span>
                  </div>
                  <span className="font-medium">
                    - ₹{interest.toLocaleString("en-IN")}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold text-base">
                  <span>Principal Disbursed:</span>
                  <span>₹{principal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </CardContent>
          </div>
        </div>
      </Card>
    </div>
  );
}
