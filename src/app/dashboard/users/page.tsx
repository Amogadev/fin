
"use client";

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
import { PlusCircle, ArrowLeft, ArrowRight, User as UserIcon, FilePenLine } from "lucide-react";
import PageHeader from "@/components/page-header";
import { use, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

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

  const nextDueDate = user.loans
    .filter(l => l.status === 'Active' || l.status === 'Overdue')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    [0]?.dueDate;

  return (
    <Card>
      <CardHeader className="p-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border bg-muted flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base">{user.name}</CardTitle>
            <CardDescription className="text-xs">{user.contact}</CardDescription>
          </div>
          <Button asChild variant="ghost" size="icon" className="w-8 h-8">
            <Link href={`/dashboard/users/${user.id}/edit`}>
              <FilePenLine className="h-4 w-4" />
              <span className="sr-only">Edit User</span>
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-2 text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">ID Proof:</span>
          <span className="text-xs">{user.idProof}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Loan Status:</span>
          <Badge variant={loanStatusVariant}>{loanStatus}</Badge>
        </div>
        {nextDueDate && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Next Due Date:</span>
            <span className="text-xs">{format(new Date(nextDueDate), "PP")}</span>
          </div>
        )}
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

function UserCardSkeleton() {
    return (
        <Card>
            <CardHeader className="p-3">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-3 pb-2 text-xs space-y-2">
                <div className="flex justify-between">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex justify-between">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                </div>
            </CardContent>
            <CardFooter className="p-3 pt-1">
                <Skeleton className="h-8 w-full" />
            </CardFooter>
        </Card>
    );
}

export default function UsersPage() {
  const [usersPromise, setUsersPromise] = useState<Promise<User[]>>();

  useEffect(() => {
    setUsersPromise(getUsers());
  }, []);

  if (!usersPromise) {
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
            {Array.from({ length: 4 }).map((_, i) => <UserCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const users = use(usersPromise);

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
