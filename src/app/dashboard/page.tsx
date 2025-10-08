import { getVaultData, getUsers } from "@/lib/data";
import StatCard from "@/components/stat-card";
import { IndianRupee, Users, Landmark, User, ArrowUpRight } from "lucide-react";
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

function UserCard({ user }: { user: import("@/lib/data").User }) {
  const loanStatus = user.loans.some((l) => l.status === "Overdue")
    ? "Overdue"
    : user.loans.some((l) => l.status === "Active")
    ? "Active"
    : "Clear";
  const loanVariant =
    loanStatus === "Overdue"
      ? "destructive"
      : loanStatus === "Active"
      ? "outline"
      : "secondary";

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4">
        <Image
          src={user.faceImageUrl}
          alt={user.name}
          width={40}
          height={40}
          className="rounded-full object-cover"
          data-ai-hint="person portrait"
        />
        <div className="grid gap-1">
          <CardTitle className="text-base">{user.name}</CardTitle>
          <CardDescription className="text-xs">{user.contact}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <Badge variant={loanVariant}>{loanStatus}</Badge>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/dashboard/users/${user.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
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
            <CardDescription>Recently registered users.</CardDescription>
          </div>
          <Button asChild size="sm" className="ml-auto gap-1">
            <Link href="/dashboard/users">
              View All
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
