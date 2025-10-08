
"use client";

import { useState, useRef, useEffect } from "react";
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
import { Camera, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";


export default function DiwaliFundPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [idProof, setIdProof] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [faceImageBase64, setFaceImageBase64] = useState<string | null>(null);


  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    if (!faceImageBase64 || !name || !contact || !idProof) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill all fields and capture a photo.",
      });
      return;
    }

    setIsSubmitting(true);

    const newUser = {
      id: `user${Date.now().toString().slice(-4)}`,
      name,
      contact,
      idProof,
      faceImageBase64,
      faceImageUrl: faceImageBase64, // For demo, use the base64 as the URL
      createdAt: new Date().toISOString(),
      loans: [],
      registrationType: 'Diwali Fund' as const,
    };

    // Simulate submission
    setTimeout(() => {
      const tempUsersJson = localStorage.getItem('temp_new_users');
      const tempUsers = tempUsersJson ? JSON.parse(tempUsersJson) : [];
      tempUsers.push(newUser);
      localStorage.setItem('temp_new_users', JSON.stringify(tempUsers));
      
      toast({
        title: "User Details Saved!",
        description: `Proceed to set up the contribution plan for ${name}.`,
      });
      
      router.push(`/diwali-fund/${newUser.id}/plan`);

      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Join the Diwali Fund"
        description="Step 1: Provide your information for verification."
      >
          <Button asChild variant="outline">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </PageHeader>
      
      <form onSubmit={handleSubmit} className="space-y-8">
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
                    <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed overflow-hidden">
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

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={isSubmitting || !faceImageBase64}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving User...
              </>
            ) : (
              "Create User & Proceed"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
