import { notFound } from "next/navigation";
import { getUserById } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
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
import { format } from "date-fns";
import { ShieldCheck, PlusCircle, ArrowLeft } from "lucide-react";

export default async function UserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getUserById(params.id);

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader title={user.name} description={`User ID: ${user.id}`}>
        <Button asChild variant="outline">
          <Link href="/dashboard/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All Users
          </Link>
        </Button>
      </PageHeader>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <Image
                  src={user.faceImageUrl}
                  alt={user.name}
                  width={128}
                  height={128}
                  className="rounded-full border-4 border-primary/20 shadow-lg object-cover"
                  data-ai-hint="person portrait"
                />
              </div>
              <div className="text-sm space-y-2">
                <p>
                  <strong>Contact:</strong> {user.contact}
                </p>
                <p>
                  <strong>ID Proof:</strong> {user.idProof}
                </p>
                <p>
                  <strong>Member Since:</strong>{" "}
                  {format(new Date(user.createdAt), "PPP")}
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button asChild>
                  <Link href={`/dashboard/users/${user.id}/apply`}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Apply for Loan/EMI
                  </Link>
                </Button>
                <Button asChild variant="accent">
                  <Link href={`/dashboard/users/${user.id}/verify`}>
                    <ShieldCheck className="mr-2 h-4 w-4" /> Verify Identity
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Loan History</CardTitle>
              <CardDescription>
                All loans and EMIs taken by {user.name}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Repaid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.loans.length > 0 ? (
                    user.loans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell className="font-mono">{loan.id}</TableCell>
                        <TableCell>
                          ₹{loan.totalOwed.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              loan.status === "Overdue"
                                ? "destructive"
                                : loan.status === "Active"
                                ? "outline"
                                : "secondary"
                            }
                          >
                            {loan.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{loan.amountRepaid.toLocaleString("en-IN")} / ₹
                          {loan.totalOwed.toLocaleString("en-IN")}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground h-24"
                      >
                        No loans taken yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
