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
import { format } from "date-fns";
import { ShieldCheck, PlusCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState, use } from "react";

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
      // Try to get user from mock data first
      let userData = await getUserById(id);

      // If not found, check localStorage for a newly created user (demo purpose)
      if (!userData) {
        const tempUserJson = localStorage.getItem('temp_new_user');
        if (tempUserJson) {
          const tempUser = JSON.parse(tempUserJson);
          if (tempUser.id === id) {
            userData = {
              ...tempUser,
              createdAt: new Date().toISOString(),
              loans: [],
            };
          }
        }
      }
      
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

    // Clean up localStorage after a short delay to avoid stale data
    const timer = setTimeout(() => {
        if (localStorage.getItem('temp_new_user')) {
            const tempUser = JSON.parse(localStorage.getItem('temp_new_user')!);
            if (tempUser.id === id) {
                localStorage.removeItem('temp_new_user');
            }
        }
    }, 500);

    return () => clearTimeout(timer);

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
      <PageHeader title={user.name} description={`User ID: ${user.id}`}>
        <Button asChild variant="outline">
          <Link href="/dashboard/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All Users
          </Link>
        </Button>
      </PageHeader>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
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
                  <strong>Contact:</strong> {user.contact}
                </p>
                <p>
                  <strong>ID Proof:</strong> {user.idProof}
                </p>
                <p>
                  <strong>Member Since:</strong>{" "}
                  {format(new Date(user.createdAt), "PPP")}
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button asChild>
                  <Link href={`/dashboard/users/${user.id}/apply`}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Apply for Loan/EMI
                  </Link>
                </Button>
                <Button asChild variant="accent">
                  <Link href={`/dashboard/users/${user.id}/verify`}>
                    <ShieldCheck className="mr-2 h-4 w-4" /> Verify Identity
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Loan History</CardTitle>
              <CardDescription>
                All loans and EMIs taken by {user.name}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Repaid</TableHead>
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
                          <Badge
                            variant={
                              loan.status === "Overdue"
                                ? "destructive"
                                : loan.status === "Active"
                                ? "success"
                                : "secondary"
                            }
                          >
                            {loan.status}
                          </Badge>
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
                        No loans taken yet.
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
