
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
        description: 'பயன்பாட்டைப் பயன்படுத்த, உங்கள் உலாவி அமைப்புகளில் கேமரா அனுமதிகளை இயக்கவும்.',
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
        setIsCameraOpen(false);
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  };

  const retakePhoto = () => {
    setFaceImageBase64(null);
    setIsCameraOpen(false);
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

    // Simulate submission
    setTimeout(() => {
      const newUser = {
        id: `user${Date.now().toString().slice(-4)}`,
        name,
        contact,
        idProof,
        faceImageUrl: faceImageBase64, // For demo, use the base64 as the URL
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
      
      router.push(`/diwali-fund/${newUser.id}/plan`);

      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="தீபாவளி சேமிப்புத் திட்டத்தில் சேரவும்"
        description="படி 1: சரிபார்ப்புக்காக உங்கள் தகவலை வழங்கவும்."
      >
          <Button asChild variant="outline">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            முகப்புக்குத் திரும்பு
          </Link>
        </Button>
      </PageHeader>
      
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
                  <Input id="name" placeholder="எ.கா., பிரியா" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="id-proof">ஆதார் எண்</Label>
                    <Input id="id-proof" placeholder="எ.கா., 1234 5678 9012" value={idProof} onChange={(e) => setIdProof(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact">தொலைபேசி எண்</Label>
                    <Input id="contact" placeholder="எ.கா., +91 98765 43210" value={contact} onChange={(e) => setContact(e.target.value)} required />
                  </div>
                </div>
              </div>

              {/* Right side: Face Capture */}
              <div className="space-y-2 flex flex-col items-center">
                <Label className="text-center w-full">முகப் புகைப்படம்</Label>
                <div
                  className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed overflow-hidden cursor-pointer"
                  onClick={() => {
                    if (!faceImageBase64 && !isCameraOpen) {
                      openCamera();
                    }
                  }}
                >
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

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={isSubmitting || !faceImageBase64}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                பயனரைச் சேமிக்கிறது...
              </>
            ) : (
              "பயனரை உருவாக்கி தொடரவும்"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
