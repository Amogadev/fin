
"use client";

import { getUsers, User, Loan } from "@/lib/data";
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
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft, User as UserIcon, FilePenLine, Trash2, Eye } from "lucide-react";
import PageHeader from "@/components/page-header";
import { use, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";


function UserCard({ user, onDelete }: { user: User; onDelete: (userId: string) => void; }) {
  const { toast } = useToast();
  const latestActiveLoan = user.loans
    .filter(loan => (loan.loanType === 'Loan' || loan.loanType === 'EMI') && (loan.status === 'Active' || loan.status === 'Overdue'))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  
  const dueAmount = latestActiveLoan ? latestActiveLoan.totalOwed - latestActiveLoan.amountRepaid : 0;
  const totalLoanAmount = latestActiveLoan ? latestActiveLoan.totalOwed : 0;

  const latestPaidLoan = !latestActiveLoan ? user.loans
    .filter(loan => (loan.loanType === 'Loan' || loan.loanType === 'EMI') && loan.status === 'Paid')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] : null;

  const handleDelete = () => {
    const tempUsersJson = localStorage.getItem('temp_new_users');
    let allUsers: User[] = tempUsersJson ? JSON.parse(tempUsersJson) : [];
    allUsers = allUsers.filter(u => u.id !== user.id);
    localStorage.setItem('temp_new_users', JSON.stringify(allUsers));

    const tempLoansJson = localStorage.getItem('temp_new_loans');
    if(tempLoansJson) {
      const tempLoans = JSON.parse(tempLoansJson);
      delete tempLoans[user.id];
      localStorage.setItem('temp_new_loans', JSON.stringify(tempLoans));
    }

    toast({
      title: "பயனர் நீக்கப்பட்டார்",
      description: `${user.name} வெற்றிகரமாக நீக்கப்பட்டார்.`,
    });
    onDelete(user.id);
  };

  return (
    <Card>
      <CardContent className="pt-6 flex flex-col items-center text-center space-y-3">
        <Link href={`/dashboard/users/${user.id}`} className="block">
          <Image 
            src={user.faceImageUrl} 
            alt={user.name}
            width={80}
            height={80}
            className="rounded-full border-4 border-muted shadow-md object-cover"
            data-ai-hint="person portrait"
          />
        </Link>
        <div className="space-y-1">
          <Link href={`/dashboard/users/${user.id}`} className="block">
            <div className="flex items-baseline justify-center gap-2">
                <CardTitle className="text-lg">{user.name}</CardTitle>
                {latestActiveLoan && (
                    <CardDescription className="text-xs">
                        (<span className="font-mono">{latestActiveLoan.id}</span>)
                    </CardDescription>
                )}
            </div>
          </Link>
           {latestActiveLoan ? (
             <div className="text-sm text-muted-foreground">
                <p>கடன்: <span className="font-semibold text-foreground">₹{totalLoanAmount.toLocaleString('en-IN')}</span></p>
                <p>நிலுவை: <span className="font-semibold text-foreground">₹{dueAmount.toLocaleString('en-IN')}</span></p>
             </div>
           ) : latestPaidLoan ? (
            <div className="text-sm text-muted-foreground">
                <p>கடைசி கடன்: <span className="font-semibold text-foreground">₹{latestPaidLoan.totalOwed.toLocaleString('en-IN')}</span></p>
                <Badge variant="secondary" className="text-xs font-medium mt-1">முழுதும் செலுத்தப்பட்டது</Badge>
            </div>
           ) : (
             <Badge variant="secondary" className="text-xs font-medium">கடன்கள் இல்லை</Badge>
           )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-1">
         <Button asChild variant="ghost" size="icon" className="w-8 h-8">
            <Link href={`/dashboard/users/${user.id}`}>
                <Eye className="h-4 w-4" />
                <span className="sr-only">விவரங்கள்</span>
            </Link>
        </Button>
        <Button asChild variant="ghost" size="icon" className="w-8 h-8">
          <Link href={`/dashboard/users/${user.id}/edit`}>
            <FilePenLine className="h-4 w-4" />
            <span className="sr-only">பயனரைத் திருத்து</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}


function UserCardSkeleton() {
    return (
        <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-3">
                <Skeleton className="w-20 h-20 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-1">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
            </CardFooter>
        </Card>
    );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[] | null>(null);

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  const handleUserDeleted = (deletedUserId: string) => {
    setUsers(prevUsers => prevUsers ? prevUsers.filter(user => user.id !== deletedUserId) : null);
  }

  const loanUsers = users?.filter(user => user.loans.some(loan => loan.loanType === 'Loan' || loan.loanType === 'EMI'));

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
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {!loanUsers ? (
          Array.from({ length: 10 }).map((_, i) => <UserCardSkeleton key={i} />)
        ) : loanUsers.length > 0 ? (
          loanUsers
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((user) => <UserCard key={user.id} user={user} onDelete={handleUserDeleted} />)
        ) : (
          <div className="col-span-full text-center text-muted-foreground py-16">
            <UserIcon className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">கடன் பயனர்கள் இல்லை</h3>
            <p>தொடங்குவதற்கு ஒரு புதிய கடன் பயனரைச் சேர்க்கவும்.</p>
          </div>
        )}
      </div>
    </div>
  );
}
