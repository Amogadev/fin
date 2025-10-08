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

export default function NewUserPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [idProof, setIdProof] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [faceImageBase64, setFaceImageBase64] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      // Stop camera stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);


  const openCamera = async () => {
    // Stop any existing stream before starting a new one
    if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      setIsCameraOpen(true);
      setFaceImageBase64(null); // Clear previous image

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
        setIsCameraOpen(false); // Close camera view after capture
        // Stop the camera stream
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  };
  
  const retakePhoto = () => {
    setFaceImageBase64(null);
    openCamera();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faceImageBase64) {
      toast({
        variant: "destructive",
        title: "Missing Face Image",
        description: "Please capture a face image before creating the user.",
      });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // This is a mock implementation. In a real app, you would:
      // 1. Upload the faceImageBase64 to a storage service to get a URL.
      // 2. Save the new user data (name, contact, idProof, faceImageUrl, faceImageBase64) to your database.
      // 3. The database would return a unique ID for the new user.
      const newUser = {
        id: `user${Date.now().toString().slice(-4)}`,
        name,
        contact,
        idProof,
        faceImageBase64,
        faceImageUrl: faceImageBase64, // For demo, use the base64 as the URL
      };

      console.log("Creating new user:", newUser);

      toast({
        title: "User Created",
        description: `${name} has been registered successfully.`,
      });

      // We'll use localStorage to pass the new user data to the next page as a temporary solution.
      // In a real app, you would fetch this from the server on the user detail page.
      localStorage.setItem('temp_new_user', JSON.stringify(newUser));

      router.push(`/dashboard/users/${newUser.id}`);

      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PageHeader
        title="Register New User"
        description="Collect personal information and capture a face image for identity verification."
      >
        <Button asChild variant="outline">
          <Link href="/dashboard/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
      </PageHeader>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Please fill in the details of the new applicant.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Rohan Verma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  placeholder="e.g., +91 98765 43210"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="id-proof">ID Proof (Aadhaar)</Label>
                <Input
                  id="id-proof"
                  placeholder="e.g., AADHAAR Number"
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
              <CardTitle>Face Capture</CardTitle>
              <CardDescription>
                Capture a clear image of the applicant's face.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col items-center justify-center space-y-4">
              <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed overflow-hidden">
                {faceImageBase64 ? (
                  <img src={faceImageBase64} alt="Captured face" className="w-full h-full object-cover" />
                ) : isCameraOpen ? (
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                ) : (
                  <Camera className="w-16 h-16 text-muted-foreground" />
                )}
                <canvas ref={canvasRef} className="hidden"></canvas>
              </div>

              {hasCameraPermission === false && (
                <Alert variant="destructive" className="text-xs">
                  <AlertTitle>Camera Access Denied</AlertTitle>
                  <AlertDescription>
                    Please grant camera access in your browser to proceed.
                  </AlertDescription>
                </Alert>
              )}
              
              {!faceImageBase64 ? (
                isCameraOpen ? (
                  <Button type="button" onClick={captureFace} disabled={isSubmitting}>
                    <Camera className="mr-2 h-4 w-4" />
                    Capture Photo
                  </Button>
                ) : (
                  <Button type="button" variant="outline" onClick={openCamera} disabled={isSubmitting}>
                    <Camera className="mr-2 h-4 w-4" />
                    Open Camera
                  </Button>
                )
              ) : (
                <Button type="button" variant="outline" onClick={retakePhoto} disabled={isSubmitting}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retake Photo
                </Button>
              )}

            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating User...
            </>
          ) : (
            "Create User & Proceed"
          )}
        </Button>
      </div>
    </form>
  );
}
