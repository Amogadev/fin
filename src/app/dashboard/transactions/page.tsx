
"use client";

import { getUsers, type DiwaliFundParticipant } from "@/lib/data";
import PageHeader from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { use, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function DiwaliFundTableSkeleton() {
    return (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>சிட் எண்</TableHead>
                <TableHead>உறுப்பினர் பெயர்</TableHead>
                <TableHead>செலுத்திய வாரங்களின் எண்ணிக்கை</TableHead>
                <TableHead className="text-right">செலுத்திய மொத்த தொகை</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default function DiwaliFundReportPage() {
  const [participantsPromise, setParticipantsPromise] = useState<Promise<DiwaliFundParticipant[]>>();

  useEffect(() => {
    const fetchParticipants = async () => {
        const users = await getUsers();
        const participants: DiwaliFundParticipant[] = [];

        users.forEach(user => {
            const diwaliFund = user.loans.find(loan => loan.loanType === 'Diwali Fund');
            if (diwaliFund) {
                const weeksPaid = diwaliFund.transactions.filter(tx => tx.type === 'Repayment').length;
                participants.push({
                    chitNumber: diwaliFund.id,
                    memberName: user.name,
                    weeksPaid: weeksPaid,
                    totalAmountPaid: diwaliFund.amountRepaid,
                });
            }
        });
        return participants.sort((a,b) => b.totalAmountPaid - a.totalAmountPaid);
    };
    
    setParticipantsPromise(fetchParticipants());
  }, []);
  
  if (!participantsPromise) {
    return (
         <div className="space-y-4">
            <PageHeader
                title="தீபாவளி சிட் அறிக்கை"
                description="தீபாவளி சேமிப்புத் திட்டத்தில் பங்கேற்பாளர்களின் கண்ணோட்டம்."
            />
            <Card>
                <CardContent className="pt-6">
                    <DiwaliFundTableSkeleton />
                </CardContent>
            </Card>
        </div>
    )
  }

  const participants = use(participantsPromise);

  return (
    <div className="space-y-4">
      <PageHeader
        title="தீபாவளி சிட் அறிக்கை"
        description="தீபாவளி சேமிப்புத் திட்டத்தில் பங்கேற்பாளர்களின் கண்ணோட்டம்."
      />
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>சிட் எண்</TableHead>
                <TableHead>உறுப்பினர் பெயர்</TableHead>
                <TableHead>செலுத்திய வாரங்களின் எண்ணிக்கை</TableHead>
                <TableHead className="text-right">செலுத்திய மொத்த தொகை</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.length > 0 ? (
                participants.map((p) => (
                  <TableRow key={p.chitNumber}>
                    <TableCell className="font-mono">{p.chitNumber}</TableCell>
                    <TableCell>{p.memberName}</TableCell>
                    <TableCell>{p.weeksPaid}</TableCell>
                    <TableCell className="text-right">
                      ₹{p.totalAmountPaid.toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    தீபாவளி சிட் திட்டத்தில் பங்கேற்பாளர்கள் யாரும் இல்லை.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
