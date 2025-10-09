
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/page-header";
import { Camera, ArrowLeft, Loader2, RefreshCw, Minus, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import type { User, Loan } from "@/lib/data";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart, Cell } from "recharts";
import { addDays, addMonths, addYears, format } from "date-fns";
import { cn } from "@/lib/utils";


// --- Loan Application Form Component (previously from apply/page.tsx) ---

const LOAN_TYPE_CONFIG = {
  loan: { interestRate: 0.1, label: "சாதாரண கடன்" }, // 10%
  emi: { interestRate: 0.12, label: "EMI" }, // 12%
};

const PAYMENT_FREQUENCIES = ["தினசரி", "வாராந்திர", "மாதாந்திர", "வருடாந்திர"] as const;
type PaymentFrequency = (typeof PAYMENT_FREQUENCIES)[number];

function getDueDate(startDate: Date, frequency: PaymentFrequency): Date {
  switch (frequency) {
    case "தினசரி":
      return addDays(startDate, 1);
    case "வாராந்திர":
      return addDays(startDate, 7);
    case "மாதாந்திர":
      return addMonths(startDate, 1);
    case "வருடாந்திர":
      return addYears(startDate, 1);
  }
}

function ApplyLoanForm({ user, onLoanApplied, isDisabled }: { user: User | null, onLoanApplied: () => void, isDisabled: boolean }) {
  const router = useRouter();
  const { toast } = useToast();

  const [amount, setAmount] = useState(0);
  const [loanType, setLoanType] = useState<"loan" | "emi">();
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>();
  const [isSubmitting, setIsSubmitting] = useState(false);


  const interestRate = loanType ? LOAN_TYPE_CONFIG[loanType].interestRate : 0;
  const interest = amount * interestRate;
  const principal = amount;
  const disbursedAmount = principal - interest;
  const totalOwed = principal;
  const dueDate = paymentFrequency ? getDueDate(new Date(), paymentFrequency) : null;


  const chartData = [
    { name: "வழங்கப்பட்ட தொகை", value: disbursedAmount, fill: "hsl(var(--primary))" },
    { name: "வட்டி (முன்பணம்)", value: interest, fill: "hsl(var(--accent))" },
  ];

  const handleSubmit = async () => {
    if (!user) {
         toast({
          variant: "destructive",
          title: "பயனர் பதிவு செய்யப்படவில்லை!",
          description: `படி 1 ஐ முதலில் முடிக்கவும்.`,
        });
        return;
    }
    if (!loanType || !paymentFrequency || !dueDate) {
      toast({
        variant: "destructive",
        title: "முழுமையற்ற தகவல்",
        description: "கடன் வகை மற்றும் செலுத்தும் கால இடைவெளியைத் தேர்ந்தெடுக்கவும்.",
      });
      return;
    }

    setIsSubmitting(true);

    const tempUsersJson = localStorage.getItem('temp_new_users');
    const users: User[] = tempUsersJson ? JSON.parse(tempUsersJson) : [];
    const allLoansFlat = users.flatMap(u => u.loans);
    
    const newLoanId = `loan${allLoansFlat.length + 1}`;
    const newTxnId = `txn${Date.now().toString().slice(-5)}`;
    const createdAt = new Date();


    const newLoan: Loan = {
      id: newLoanId,
      userId: user.id,
      amountRequested: amount,
      interest,
      principal: disbursedAmount,
      totalOwed,
      amountRepaid: 0,
      status: 'Active',
      loanType: (loanType === 'loan' ? 'Loan' : 'EMI'),
      paymentFrequency: (paymentFrequency as 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'),
      createdAt: createdAt.toISOString(),
      dueDate: dueDate.toISOString(),
      transactions: [
        {
          id: newTxnId,
          loanId: newLoanId,
          type: 'Disbursement',
          amount: disbursedAmount,
          date: new Date().toISOString(),
        }
      ]
    };
    
    const userIndex = users.findIndex(u => u.id === user.id);
    if(userIndex !== -1) {
        users[userIndex].loans.push(newLoan);
        localStorage.setItem('temp_new_users', JSON.stringify(users));

        // Also update the separate loans object if it's still being used elsewhere
        const tempLoansJson = localStorage.getItem('temp_new_loans');
        const tempLoans = tempLoansJson ? JSON.parse(tempLoansJson) : {};
        if (!tempLoans[user.id]) {
          tempLoans[user.id] = [];
        }
        tempLoans[user.id].push(newLoan);
        localStorage.setItem('temp_new_loans', JSON.stringify(tempLoans));

        toast({
          title: "விண்ணப்பம் சமர்ப்பிக்கப்பட்டது!",
          description: `₹${totalOwed.toLocaleString('en-IN')} க்கான கடன் ${user.name}க்கு ஒப்புதல் அளிக்கப்பட்டது.`,
        });

        onLoanApplied(); // Trigger navigation
    } else {
         toast({
          variant: "destructive",
          title: "பயனர் கிடைக்கவில்லை!",
          description: `கடன் விண்ணப்பத்தைச் சேமிக்க முடியவில்லை.`,
        });
    }
     setIsSubmitting(false);
  };


  return (
     <div className={cn("space-y-6 mt-8", isDisabled && "opacity-50 pointer-events-none")}>
      <PageHeader title={`படி 2: கடன் விண்ணப்பம்`} description={user ? `${user.name}க்கான கடன் விவரங்களை உள்ளிடவும்` : `முதலில் படி 1 ஐ முடிக்கவும்`}/>

      <Card>
        <div className="grid md:grid-cols-2">
          {/* Left Side: Form */}
          <div className="p-6 flex flex-col">
            <CardHeader className="p-0 mb-6">
              <CardTitle>கடன் அமைப்பு</CardTitle>
              <CardDescription>
                தொகையைச் சரிசெய்து, கடன் வகையைத் தேர்ந்தெடுக்கவும்.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-0 space-y-8">
              <div className="space-y-4">
                <Label htmlFor="amount">கடன் தொகை (திருப்பிச் செலுத்த வேண்டிய மொத்தம்)</Label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-full"
                    onClick={() => setAmount(Math.max(0, amount - 1000))}
                    disabled={amount <= 0}
                  >
                    <Minus className="h-4 w-4" />
                    <span className="sr-only">குறை</span>
                  </Button>
                  <div className="flex-1 text-center">
                    <div className="text-3xl font-bold tracking-tighter">
                      ₹{amount.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-full"
                    onClick={() => setAmount(amount + 1000)}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">அதிகரி</span>
                  </Button>
                </div>
                <Slider
                  id="amount"
                  min={0}
                  max={100000}
                  step={1000}
                  value={[amount]}
                  onValueChange={(value) => setAmount(value[0])}
                />
              </div>

              <div className="space-y-4">
                <Label>கடன் வகை</Label>
                <RadioGroup
                  value={loanType}
                  onValueChange={(value: "loan" | "emi") => setLoanType(value)}
                  className="grid grid-cols-2 gap-4"
                >
                  {(Object.keys(LOAN_TYPE_CONFIG) as Array<keyof typeof LOAN_TYPE_CONFIG>).map((type) => (
                    <Label
                      key={type}
                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${loanType === type ? 'border-primary' : ''}`}
                    >
                      <RadioGroupItem value={type} className="sr-only" />
                      <span>{LOAN_TYPE_CONFIG[type].label}</span>
                      <span className="text-xs text-muted-foreground mt-1">({LOAN_TYPE_CONFIG[type].interestRate * 100}% வட்டி)</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label>செலுத்தும் கால இடைவெளி</Label>
                <RadioGroup
                  value={paymentFrequency}
                  onValueChange={(value: (typeof PAYMENT_FREQUENCIES)[number]) => setPaymentFrequency(value)}
                  className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  {PAYMENT_FREQUENCIES.map((freq) => (
                    <Label
                      key={freq}
                      className={`flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground text-sm ${paymentFrequency === freq ? 'border-primary' : ''}`}
                    >
                      <RadioGroupItem value={freq} className="sr-only" />
                      <span>{freq}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

            </CardContent>
          </div>

          {/* Right Side: Summary */}
          <div className="bg-muted/50 p-6 flex flex-col rounded-r-lg border-l">
            <CardHeader className="p-0 mb-6">
              <CardTitle>கடன் விவரம்</CardTitle>
              <CardDescription>
                நீங்கள் கோரிய கடனின் விவரங்கள்.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-grow flex flex-col items-center justify-center">
              <div className="w-full max-w-[250px] aspect-square">
                <ChartContainer config={{}} className="min-h-[250px]">
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      strokeWidth={5}
                      activeIndex={0}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </div>

              <div className="w-full max-w-sm space-y-3 text-sm">
                <Separator className="my-4" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">கடன் தொகை:</span>
                  <span className="font-medium">
                    ₹{disbursedAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                   <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    <span>வட்டி ({interestRate * 100}%, முன்பணம்):</span>
                  </div>
                  <span className="font-medium">
                    ₹{interest.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">செலுத்த வேண்டிய தேதி:</span>
                    <span className="font-medium">
                        {dueDate ? format(dueDate, 'PPP') : 'கி/இ'}
                    </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold text-base">
                  <span>திருப்பிச் செலுத்த வேண்டிய மொத்தம்:</span>
                  <span>₹{totalOwed.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </CardContent>
          </div>
        </div>
         <CardFooter className="p-0 pt-6">
            <Button onClick={handleSubmit} disabled={isSubmitting || amount <= 0 || !loanType || !paymentFrequency} className="w-full" size="lg">
                 {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        விண்ணப்பத்தை சமர்ப்பிக்கிறது...
                    </>
                ) : (
                    "விண்ணப்பத்தை சமர்ப்பித்து முடிக்கவும்"
                )}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}


// --- User Registration Form Component ---

function LoanUserForm({ onUserRegistered, isDisabled }: { onUserRegistered: (user: User) => void, isDisabled: boolean }) {
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
    const enableCamera = async () => {
        if (!isCameraOpen) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error('கேமராவை அணுகுவதில் பிழை:', error);
            setHasCameraPermission(false);
            toast({
                variant: 'destructive',
                title: 'கேமரா அணுகல் மறுக்கப்பட்டது',
                description: 'பயன்பாட்டைப் பயன்படுத்த, உங்கள் உலாவி அமைப்புகளில் கேமரா அனுமதிகளை இயக்கவும்.',
            });
        }
    };
    enableCamera();

    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
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
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/png');
        setFaceImageBase64(dataUri);
        setIsCameraOpen(false); // Close camera view
      }
    }
  };
  
  const retakePhoto = () => {
    setFaceImageBase64(null);
    setIsCameraOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faceImageBase64) {
      toast({
        variant: "destructive",
        title: "முகம் படம் இல்லை",
        description: "பயனரை உருவாக்கும் முன், முகப் படத்தைப் பிடிக்கவும்.",
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
        registrationType: 'Loan' as const,
      };
      
      const tempUsersJson = localStorage.getItem('temp_new_users');
      const tempUsers = tempUsersJson ? JSON.parse(tempUsersJson) : [];
      tempUsers.push(newUser);
      localStorage.setItem('temp_new_users', JSON.stringify(tempUsers));

      toast({
        title: "பயனர் உருவாக்கப்பட்டார்",
        description: `${name} வெற்றிகரமாக பதிவு செய்யப்பட்டார். இப்போது கடன் விவரங்களை உள்ளிடவும்.`,
      });
      
      onUserRegistered(newUser);

      setIsSubmitting(false);
    }, 1000);
  };
  
  return (
      <form onSubmit={handleSubmit} className={cn("space-y-4 pt-6", isDisabled && "opacity-50 pointer-events-none")}>
        <PageHeader title="படி 1: பயனர் பதிவு" />
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>தனிப்பட்ட தகவல்</CardTitle>
                <CardDescription>
                  புதிய விண்ணப்பதாரரின் விவரங்களை நிரப்பவும்.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">முழு பெயர்</Label>
                  <Input
                    id="name"
                    placeholder="எ.கா., விராட்"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact">தொடர்பு எண்</Label>
                  <Input
                    id="contact"
                    placeholder="எ.கா., +91 98765 43210"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="id-proof">அடையாளச் சான்று (ஆதார்)</Label>
                  <Input
                    id="id-proof"
                    placeholder="எ.கா., ஆதார் எண்"
                    value={idProof}
                    onChange={(e) => setIdProof(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>முகப் புகைப்படம்</CardTitle>
                <CardDescription>
                  விண்ணப்பதாரரின் முகத்தின் தெளிவான படத்தைப் பிடிக்கவும்.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col items-center justify-center space-y-4">
                <div 
                  className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed overflow-hidden cursor-pointer"
                  onClick={!isCameraOpen && !faceImageBase64 ? openCamera : undefined}
                >
                  {faceImageBase64 ? (
                    <img src={faceImageBase64} alt="Captured face" className="w-full h-full object-cover" />
                  ) : isCameraOpen ? (
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                  ) : (
                    <Camera className="h-16 w-16 text-muted-foreground" />
                  )}
                  <canvas ref={canvasRef} className="hidden"></canvas>
                </div>

                {hasCameraPermission === false && (
                  <Alert variant="destructive" className="text-xs">
                    <AlertTitle>கேமரா அணுகல் மறுக்கப்பட்டது</AlertTitle>
                    <AlertDescription>
                      தொடர, உங்கள் உலாவியில் கேமரா அணுகலை வழங்கவும்.
                    </AlertDescription>
                  </Alert>
                )}
                
                {faceImageBase64 ? (
                  <Button type="button" variant="outline" onClick={retakePhoto} disabled={isSubmitting}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    மீண்டும் படம் எடு
                  </Button>
                ) : isCameraOpen ? (
                    <Button type="button" onClick={captureFace} disabled={isSubmitting || hasCameraPermission === false}>
                      <Camera className="mr-2 h-4 w-4" />
                      படம் பிடி
                    </Button>
                ) : (
                  <Button type="button" onClick={openCamera} disabled={isSubmitting}>
                     <Camera className="mr-2 h-4 w-4" />
                    கேமராவைத் திற
                  </Button>
                )}

              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={isSubmitting || !faceImageBase64}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                பயனரை உருவாக்குக হচ্ছে...
              </>
            ) : (
              "பயனரை உருவாக்கி தொடரவும்"
            )}
          </Button>
        </div>
      </form>
  );
}


// --- Main Page Component ---

export default function NewUserPage() {
  const router = useRouter();
  const [registeredUser, setRegisteredUser] = useState<User | null>(null);

  const handleUserRegistered = (user: User) => {
    setRegisteredUser(user);
  };
  
  const handleLoanApplied = () => {
    if (registeredUser) {
      router.push(`/dashboard/users/${registeredUser.id}`);
    } else {
      router.push('/dashboard/users');
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="கடன் / EMIக்கு புதிய பயனரைப் பதிவு செய்யவும்"
        description="புதிய பயனரைச் சேர்த்து உடனடியாக கடன் விண்ணப்பத்தை முடிக்கவும்."
      >
        <Button asChild variant="outline">
          <Link href="/dashboard/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            பயனர்கள் பக்கத்திற்குத் திரும்பு
          </Link>
        </Button>
      </PageHeader>
      
      <LoanUserForm onUserRegistered={handleUserRegistered} isDisabled={!!registeredUser} />
      
      <Separator className="my-8"/>

      <ApplyLoanForm user={registeredUser} onLoanApplied={handleLoanApplied} isDisabled={!registeredUser} />
    </div>
  );
}
