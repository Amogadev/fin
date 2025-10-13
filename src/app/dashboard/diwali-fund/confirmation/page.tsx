
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, PartyPopper } from "lucide-react";
import { format } from "date-fns";

interface FundDetails {
  name: string;
  contribution: number;
  frequency: string;
  estimatedReturn: number;
  nextPaymentDate: string;
}

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [details, setDetails] = useState<FundDetails | null>(null);

  useEffect(() => {
    const storedDetails = localStorage.getItem("diwali_fund_confirmation");
    if (storedDetails) {
      setDetails(JSON.parse(storedDetails));
      // localStorage.removeItem("diwali_fund_confirmation"); // Optional: clear after reading
    } else {
        // Fallback to searchParams if localStorage is empty
        const name = searchParams.get("name");
        const contribution = searchParams.get("contribution");
        const frequency = searchParams.get("frequency");
        const estimatedReturn = searchParams.get("estimatedReturn");
        const nextPaymentDate = searchParams.get("nextPaymentDate");
        if (name && contribution && frequency && estimatedReturn && nextPaymentDate) {
            setDetails({
                name,
                contribution: Number(contribution),
                frequency,
                estimatedReturn: Number(estimatedReturn),
                nextPaymentDate,
            });
        } else {
             router.push("/dashboard/diwali-fund");
        }
    }
  }, [router, searchParams]);

  if (!details) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>உங்கள் உறுதிப்படுத்தல் ஏற்றப்படுகிறது...</p>
      </div>
    );
  }
  
  const { name, contribution, frequency, estimatedReturn, nextPaymentDate } = details;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-background p-6">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="flex justify-center text-green-600 dark:text-green-500 mb-2">
            <CheckCircle size={48} />
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
              <span className="font-medium">
                ₹{Number(contribution).toLocaleString("en-IN")} /{" "}
                {frequency.endsWith("ly") ? frequency.slice(0, -2) : frequency}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">அடுத்த செலுத்த வேண்டிய தேதி:</span>
              <span className="font-medium">{format(new Date(nextPaymentDate), "PPP")}</span>
            </div>

            <div className="flex justify-between text-base font-semibold text-primary">
              <span>மதிப்பிடப்பட்ட தீபாவளி வருமானம்:</span>
              <span>₹{Math.round(Number(estimatedReturn)).toLocaleString("en-IN")}</span>
            </div>
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
