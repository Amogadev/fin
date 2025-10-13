
"use client";

import { getUsers, User, Loan } from "@/lib/data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft, User as UserIcon } from "lucide-react";
import PageHeader from "@/components/page-header";
import { use, useEffect, useState } from "react";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

type DiwaliUser = {
  user: User;
  fundDetails: Loan;
};

function DiwaliUsersTable({ users }: { users: DiwaliUser[] }) {
    return (
        <Card>
            <CardContent className="pt-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>உறுப்பினர் பெயர்</TableHead>
                            <TableHead>சேமிப்பு இலக்கு</TableHead>
                            <TableHead>தொடங்கிய தேதி</TableHead>
                            <TableHead className="text-right">மீதமுள்ள பங்களிப்பு</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(({ user, fundDetails }) => {
                            const remainingContribution = fundDetails.totalOwed - fundDetails.amountRepaid;
                            return (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Image
                                                src={user.faceImageUrl}
                                                alt={user.name}
                                                width={40}
                                                height={40}
                                                className="rounded-full object-cover"
                                            />
                                            <Link href={`/dashboard/users/${user.id}`} className="font-medium hover:underline">
                                                {user.name}
                                            </Link>
                                        </div>
                                    </TableCell>
                                    <TableCell>₹{fundDetails.totalOwed.toLocaleString('en-IN')}</TableCell>
                                    <TableCell>{format(new Date(fundDetails.createdAt), 'PPP')}</TableCell>
                                    <TableCell className="text-right">₹{remainingContribution.toLocaleString('en-IN')}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function UsersTableSkeleton() {
    return (
        <Card>
            <CardContent className="pt-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-28" /></TableHead>
                            <TableHead className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <Skeleton className="h-5 w-24" />
                                    </div>
                                </TableCell>
                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
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
        setDiwaliUsers(filteredUsers);
    }
    fetchDiwaliUsers();
  }, []);


  return (
    <div className="space-y-4 p-4 md:p-6 lg:p-8">
      <PageHeader
        title="தீபாவளி சிட் பங்கேற்பாளர்கள்"
        description="தீபாவளி சேமிப்புத் திட்டத்தில் செயலில் உள்ள அனைத்து உறுப்பினர்களின் பட்டியல்."
      >
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              பின்செல்
            </Link>
          </Button>
          <Button asChild>
            <Link href="/diwali-fund/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              புதிய பங்கேற்பாளர்
            </Link>
          </Button>
        </div>
      </PageHeader>
      
      {!diwaliUsers ? (
          <UsersTableSkeleton />
        ) : diwaliUsers.length > 0 ? (
          <DiwaliUsersTable users={diwaliUsers} />
        ) : (
          <Card className="col-span-full text-center text-muted-foreground py-16">
            <CardContent>
                 <UserIcon className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold">பங்கேற்பாளர்கள் இல்லை</h3>
                <p>தீபாவளி சிட் திட்டத்தில் யாரும் சேரவில்லை.</p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
