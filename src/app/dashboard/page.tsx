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
      <Card className="h-full hover:bg-muted/50 transition-colors">
        <CardContent className="p-4 space-y-3">
          <Image
            src={user.faceImageUrl}
            alt={user.name}
            width={48}
            height={48}
            className="rounded-full object-cover"
            data-ai-hint="person portrait"
          />
          <div className="space-y-1">
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">
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
      <Card className="h-full hover:bg-muted/50 transition-colors">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2 h-full">
            <div className="flex items-center justify-center bg-muted rounded-full w-12 h-12">
                <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-semibold text-sm">Add New User</p>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Wallet Balance"
          value={`₹${(100000).toLocaleString("en-IN")}`}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
