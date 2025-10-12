
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
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft, ArrowRight, User as UserIcon, FilePenLine, FileText, Gift, Trash2 } from "lucide-react";
import PageHeader from "@/components/page-header";
import { use, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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


function UsersTable({ users, onDelete }: { users: User[], onDelete: (userId: string) => void }) {
  const { toast } = useToast();

  const handleDelete = (user: User) => {
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

  const getLatestActiveLoan = (user: User): Loan | undefined => {
    return user.loans
      .filter(loan => loan.status === 'Active' || loan.status === 'Overdue')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  };

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>உறுப்பினர் பெயர்</TableHead>
            <TableHead>கடன் எண்</TableHead>
            <TableHead>கடன் தொகை</TableHead>
            <TableHead>கடன் தேதி</TableHead>
            <TableHead>நிலுவைத் தொகை</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user) => {
              const latestLoan = getLatestActiveLoan(user);
              const dueAmount = latestLoan ? latestLoan.totalOwed - latestLoan.amountRepaid : 0;
              
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Link href={`/dashboard/users/${user.id}`} className="font-medium text-primary hover:underline">
                        {user.name}
                        </Link>
                        {!latestLoan && <Badge variant="success">செயலில் கடன் இல்லை</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {latestLoan ? latestLoan.id : '-'}
                  </TableCell>
                  <TableCell>
                    {latestLoan ? `₹${latestLoan.totalOwed.toLocaleString('en-IN')}` : '₹0'}
                  </TableCell>
                  <TableCell>
                    {latestLoan ? format(new Date(latestLoan.createdAt), 'PP') : '-'}
                  </TableCell>
                   <TableCell>
                    {`₹${dueAmount.toLocaleString('en-IN')}`}
                  </TableCell>
                  <TableCell className="text-right">
                     <Button asChild variant="ghost" size="icon" className="w-8 h-8">
                        <Link href={`/dashboard/users/${user.id}`}>
                            <ArrowRight className="h-4 w-4" />
                            <span className="sr-only">விவரங்கள்</span>
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" size="icon" className="w-8 h-8">
                      <Link href={`/dashboard/users/${user.id}/edit`}>
                        <FilePenLine className="h-4 w-4" />
                        <span className="sr-only">பயனரைத் திருத்து</span>
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 h-8">
                          <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                          <span className="sr-only">பயனரை நீக்கு</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user <span className="font-bold">{user.name}</span> and all associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ரத்துசெய்</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(user)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                            நீக்கு
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
             <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                பயனர்கள் இல்லை.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

function UsersTableSkeleton() {
    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                        <TableHead className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
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

  if (!users) {
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
        <UsersTableSkeleton />
      </div>
    );
  }

  const sortedUsers = [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


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
      <UsersTable users={sortedUsers} onDelete={handleUserDeleted} />
    </div>
  );
}
