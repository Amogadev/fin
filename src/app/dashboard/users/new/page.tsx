
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

function LoanUserForm() {
  const router = useRouter();
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
    // Stop camera stream when component unmounts or image is captured
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [faceImageBase64]);

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      setIsCameraOpen(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('கேமராவை அணுகுவதில் பிழை:', error);
      setHasCameraPermission(false);
      setIsCameraOpen(false);
      toast({
        variant: 'destructive',
        title: 'கேமரா அணுகல் மறுக்கப்பட்டது',
        description: 'உங்கள் உலாவி அமைப்புகளில் கேமரா அனுமதிகளை இயக்கவும்.',
      });
    }
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
        setFaceImageBase64(dataUri);
        setIsCameraOpen(false); // Close camera view
        // Stop the camera stream after capture
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  };
  
  const retakePhoto = async () => {
    setFaceImageBase64(null);
    setIsCameraOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faceImageBase64) {
      toast({
        variant: "destructive",
        title: "முகப் படம் இல்லை",
        description: "பயனரை உருவாக்கும் முன் ஒரு முகப் படத்தைப் பிடிக்கவும்.",
      });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newUser = {
        id: `user${Date.now().toString().slice(-4)}`,
        name,
        contact,
        idProof,
        faceImageUrl: faceImageBase64, // For demo, use the base64 as the URL
        createdAt: new Date().toISOString(),
        loans: [],
        registrationType: 'Loan' as const,
      };
      
      const tempUsersJson = localStorage.getItem('temp_new_users');
      const tempUsers = tempUsersJson ? JSON.parse(tempUsersJson) : [];
      tempUsers.push(newUser);
      localStorage.setItem('temp_new_users', JSON.stringify(tempUsers));

      toast({
        title: "பயனர் உருவாக்கப்பட்டது",
        description: `${name} வெற்றிகரமாகப் பதிவு செய்யப்பட்டுள்ளார்.`,
      });
      
      router.push(`/dashboard/users/${newUser.id}`);

      setIsSubmitting(false);
    }, 1000);
  };
  
  return (
      <form onSubmit={handleSubmit} className="space-y-4 pt-6">
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
                <CardTitle>முகப் பிடிப்பு</CardTitle>
                <CardDescription>
                  விண்ணப்பதாரரின் முகத்தின் தெளிவான படத்தைப் பிடிக்கவும்.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col items-center justify-center space-y-4">
                <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed overflow-hidden">
                  {faceImageBase64 ? (
                    <img src={faceImageBase64} alt="Captured face" className="w-full h-full object-cover" />
                  ) : isCameraOpen ? (
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                  ) : (
                    <Camera className="h-10 w-10 text-muted-foreground" />
                  )}
                  <canvas ref={canvasRef} className="hidden"></canvas>
                </div>

                {hasCameraPermission === false && (
                  <Alert variant="destructive" className="text-xs">
                    <AlertTitle>கேமரா அணுகல் மறுக்கப்பட்டது</AlertTitle>
                    <AlertDescription>
                      தொடர உங்கள் உலாவியில் கேமரா அணுகலை வழங்கவும்.
                    </AlertDescription>
                  </Alert>
                )}
                
                {faceImageBase64 ? (
                  <Button type="button" variant="outline" onClick={retakePhoto} disabled={isSubmitting}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    புகைப்படத்தை மீண்டும் எடு
                  </Button>
                ) : isCameraOpen ? (
                    <Button type="button" onClick={captureFace} disabled={isSubmitting || hasCameraPermission === false}>
                      <Camera className="mr-2 h-4 w-4" />
                      புகைப்படத்தைப் பிடி
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
                பயனரை உருவாக்குகிறது...
              </>
            ) : (
              "பயனரை உருவாக்கி தொடரவும்"
            )}
          </Button>
        </div>
      </form>
  );
}

export default function NewUserPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="கடன் / EMI க்கு புதிய பயனரைப் பதிவு செய்யவும்"
        description="தனிப்பட்ட தகவல்களைச் சேகரித்து, அடையாள சரிபார்ப்புக்காக ஒரு முகப் படத்தைப் பிடிக்கவும்."
      >
        <Button asChild variant="outline">
          <Link href="/dashboard/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            பயனர்களுக்குத் திரும்பு
          </Link>
        </Button>
      </PageHeader>
      
      <LoanUserForm />
    </div>
  );
}
