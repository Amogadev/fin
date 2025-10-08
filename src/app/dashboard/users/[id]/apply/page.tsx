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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function ApplyLoanPage({ params }: { params: { id: string } }) {
  const [amount, setAmount] = useState(0);
  const interestRate = 0.1; // 10%

  const interest = amount * interestRate;
  const principal = amount - interest;
  const totalOwed = amount;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title="New Loan Application"
        description={`For user ID: ${params.id}`}
      >
        <Button asChild variant="outline">
          <Link href={`/dashboard/users/${params.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to User
          </Link>
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Loan Details</CardTitle>
          <CardDescription>
            Enter the requested amount and terms for the new loan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount Requested (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="e.g., 10000"
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="loan-type">Loan Type</Label>
              <Select>
                <SelectTrigger id="loan-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="loan">Loan</SelectItem>
                  <SelectItem value="emi">EMI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="frequency">Payment Frequency</Label>
              <Select>
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {amount > 0 && (
            <div className="space-y-3 pt-4">
              <Separator />
              <h4 className="font-medium">Loan Calculation</h4>
              <div className="text-sm space-y-2 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Total Amount Requested:</span>
                  <span className="font-medium text-foreground">
                    ₹{totalOwed.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Interest (10%):</span>
                  <span className="font-medium text-foreground">
                    - ₹{interest.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-foreground">
                  <span>Principal Disbursed from Vault:</span>
                  <span>₹{principal.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <Separator />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button disabled={amount <= 0} className="w-full">
            Submit Application
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
