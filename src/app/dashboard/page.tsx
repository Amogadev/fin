
"use client";

import { getVaultData, getUsers } from "@/lib/data";
import StatCard from "@/components/stat-card";
import { IndianRupee, Users, Landmark, User as UserIcon, ArrowUpRight, Plus, Gift, FileText, Wallet, PiggyBank, UserPlus } from "lucide-react";
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
                  <p>{user.registrationType === 'Loan' ? 'கடன் பதிவு' : 'தீபாவளி சேமிப்புத் திட்டம்'}</p>
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
                    {user.registrationType === 'Diwali Fund' ? 'தீபாவளி சேமிப்பு' : "செயலில் கடன்கள் இல்லை"}
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
            <p className="font-semibold text-xs">புதிய பயனர்</p>
        </CardContent>
      </Card>
    </Link>
  )
}

function NewLoanRegistrationCard() {
  return (
    <Link href="/dashboard/users/new" className="block h-full">
      <Card className="h-full bg-primary/5 hover:bg-primary/10 transition-colors flex flex-col items-center justify-center text-center space-y-2 p-4">
        <div className="flex items-center justify-center bg-background/50 rounded-full w-12 h-12">
            <UserPlus className="h-6 w-6 text-primary" />
        </div>
        <p className="font-semibold text-sm text-primary">புதிய கடன் பதிவு</p>
        <p className="text-xs text-muted-foreground">ஒரு புதிய பயனரைச் சேர்க்கவும்</p>
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
        <p className="font-semibold text-sm text-primary">தீபாவளி சேமிப்புத் திட்டத்தில் சேரவும்</p>
        <p className="text-xs text-muted-foreground">சேமித்து பண்டிகை போனஸ் பெறுங்கள்</p>
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
            <div className="h-36 bg-muted/50 rounded-md"></div>
            <div className="grid gap-4 md:grid-cols-2">
                <StatCard.Skeleton />
                <StatCard.Skeleton />
            </div>
             <div className="h-36 bg-muted/50 rounded-md"></div>
            <Card>
                <CardHeader>
                    <CardTitle>சமீபத்திய பயனர்கள்</CardTitle>
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
  const loanUsers = users.filter(user =>
    user.loans.some(loan => loan.loanType === 'Loan' || loan.loanType === 'EMI')
  );


  return (
    <div className="space-y-6">
       <div className="space-y-4">
           <Card className="bg-gradient-to-tr from-primary to-accent text-primary-foreground">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">மொத்த கை இருப்பு</CardTitle>
                    <Wallet className="h-5 w-5 text-primary-foreground/80" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">₹{(vaultData.balance).toLocaleString("en-IN")}</div>
                    <p className="text-xs text-primary-foreground/80">தொடக்க இருப்பு: ₹1,00,000</p>
                </CardContent>
            </Card>
            
            <h3 className="text-lg font-semibold pt-2">கடன்</h3>

            <div className="grid gap-4 md:grid-cols-3">
                <NewLoanRegistrationCard />
                <StatCard
                title="வழங்கப்பட்ட மொத்தக் கடன்கள்"
                value={`₹${vaultData.totalLoansGiven.toLocaleString("en-IN")}`}
                icon={IndianRupee}
                description="வழங்கப்பட்ட அசல் தொகை"
                />
                <StatCard
                title="மொத்த கடன் பயனர்கள்"
                value={loanUsers.length.toString()}
                icon={Users}
                description="கடன் பெற்ற பயனர்கள்"
                />
            </div>
            
            <h3 className="text-lg font-semibold pt-2">தீபாவளி சேமிப்புத் திட்டம்</h3>
            
            <div className="grid gap-4 md:grid-cols-3">
                <DiwaliFundCard />
                <StatCard
                title="மொத்த சேமிப்பு"
                value={`₹${vaultData.totalDiwaliFundContributions.toLocaleString("en-IN")}`}
                icon={PiggyBank}
                description="பயனர்கள் சேமித்தவை"
                />
                <StatCard
                title="சேமிப்புத் திட்ட பயனர்கள்"
                value={vaultData.diwaliFundUsers.toString()}
                icon={Gift}
                description="திட்டத்தில் பங்கேற்கும் பயனர்கள்"
                />
            </div>
        </div>
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>விரைவு அணுகல்</CardTitle>
          </div>
          <Button asChild size="sm" className="ml-auto gap-1">
            <Link href="/dashboard/users">
              அனைத்து பயனர்கள்
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

    

    




    

    

    

    
