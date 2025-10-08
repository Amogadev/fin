
import { getUsers, User } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft, ArrowRight, User as UserIcon } from "lucide-react";
import PageHeader from "@/components/page-header";

function UserCard({ user }: { user: User }) {
  const loanStatus = user.loans.some((l) => l.status === "Overdue")
    ? "Overdue"
    : user.loans.some((l) => l.status === "Active")
    ? "Active"
    : "Clear";
  
  const loanStatusVariant = user.loans.some((l) => l.status === "Overdue")
    ? "destructive"
    : user.loans.some((l) => l.status === "Active")
    ? "success"
    : "secondary";

  return (
    <Card>
      <CardHeader className="p-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border bg-muted flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-base">{user.name}</CardTitle>
            <CardDescription className="text-xs">{user.contact}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">ID Proof:</span>
          <span className="text-xs">{user.idProof}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Loan Status:</span>
          <Badge variant={loanStatusVariant}>{loanStatus}</Badge>
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-1">
        <Button asChild variant="outline" size="sm" className="w-full h-8">
          <Link href={`/dashboard/users/${user.id}`}>
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Users"
        description="Manage all registered users and their loan accounts."
      >
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/users/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Register New User
            </Link>
          </Button>
        </div>
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}
