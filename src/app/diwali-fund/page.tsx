
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
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/page-header";
import { Camera, ArrowLeft, Loader2, RefreshCw, Info, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { differenceInWeeks, differenceInMonths, addWeeks, addMonths, format } from 'date-fns';

const CONTRIBUTION_AMOUNTS = [100, 1000, 5000];
const FREQUENCIES = ["Weekly", "Monthly"];
const DIWALI_DATE = new Date(new Date().getFullYear(), 10, 1); // Approx. Nov 1st

export default function DiwaliFundPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [idProof, setIdProof] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [faceImageBase64, setFaceImageBase64] = useState<string | null>(null);

  const [contribution, setContribution] = useState<number | undefined>();
  const [frequency, setFrequency] = useState<string | undefined>();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const numberOfPayments = useMemo(() => {
    if (!frequency) return 0;
    const now = new Date();
    if (frequency === 'Weekly') {
        return differenceInWeeks(DIWALI_DATE, now);
    } else { // Monthly
        return differenceInMonths(DIWALI_DATE, now);
    }
  }, [frequency]);

  const estimatedReturn = useMemo(() => {
    if (!contribution || !numberOfPayments) return 0;
    return contribution * numberOfPayments * 1.10;
  }, [contribution, numberOfPayments]);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    };

    if (!faceImageBase64) {
      getCameraPermission();
    }
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast, faceImageBase64]);

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
        setFaceImageBase64(dataUri);
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  };

  const retakePhoto = () => {
    setFaceImageBase64(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faceImageBase64 || !contribution || !frequency || !name || !contact || !idProof) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill all fields and capture a photo.",
      });
      return;
    }

    setIsSubmitting(true);
    
    const nextPaymentDate = frequency === 'Weekly' ? addWeeks(new Date(), 1) : addMonths(new Date(), 1);

    const fundDetails = {
      name,
      contact,
      idProof,
      contribution,
      frequency,
      estimatedReturn,
      nextPaymentDate: nextPaymentDate.toISOString(),
      joinDate: new Date().toISOString(),
    };

    // Simulate submission
    setTimeout(() => {
      // In a real app, you'd save the data to a backend.
      // For this demo, we'll store in localStorage and navigate.
      localStorage.setItem('diwali_fund_confirmation', JSON.stringify(fundDetails));
      
      toast({
        title: "Successfully Joined!",
        description: `Welcome to the Diwali Fund, ${name}!`,
      });
      
      router.push(`/diwali-fund/confirmation`);

      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Join the Diwali Fund"
        description="Secure your savings and earn a festive bonus."
      />
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Your Details</CardTitle>
                <CardDescription>
                  Please provide your information for verification.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="e.g., Priya Sharma" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="id-proof">Aadhaar Number</Label>
                    <Input id="id-proof" placeholder="e.g., 1234 5678 9012" value={idProof} onChange={(e) => setIdProof(e.target.value)} required />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 items-start">
                    <div className="space-y-2">
                        <Label htmlFor="contact">Phone Number</Label>
                        <Input id="contact" placeholder="e.g., +91 98765 43210" value={contact} onChange={(e) => setContact(e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                        <Label>Face Capture</Label>
                        <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center border-2 border-dashed overflow-hidden">
                             {faceImageBase64 ? (
                                <img src={faceImageBase64} alt="Captured face" className="w-full h-full object-cover" />
                            ) : (
                                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                            )}
                            <canvas ref={canvasRef} className="hidden"></canvas>
                        </div>
                        {hasCameraPermission === false && (
                            <Alert variant="destructive" className="text-xs">
                                <AlertTitle>Camera Access Denied</AlertTitle>
                            </Alert>
                        )}
                        {!faceImageBase64 ? (
                            <Button type="button" onClick={captureFace} disabled={isSubmitting || hasCameraPermission === false} className="w-full">
                                <Camera className="mr-2 h-4 w-4" /> Capture Photo
                            </Button>
                        ) : (
                            <Button type="button" variant="outline" onClick={retakePhoto} disabled={isSubmitting} className="w-full">
                                <RefreshCw className="mr-2 h-4 w-4" /> Retake Photo
                            </Button>
                        )}
                    </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Contribution Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Contribution Amount</Label>
                        <Select value={contribution?.toString()} onValueChange={(val) => setContribution(Number(val))}>
                            <SelectTrigger><SelectValue placeholder="Select amount" /></SelectTrigger>
                            <SelectContent>
                                {CONTRIBUTION_AMOUNTS.map(amount => (
                                    <SelectItem key={amount} value={amount.toString()}>₹{amount.toLocaleString('en-IN')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Frequency</Label>
                        <Select value={frequency} onValueChange={setFrequency}>
                            <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                            <SelectContent>
                                {FREQUENCIES.map(freq => (
                                    <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

          </div>
          
          <div className="md:col-span-1 space-y-8">
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>How it Works</AlertTitle>
                <AlertDescription>
                    Save ₹100, ₹1,000, or ₹5,000 weekly or monthly and receive a <span className="font-bold text-primary">+10% bonus</span> at Diwali. Early withdrawal will incur a 10% deduction on your total saved amount.
                </AlertDescription>
            </Alert>
            <Card className="bg-primary text-primary-foreground">
                <CardHeader>
                    <CardTitle>Estimated Diwali Return</CardTitle>
                    <CardDescription className="text-primary-foreground/80">Your total contribution plus your 10% bonus.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">₹{Math.round(estimatedReturn).toLocaleString('en-IN')}</p>
                </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={isSubmitting || !faceImageBase64 || !contribution || !frequency}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              "Join Now"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
