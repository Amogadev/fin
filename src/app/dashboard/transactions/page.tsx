import { getAllTransactions } from "@/lib/data";
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

export default async function TransactionsPage() {
  const transactions = await getAllTransactions();

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
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono">{tx.id}</TableCell>
                  <TableCell>{tx.userName}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        tx.type === "Repayment" ? "secondary" : "outline"
                      }
                    >
                      {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell>₹{tx.amount.toLocaleString("en-IN")}</TableCell>
                  <TableCell className="text-right">
                    {format(new Date(tx.date), "PPpp")}
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
