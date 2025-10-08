import { getVaultData, getUsers } from "@/lib/data";
import StatCard from "@/components/stat-card";
import { IndianRupee, Users, Landmark, User, ArrowUpRight, Plus } from "lucide-react";
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

function UserCard({ user }: { user: import("@/lib/data").User }) {
  const totalLoanAmount = user.loans
    .filter(loan => loan.status === 'Active' || loan.status === 'Overdue')
    .reduce((acc, loan) => acc + (loan.totalOwed - loan.amountRepaid), 0);

  return (
    <Link href={`/dashboard/users/${user.id}`} className="block">
      <Card className="h-32 w-32 bg-muted/50 hover:bg-muted/80 transition-colors flex flex-col justify-center items-center text-center">
        <CardContent className="p-2 space-y-2 flex flex-col items-center">
          <User className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="font-semibold text-sm">{user.name}</p>
            <p className="text-xs text-muted-foreground">
              {totalLoanAmount > 0
                ? `₹${totalLoanAmount.toLocaleString("en-IN")}`
                : "No active loans"}
            </p>
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

export default async function DashboardPage() {
  const vaultData = await getVaultData();
  const users = await getUsers();
  const recentUsers = users.slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Wallet Balance"
          value={`₹${(vaultData.balance).toLocaleString("en-IN")}`}
          icon={Landmark}
          description="Total available funds"
        />
        <StatCard
          title="Total Loans Given"
          value={`₹${vaultData.totalLoansGiven.toLocaleString("en-IN")}`}
          icon={IndianRupee}
          description="Principal amount disbursed"
        />
        <StatCard
          title="Total Interest Earned"
          value={`₹${vaultData.totalInterestEarned.toLocaleString("en-IN")}`}
          icon={Users}
          description="From all loans"
        />
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Recent Users</CardTitle>
          </div>
          <Button asChild size="sm" className="ml-auto gap-1">
            <Link href="/dashboard/users">
              View All
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
