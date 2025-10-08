
"use client";

import { getVaultData, getUsers } from "@/lib/data";
import StatCard from "@/components/stat-card";
import { IndianRupee, Users, Landmark, User as UserIcon, ArrowUpRight, Plus, Gift, FileText } from "lucide-react";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { use, useEffect, useState } from "react";
import { User, Vault } from "@/lib/data";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function UserCard({ user }: { user: User }) {
  const activeLoans = user.loans.filter(loan => loan.status === 'Active' || loan.status === 'Overdue');
  const totalLoanAmount = activeLoans.reduce((acc, loan) => acc + (loan.totalOwed - loan.amountRepaid), 0);
  const latestLoan = activeLoans.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  const latestLoanType = latestLoan?.loanType;

  return (
    <Link href={`/dashboard/users/${user.id}`} className="block">
      <Card className="h-32 w-32 bg-muted/50 hover:bg-muted/80 transition-colors flex flex-col justify-center items-center text-center relative">
        {user.registrationType && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="absolute top-2 right-2">
                    {user.registrationType === 'Loan' ? <FileText className="h-4 w-4 text-muted-foreground" /> : <Gift className="h-4 w-4 text-muted-foreground" />}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Registered for {user.registrationType}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        <CardContent className="p-2 space-y-2 flex flex-col items-center">
          <UserIcon className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="font-semibold text-sm">{user.name}</p>
            {totalLoanAmount > 0 ? (
                <div>
                    <p className="text-xs text-foreground">₹{totalLoanAmount.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-muted-foreground">({latestLoanType?.replace('Standard ', '')})</p>
                </div>
            ) : (
                 <p className="text-xs text-muted-foreground">
                    {user.registrationType === 'Diwali Fund' ? 'Diwali Fund' : "No active loans"}
                 </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function AddUserCard() {
  return (
    <Link href="/dashboard/users/new" className="block">
      <Card className="h-32 w-32 bg-muted/50 hover:bg-muted/80 transition-colors flex flex-col items-center justify-center text-center space-y-2">
        <CardContent className="p-2 flex flex-col items-center justify-center text-center space-y-2">
            <div className="flex items-center justify-center bg-background/50 rounded-full w-10 h-10">
                <Plus className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="font-semibold text-xs">Add New User</p>
        </CardContent>
      </Card>
    </Link>
  )
}

function DiwaliFundCard() {
  return (
    <Link href="/diwali-fund" className="block h-full">
      <Card className="h-full bg-primary/5 hover:bg-primary/10 transition-colors flex flex-col items-center justify-center text-center space-y-2 p-4">
        <div className="flex items-center justify-center bg-background/50 rounded-full w-12 h-12">
            <Gift className="h-6 w-6 text-primary" />
        </div>
        <p className="font-semibold text-sm text-primary">Join Diwali Fund</p>
        <p className="text-xs text-muted-foreground">Save & get a festive bonus</p>
      </Card>
    </Link>
  )
}

export default function DashboardPage() {
  const [dataPromise, setDataPromise] = useState<Promise<{vault: Vault, users: User[]}> | null>(null);

  useEffect(() => {
    setDataPromise(
        Promise.all([getVaultData(), getUsers()]).then(([vault, users]) => ({ vault, users }))
    );
  }, []);

  if (!dataPromise) {
    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-4">
                <div className="md:col-span-3 grid gap-4 md:grid-cols-3">
                    <StatCard.Skeleton />
                    <StatCard.Skeleton />
                    <StatCard.Skeleton />
                </div>
                <div className="h-36 bg-muted/50 rounded-md"></div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex space-x-4">
                        <div className="h-32 w-32 bg-muted/50 rounded-md"></div>
                        <div className="h-32 w-32 bg-muted/50 rounded-md"></div>
                        <div className="h-32 w-32 bg-muted/50 rounded-md"></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }

  const { vault: vaultData, users } = use(dataPromise);
  const recentUsers = users.slice(-3).reverse();

  return (
    <div className="space-y-8">
       <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-3 grid gap-4 md:grid-cols-3">
                <StatCard
                title="Wallet Balance"
                value={`₹${(vaultData.balance).toLocaleString("en-IN")}`}
                icon={Landmark}
                description={
                    <div>
                    <span>Total available funds</span>
                    <span className="block text-xs text-muted-foreground/80">Initial Balance: ₹1,00,000</span>
                    </div>
                }
                />
                <StatCard
                title="Total Loans Given"
                value={`₹${vaultData.totalLoansGiven.toLocaleString("en-IN")}`}
                icon={IndianRupee}
                description="Principal amount disbursed"
                />
                <StatCard
                title="Total Active Users"
                value={users.length.toString()}
                icon={Users}
                description="Users with accounts"
                />
            </div>
            <DiwaliFundCard />
        </div>
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Quick Actions</CardTitle>
          </div>
          <Button asChild size="sm" className="ml-auto gap-1">
            <Link href="/dashboard/users">
              View All Users
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {recentUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
            <AddUserCard />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
