
"use client";

import { notFound, useRouter } from "next/navigation";
import { getUserById, type User, type Loan } from "@/lib/data";
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
import { IndianRupee, PlusCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState, use } from "react";

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
    <Badge variant="success">
      நிலுவையில் உள்ளது — {format(dueDate, 'PP')} அன்று செலுத்த வேண்டும்
    </Badge>
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

  useEffect(() => {
    async function loadUser() {
      let userData = await getUserById(id);
      
      // Check for new loans in localStorage
      if (userData) {
        const tempLoansJson = localStorage.getItem('temp_new_loans');
        if (tempLoansJson) {
            const tempLoans = JSON.parse(tempLoansJson);
            if (tempLoans[id]) {
                const existingLoanIds = new Set(userData.loans.map(l => l.id));
                const newLoans = tempLoans[id].filter((l: Loan) => !existingLoanIds.has(l.id));
                userData.loans = [...userData.loans, ...newLoans];
            }
        }
      }


      setUser(userData || null);
    }

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
            அனைத்து பயனர்கள்
          </Link>
        </Button>
      </PageHeader>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>பயனர் சுயவிவரம்</CardTitle>
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
                  <strong>தொடர்பு:</strong> {user.contact}
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
                    <PlusCircle className="mr-2 h-4 w-4" /> கடன்/EMI க்கு விண்ணப்பிக்கவும்
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

        <div className="md:col-span-2">
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
