
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/page-header";
import { Camera, ArrowLeft, Loader2, RefreshCw, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import type { User, Loan } from "@/lib/data";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { differenceInWeeks, differenceInMonths, addWeeks, addMonths } from 'date-fns';

const CONTRIBUTION_AMOUNTS = [100, 1000, 5000];
const FREQUENCIES = ["வாராந்திர", "மாதாந்திர"];
const DIWALI_DATE = new Date(new Date().getFullYear(), 10, 1); // Approx. Nov 1st

function DiwaliPlanForm({ user, onPlanSubmitted, isDisabled }: { user: User | null, onPlanSubmitted: () => void, isDisabled: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contribution, setContribution] = useState<number | undefined>();
  const [frequency, setFrequency] = useState<"வாராந்திர" | "மாதாந்திர" | undefined>();
  
  const numberOfPayments = useMemo(() => {
    if (!frequency) return 0;
    const now = new Date();
    if (frequency === 'வாராந்திர') {
        return differenceInWeeks(DIWALI_DATE, now);
    } else { // Monthly
        return differenceInMonths(DIWALI_DATE, now);
    }
  }, [frequency]);
  
  const totalContribution = useMemo(() => {
    if (!contribution || !numberOfPayments) return 0;
    return contribution * numberOfPayments;
  }, [contribution, numberOfPayments]);

  const estimatedReturn = useMemo(() => {
    if (!totalContribution) return 0;
    return totalContribution * 1.10; // 10% bonus
  }, [totalContribution]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contribution || !frequency || !user) {
      toast({
        variant: "destructive",
        title: "முழுமையற்ற தகவல்",
        description: "பங்களிப்புத் திட்டத்தைத் தேர்ந்தெடுக்கவும்.",
      });
      return;
    }

    setIsSubmitting(true);
    
    const nextPaymentDate = frequency === 'வாராந்திர' ? addWeeks(new Date(), 1) : addMonths(new Date(), 1);
    const createdAt = new Date();

    const allUsersJson = localStorage.getItem('temp_new_users');
    const allUsers: User[] = allUsersJson ? JSON.parse(allUsersJson) : [];
    
    const allLoansJson = localStorage.getItem('temp_new_loans');
    const allLoans: Record<string, Loan[]> = allLoansJson ? JSON.parse(allLoansJson) : {};
    
    const userIndex = allUsers.findIndex(u => u.id === user.id);
    if(userIndex === -1) {
        toast({ variant: "destructive", title: "பயனர் கிடைக்கவில்லை!" });
        setIsSubmitting(false);
        return;
    }

    const newLoanId = `diwali${user.id}${Date.now().toString().slice(-3)}`;
    const newTxnId = `txn${Date.now().toString().slice(-5)}`;

    const newFundLoan: Loan = {
        id: newLoanId,
        userId: user.id,
        amountRequested: totalContribution,
        interest: totalContribution * 0.10,
        principal: 0, // No disbursement
        totalOwed: totalContribution, // This is the savings goal
        amountRepaid: contribution, // First contribution is made now
        status: 'Active',
        loanType: 'Diwali Fund',
        paymentFrequency: (frequency === 'வாராந்திர' ? 'Weekly' : 'Monthly'),
        createdAt: createdAt.toISOString(),
        dueDate: nextPaymentDate.toISOString(),
        transactions: [
            {
                id: newTxnId,
                loanId: newLoanId,
                type: 'Repayment', // Contribution is like a repayment to their own fund
                amount: contribution,
                date: createdAt.toISOString(),
            }
        ]
    };
    
    if (!allLoans[user.id]) {
      allLoans[user.id] = [];
    }
    allLoans[user.id].push(newFundLoan);
    
    allUsers[userIndex].loans.push(newFundLoan);

    // Simulate submission
    setTimeout(() => {
      localStorage.setItem('temp_new_users', JSON.stringify(allUsers));
      localStorage.setItem('temp_new_loans', JSON.stringify(allLoans));

      const confirmationDetails = {
        name: user.name,
        contribution,
        frequency,
        estimatedReturn,
        nextPaymentDate: nextPaymentDate.toISOString(),
      }
      localStorage.setItem('diwali_fund_confirmation', JSON.stringify(confirmationDetails));
      
      toast({
        title: "வெற்றிகரமாக சேர்ந்தீர்கள்!",
        description: `தீபாவளி சேமிப்புத் திட்டத்திற்கு வரவேற்கிறோம், ${user.name}!`,
      });
      
      onPlanSubmitted();

      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className={cn("space-y-6 mt-8", isDisabled && "opacity-50 pointer-events-none")}>
        <PageHeader 
            title={`படி 2: பங்களிப்புத் திட்டம்`} 
            description={user ? `${user.name}க்கான திட்டத்தைத் தேர்ந்தெடுக்கவும்` : 'முதலில் படி 1 ஐ முடிக்கவும்'}
        />
        <form onSubmit={handleSubmit} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>பங்களிப்புத் திட்டம்</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>பங்களிப்புத் தொகை</Label>
                            <Select value={contribution?.toString()} onValueChange={(val) => setContribution(Number(val))}>
                                <SelectTrigger><SelectValue placeholder="தொகையைத் தேர்ந்தெடுக்கவும்" /></SelectTrigger>
                                <SelectContent>
                                    {CONTRIBUTION_AMOUNTS.map(amount => (
                                        <SelectItem key={amount} value={amount.toString()}>₹{amount.toLocaleString('en-IN')}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>கால இடைவெளி</Label>
                            <Select value={frequency} onValueChange={(val: "வாராந்திர" | "மாதாந்திர") => setFrequency(val)}>
                                <SelectTrigger><SelectValue placeholder="கால இடைவெளியைத் தேர்ந்தெடுக்கவும்" /></SelectTrigger>
                                <SelectContent>
                                    {FREQUENCIES.map(freq => (
                                        <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-8">
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>இது எப்படி வேலை செய்கிறது</AlertTitle>
                    <AlertDescription>
                    ₹100, ₹1,000, அல்லது ₹5,000 வாராந்திரம் அல்லது மாதாந்திரம் சேமித்து, தீபாவளி அன்று <span className="font-bold text-primary">+10% போனஸ்</span> பெறுங்கள். முன்கூட்டியே எடுத்தால் உங்கள் மொத்த சேமிப்பில் 10% கழிக்கப்படும்.
                    </AlertDescription>
                </Alert>
                <Card className="bg-primary text-primary-foreground">
                    <CardHeader>
                        <CardTitle>மதிப்பிடப்பட்ட தீபாவளி வருமானம்</CardTitle>
                        <CardDescription className="text-primary-foreground/80">உங்கள் மொத்த பங்களிப்பு மற்றும் உங்கள் 10% போனஸ்.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">₹{Math.round(estimatedReturn).toLocaleString('en-IN')}</p>
                    </CardContent>
                </Card>
            </div>

            <CardFooter className="p-0 pt-4">
              <Button type="submit" size="lg" disabled={isSubmitting || !contribution || !frequency} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    சேர்க்கப்படுகிறது...
                  </>
                ) : (
                  "இப்போது சேர்ந்து முடிக்கவும்"
                )}
              </Button>
            </CardFooter>
        </form>
    </div>
  );
}

function UserRegistrationForm({ onUserRegistered, isDisabled }: { onUserRegistered: (user: User) => void, isDisabled: boolean }) {
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [idProof, setIdProof] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [faceImageBase64, setFaceImageBase64] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const enableCamera = async () => {
      if (isCameraOpen) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error("கேமராவை அணுகுவதில் பிழை:", error);
          setHasCameraPermission(false);
          toast({
            variant: "destructive",
            title: "கேமரா அணுகல் மறுக்கப்பட்டது",
            description: "பயன்பாட்டைப் பயன்படுத்த, உங்கள் உலாவி அமைப்புகளில் கேமரா அனுமதிகளை இயக்கவும்.",
          });
        }
      }
    };
    enableCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraOpen, toast]);

  const openCamera = async () => {
    setFaceImageBase64(null);
    const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
    if (permission.state === 'denied') {
        toast({
            variant: 'destructive',
            title: 'கேமரா அணுகல் மறுக்கப்பட்டது',
            description: 'பயன்பாட்டைப் பயன்படுத்த, உங்கள் உலாவி அமைப்புகளில் கேமரா அனுமதிகளை இயக்கவும்.',
        });
        setHasCameraPermission(false);
        return;
    }
    setHasCameraPermission(true);
    setIsCameraOpen(true);
  }

  const captureFace = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/png');
        
        // Stop video stream
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        video.srcObject = null;

        setFaceImageBase64(dataUri);
        setIsCameraOpen(false);
      }
    }
  };

  const retakePhoto = () => {
    setFaceImageBase64(null);
    openCamera();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faceImageBase64 || !name || !contact || !idProof) {
      toast({
        variant: "destructive",
        title: "முழுமையற்ற தகவல்",
        description: "தொடர, அனைத்து புலங்களையும் பூர்த்தி செய்து ஒரு புகைப்படத்தைப் பிடிக்கவும்.",
      });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newUser: User = {
        id: `user${Date.now().toString().slice(-4)}`,
        name,
        contact,
        idProof,
        faceImageUrl: faceImageBase64,
        createdAt: new Date().toISOString(),
        loans: [],
        registrationType: 'Diwali Fund' as const,
      };

      const tempUsersJson = localStorage.getItem('temp_new_users');
      const tempUsers = tempUsersJson ? JSON.parse(tempUsersJson) : [];
      tempUsers.push(newUser);
      localStorage.setItem('temp_new_users', JSON.stringify(tempUsers));
      
      toast({
        title: "பயனர் விவரங்கள் சேமிக்கப்பட்டன!",
        description: `${name} க்கான பங்களிப்புத் திட்டத்தை அமைக்க தொடரவும்.`,
      });
      
      onUserRegistered(newUser);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className={cn("space-y-6", isDisabled && "opacity-50 pointer-events-none")}>
        <PageHeader 
            title="படி 1: பயனர் பதிவு" 
            description="சரிபார்ப்புக்காக உங்கள் தகவலை வழங்கவும்."
        />
        <form onSubmit={handleSubmit} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>உங்கள் விவரங்கள்</CardTitle>
                    <CardDescription>
                    தயவுசெய்து உங்கள் தகவலை அளித்து, சரிபார்ப்புக்காக ஒரு புகைப்படத்தைப் பிடிக்கவும்.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-8">
                    {/* Left side: Form inputs */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="space-y-2">
                        <Label htmlFor="name">முழு பெயர்</Label>
                        <Input id="name" placeholder="எ.கா., பிரியா" value={name} onChange={(e) => setName(e.target.value)} required disabled={isSubmitting} />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="id-proof">ஆதார் எண்</Label>
                            <Input id="id-proof" placeholder="எ.கா., 1234 5678 9012" value={idProof} onChange={(e) => setIdProof(e.target.value)} required disabled={isSubmitting}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact">தொலைபேசி எண்</Label>
                            <Input id="contact" placeholder="எ.கா., +91 98765 43210" value={contact} onChange={(e) => setContact(e.target.value)} required disabled={isSubmitting}/>
                        </div>
                        </div>
                    </div>

                    {/* Right side: Face Capture */}
                    <div className="space-y-2 flex flex-col items-center">
                        <Label className="text-center w-full">முகப் புகைப்படம்</Label>
                        <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed overflow-hidden">
                        {faceImageBase64 ? (
                            <img src={faceImageBase64} alt="Captured face" className="w-full h-full object-cover" />
                        ) : isCameraOpen ? (
                            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                        ) : (
                            <div onClick={openCamera} className="cursor-pointer">
                            <Camera className="h-16 w-16 text-muted-foreground" />
                            </div>
                        )}
                        <canvas ref={canvasRef} className="hidden"></canvas>
                        </div>
                        {hasCameraPermission === false && (
                        <Alert variant="destructive" className="text-xs">
                            <AlertTitle>கேமரா அணுகல் மறுக்கப்பட்டது</AlertTitle>
                        </Alert>
                        )}
                        {faceImageBase64 ? (
                        <Button type="button" variant="outline" onClick={retakePhoto} disabled={isSubmitting} className="w-full max-w-xs">
                            <RefreshCw className="mr-2 h-4 w-4" /> மீண்டும் படம் எடு
                        </Button>
                        ) : isCameraOpen ? (
                        <Button type="button" onClick={captureFace} disabled={isSubmitting || hasCameraPermission === false} className="w-full max-w-xs">
                            <Camera className="mr-2 h-4 w-4" /> படம் பிடி
                        </Button>
                        ) : (
                        <Button type="button" onClick={openCamera} disabled={isSubmitting} className="w-full max-w-xs">
                            <Camera className="mr-2 h-4 w-4" /> கேமராவைத் திற
                        </Button>
                        )}
                    </div>
                    </div>
                </CardContent>
            </Card>

            <CardFooter className="p-0 pt-4">
                <Button type="submit" size="lg" disabled={isSubmitting || !faceImageBase64} className="w-full">
                    {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        பயனரைச் சேமிக்கிறது...
                    </>
                    ) : (
                    "பயனரை உருவாக்கி தொடரவும்"
                    )}
                </Button>
            </CardFooter>
        </form>
    </div>
  );
}

export default function NewDiwaliFundParticipantPage() {
  const router = useRouter();
  const [registeredUser, setRegisteredUser] = useState<User | null>(null);

  const handleUserRegistered = (user: User) => {
    setRegisteredUser(user);
  };

  const handlePlanSubmitted = () => {
    router.push(`/diwali-fund/confirmation`);
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="தீபாவளி சேமிப்புத் திட்டத்தில் சேரவும்"
        description="புதிய பயனரைச் சேர்த்து உடனடியாக உங்கள் சேமிப்புத் திட்டத்தைத் தொடங்கவும்."
      >
        <Button asChild variant="outline">
          <Link href="/diwali-fund">
            <ArrowLeft className="mr-2 h-4 w-4" />
            பங்கேற்பாளர் பட்டியலுக்குத் திரும்பு
          </Link>
        </Button>
      </PageHeader>
      
      <UserRegistrationForm onUserRegistered={handleUserRegistered} isDisabled={!!registeredUser} />

      <Separator className="my-8"/>

      <DiwaliPlanForm user={registeredUser} onPlanSubmitted={handlePlanSubmitted} isDisabled={!registeredUser} />
    </div>
  );
}
