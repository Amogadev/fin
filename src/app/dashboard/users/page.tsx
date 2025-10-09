
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
import { PlusCircle, ArrowLeft, ArrowRight, User as UserIcon, FilePenLine, FileText, Gift } from "lucide-react";
import PageHeader from "@/components/page-header";
import { use, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


function UserCard({ user }: { user: User }) {
  const loanStatus = user.loans.some((l) => l.status === "Overdue")
    ? "தாமதம்"
    : user.loans.some((l) => l.status === "Active")
    ? "செயலில் உள்ளது"
    : "முடிந்தது";
  
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
           {user.registrationType && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default">
                    {user.registrationType === 'Loan' ? <FileText className="h-4 w-4 text-muted-foreground" /> : <Gift className="h-4 w-4 text-muted-foreground" />}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{user.registrationType === 'Loan' ? 'கடன் பதிவு' : 'தீபாவளி சேமிப்புத் திட்டம்'}</p>                
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Button asChild variant="ghost" size="icon" className="w-8 h-8">
            <Link href={`/dashboard/users/${user.id}/edit`}>
              <FilePenLine className="h-4 w-4" />
              <span className="sr-only">பயனரைத் திருத்து</span>
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-2 text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">அடையாளச் சான்று:</span>
          <span className="text-xs">{user.idProof}</span>
        </div>
         <div className="flex justify-between items-center">
            <span className="text-muted-foreground">கடன் நிலை:</span>
            {user.registrationType === 'Diwali Fund' && user.loans.length === 0 ? (
                 <Badge variant="secondary">தீபாவளி சேமிப்பு</Badge>
            ) : (
                <Badge variant={loanStatusVariant}>{loanStatus}</Badge>
            )}
        </div>
        {nextDueDate && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">அடுத்த செலுத்த வேண்டிய தேதி:</span>
            <span className="text-xs">{format(new Date(nextDueDate), "PP")}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-3 pt-1">
        <Button asChild variant="outline" size="sm" className="w-full h-8">
          <Link href={`/dashboard/users/${user.id}`}>
            விவரங்கள்
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
          title="பயனர்கள்"
        >
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                பின்செல்
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/users/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                புதிய பயனர்
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
  const sortedUsers = users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


  return (
    <div className="space-y-4">
      <PageHeader
        title="பயனர்கள்"
      >
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              பின்செல்
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/users/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              புதிய பயனர்
            </Link>
          </Button>
        </div>
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedUsers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}
