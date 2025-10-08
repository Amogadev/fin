import { getUsers } from "@/lib/data";
import {
  Card,
  CardContent,
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
import { PlusCircle } from "lucide-react";
import PageHeader from "@/components/page-header";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Users"
        description="Manage all registered users and their loan accounts."
      >
        <Button asChild>
          <Link href="/dashboard/users/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Register New User
          </Link>
        </Button>
      </PageHeader>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>ID Proof</TableHead>
                <TableHead>Loan Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.name}</div>
                  </TableCell>
                  <TableCell>{user.contact}</TableCell>
                  <TableCell>{user.idProof}</TableCell>
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
