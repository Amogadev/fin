import { getVaultData, getUsers } from "@/lib/data";
import StatCard from "@/components/stat-card";
import { IndianRupee, Users, Landmark } from "lucide-react";
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
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export default async function DashboardPage() {
  const vaultData = await getVaultData();
  const users = await getUsers();
  const recentUsers = users.slice(0, 5);

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Contact</TableHead>
                <TableHead>Loan Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.name}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {user.contact}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.loans.some((l) => l.status === "Overdue")
                          ? "destructive"
                          : user.loans.some((l) => l.status === "Active")
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {user.loans.some((l) => l.status === "Overdue")
                        ? "Overdue"
                        : user.loans.some((l) => l.status === "Active")
                        ? "Active"
                        : "Clear"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/users/${user.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
