
"use client";

import { getAllTransactions, TransactionWithUser } from "@/lib/data";
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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { use, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function TransactionTableSkeleton() {
    return (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-40 ml-auto" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}


export default function TransactionsPage() {
  const [transactionsPromise, setTransactionsPromise] = useState<Promise<TransactionWithUser[]>>();

  useEffect(() => {
    setTransactionsPromise(getAllTransactions());
  }, []);
  
  if (!transactionsPromise) {
    return (
         <div className="space-y-4">
            <PageHeader
                title="All Transactions"
                description="An audit log of all loan disbursements and repayments."
            />
            <Card>
                <CardContent className="pt-6">
                    <TransactionTableSkeleton />
                </CardContent>
            </Card>
        </div>
    )
  }

  const transactions = use(transactionsPromise);

  return (
    <div className="space-y-4">
      <PageHeader
        title="All Transactions"
        description="An audit log of all loan disbursements and repayments."
      />
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono">{tx.id}</TableCell>
                    <TableCell>{tx.userName}</TableCell>
                    <TableCell>₹{tx.amount.toLocaleString("en-IN")}</TableCell>
                     <TableCell>
                      <Badge variant={tx.type === 'Disbursement' ? 'destructive' : 'success'}>
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {format(new Date(tx.date), "PPpp")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No transactions yet. Create a user and issue a loan to see
                    transactions here.
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
