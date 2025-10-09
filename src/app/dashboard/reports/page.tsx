
"use client";

import { use, useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import PageHeader from "@/components/page-header";
import { getLoanReports, getDiwaliFundReports, type LoanReport, type DiwaliFundReport } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

function LoanReportTable({ loans }: { loans: LoanReport[] }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>பயனர் பெயர்</TableHead>
                    <TableHead>கடன் வாங்கிய தேதி</TableHead>
                    <TableHead>வழங்கப்பட்ட தொகை</TableHead>
                    <TableHead className="text-right">நிலுவையிலுள்ள தொகை</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loans.length > 0 ? loans.map(loan => (
                    <TableRow key={loan.loanId}>
                        <TableCell>{loan.userName}</TableCell>
                        <TableCell>{format(new Date(loan.startDate), 'PPP')}</TableCell>
                        <TableCell>₹{loan.disbursedAmount.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right">₹{loan.remainingBalance.toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">செயலில் கடன்கள் இல்லை.</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}

function DiwaliFundReportTable({ funds }: { funds: DiwaliFundReport[] }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>பயனர் பெயர்</TableHead>
                    <TableHead>பங்களிப்பு</TableHead>
                    <TableHead>கால இடைவெளி</TableHead>
                    <TableHead className="text-right">முடிவு தேதி</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {funds.length > 0 ? funds.map(fund => (
                    <TableRow key={fund.userId}>
                        <TableCell>{fund.userName}</TableCell>
                        <TableCell>₹{fund.contributionAmount.toLocaleString('en-IN')}</TableCell>
                        <TableCell>{fund.frequency}</TableCell>
                        <TableCell className="text-right">{format(new Date(fund.endDate), 'PPP')}</TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">தீபாவளி சேமிப்புத் திட்டத்தில் பயனர்கள் இல்லை.</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}

function ReportsSkeleton() {
    return (
        <div className="space-y-4">
            <PageHeader title="அறிக்கைகள் ஏற்றப்படுகின்றன..." description="செயலில் உள்ள திட்டங்களின் கண்ணோட்டம்." />
            <Tabs defaultValue="loans" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="loans">கடன்</TabsTrigger>
                    <TabsTrigger value="funds">தீபாவளி சேமிப்புத் திட்டம்</TabsTrigger>
                </TabsList>
                 <Card className="mt-2">
                    <CardContent className="pt-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                                    <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                                    <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                                    <TableHead className="text-right"><Skeleton className="h-5 w-28 ml-auto" /></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-5 w-28 ml-auto" /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </Tabs>
        </div>
    )
}

function ReportsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab') || 'loans';
    
    const [dataPromise, setDataPromise] = useState<Promise<{ loans: LoanReport[]; funds: DiwaliFundReport[] }> | null>(null);

    useEffect(() => {
        // This effect runs whenever the 'tab' changes.
        // It sets a new promise into state, which will cause the component
        // to re-suspend via the use() hook until the new data is fetched.
        setDataPromise(
            Promise.all([getLoanReports(), getDiwaliFundReports()]).then(([loans, funds]) => ({ loans, funds }))
        );
    }, [tab]); // The dependency array is key. This re-runs the effect ONLY when the tab changes.
    
    // The component will suspend here if dataPromise is null on the first render,
    // allowing the parent <Suspense> boundary to show the skeleton.
    if (!dataPromise) {
        return null;
    }
    
    // The `use` hook will "unwrap" the promise. While the promise is pending,
    // it will pause rendering and let the nearest <Suspense> boundary show its fallback.
    const { loans, funds } = use(dataPromise);

    const handleTabChange = (value: string) => {
        // Update the URL without a full page reload. This triggers the `useEffect` above.
        router.push(`/dashboard/reports?tab=${value}`, { scroll: false });
    };
    
    const pageTitle = "அறிக்கைகள்";
    const pageDescription = "செயலில் உள்ள திட்டங்களின் கண்ணோட்டம்.";

    return (
        <div className="space-y-4">
            <PageHeader title={pageTitle} description={pageDescription} />
            <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="loans">கடன்</TabsTrigger>
                    <TabsTrigger value="funds">தீபாவளி சேமிப்புத் திட்டம்</TabsTrigger>
                </TabsList>
                <TabsContent value="loans">
                    <Card>
                        <CardContent className="pt-6">
                           <LoanReportTable loans={loans} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="funds">
                     <Card>
                        <CardContent className="pt-6">
                           <DiwaliFundReportTable funds={funds} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default function ReportsPage() {
    return (
        <Suspense fallback={<ReportsSkeleton />}>
            <ReportsPageContent />
        </Suspense>
    )
}
