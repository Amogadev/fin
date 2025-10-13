
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
import { PlusCircle, ArrowLeft, User as UserIcon, Eye, FilePenLine, Trash2 } from "lucide-react";
import PageHeader from "@/components/page-header";
import { use, useEffect, useState } from "react";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
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


type DiwaliUser = {
  user: User;
  fundDetails: Loan;
};

function DiwaliUserCard({ diwaliUser, onDelete }: { diwaliUser: DiwaliUser; onDelete: (userId: string) => void; }) {
  const { user, fundDetails } = diwaliUser;
  const { toast } = useToast();
  
  const remainingContribution = fundDetails.totalOwed - fundDetails.amountRepaid;

  const handleDelete = () => {
    // This logic is simplified for front-end. A real app would make an API call.
    const tempUsersJson = localStorage.getItem('temp_new_users');
    let allUsers: User[] = tempUsersJson ? JSON.parse(tempUsersJson) : [];
    
    const userIndex = allUsers.findIndex(u => u.id === user.id);
    if(userIndex !== -1) {
      allUsers[userIndex].loans = allUsers[userIndex].loans.filter(l => l.id !== fundDetails.id);
      
      // If this was the only reason they were a user, we could remove them.
      // For now, we just remove the fund.
      if(allUsers[userIndex].loans.length === 0 && allUsers[userIndex].registrationType === 'Diwali Fund') {
          allUsers.splice(userIndex, 1);
      }
      localStorage.setItem('temp_new_users', JSON.stringify(allUsers));
    }
    
    toast({
      title: "Participant Removed",
      description: `${user.name} has been removed from the Diwali Fund.`,
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
            <CardTitle className="text-lg">{user.name}</CardTitle>
          </Link>
          <p className="text-sm text-muted-foreground">
            Goal: <span className="font-semibold text-foreground">₹{fundDetails.totalOwed.toLocaleString('en-IN')}</span>
          </p>
           <p className="text-sm text-muted-foreground">
            Contributed: <span className="font-semibold text-success">₹{fundDetails.amountRepaid.toLocaleString('en-IN')}</span>
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-1">
         <Button asChild variant="ghost" size="icon" className="w-8 h-8">
            <Link href={`/dashboard/users/${user.id}`}>
                <Eye className="h-4 w-4" />
                <span className="sr-only">Details</span>
            </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
              <span className="sr-only">Remove Participant</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove {user.name} from the Diwali Fund?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the user from the current Diwali savings plan. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
                    <Skeleton className="h-4 w-28" />
                </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-1">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
            </CardFooter>
        </Card>
    );
}

export default function DiwaliFundPage() {
  const [diwaliUsers, setDiwaliUsers] = useState<DiwaliUser[] | null>(null);

  useEffect(() => {
    async function fetchDiwaliUsers() {
        const allUsers = await getUsers();
        const filteredUsers: DiwaliUser[] = [];
        allUsers.forEach(user => {
            const diwaliFund = user.loans.find(loan => loan.loanType === 'Diwali Fund' && loan.status === 'Active');
            if (diwaliFund) {
                filteredUsers.push({ user, fundDetails: diwaliFund });
            }
        });
        setDiwaliUsers(filteredUsers.sort((a, b) => new Date(b.fundDetails.createdAt).getTime() - new Date(a.fundDetails.createdAt).getTime()));
    }
    fetchDiwaliUsers();
  }, []);

  const handleUserDeleted = (deletedUserId: string) => {
    setDiwaliUsers(prevUsers => prevUsers ? prevUsers.filter(({ user }) => user.id !== deletedUserId) : null);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="பயனர்கள்"
        description="தீபாவளி சேமிப்புத் திட்டத்தில் செயலில் உள்ள அனைத்து உறுப்பினர்களின் பட்டியல்."
      >
        <div className="flex items-center gap-2">
          
          <Button asChild>
            <Link href="/dashboard/diwali-fund/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              புதிய பங்கேற்பாளர்
            </Link>
          </Button>
        </div>
      </PageHeader>
      
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {!diwaliUsers ? (
          Array.from({ length: 5 }).map((_, i) => <UserCardSkeleton key={i} />)
        ) : diwaliUsers.length > 0 ? (
          diwaliUsers.map((diwaliUser) => <DiwaliUserCard key={diwaliUser.user.id} diwaliUser={diwaliUser} onDelete={handleUserDeleted} />)
        ) : (
          <div className="col-span-full text-center text-muted-foreground py-16">
            <UserIcon className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">பங்கேற்பாளர்கள் இல்லை</h3>
            <p>தொடங்குவதற்கு ஒரு புதிய பங்கேற்பாளரைச் சேர்க்கவும்.</p>
          </div>
        )}
      </div>
    </div>
  );
}
