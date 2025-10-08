"use client";

import React, { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Camera, Loader2, CheckCircle, XCircle } from "lucide-react";
import { performVerification } from "./action";
import type { VerifyFaceMatchOutput } from "@/ai/flows/facial-match-verification";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getUserById, type User } from "@/lib/data";
import { Label } from "@/components/ui/label";

const selfieImage = PlaceHolderImages.find((img) => img.id === "user001_selfie");

export default function VerifyIdentityPage({
  params,
}: {
  params: { id: string };
}) {
  const [isPending, startTransition] = useTransition();
  const [selfieTaken, setSelfieTaken] = useState(false);
  const [verificationResult, setVerificationResult] =
    useState<VerifyFaceMatchOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const userData = await getUserById(params.id);
      if (userData) {
        setUser(userData);
      }
    }
    fetchUser();
  }, [params.id]);

  const handleVerification = () => {
    if (!user) return;

    setError(null);
    setVerificationResult(null);

    startTransition(async () => {
      // For demo, using a hardcoded base64 string for the "live" selfie.
      const liveSelfieDataUri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

      const result = await performVerification({
        selfieDataUri: liveSelfieDataUri,
        storedImageDataUri: user.faceImageBase64,
      });

      if ("error" in result) {
        setError(result.error);
      } else {
        setVerificationResult(result);
      }
    });
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Facial Identity Verification"
        description="Verify applicant's identity using AI-powered facial matching."
      >
        <Button asChild variant="outline">
          <Link href={`/dashboard/users/${params.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to User
          </Link>
        </Button>
      </PageHeader>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Stored Photo</CardTitle>
            <CardDescription>
              Photo captured during user registration.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Image
              src={user.faceImageUrl}
              alt="Stored user photo"
              width={300}
              height={300}
              className="rounded-lg border shadow-sm object-cover aspect-square"
              data-ai-hint="person portrait"
            />
            <p className="text-sm text-muted-foreground">
              Stored photo for {user.name}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Live Selfie</CardTitle>
            <CardDescription>Capture a new selfie for comparison.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-[300px] h-[300px] bg-muted rounded-lg flex items-center justify-center border-dashed border-2">
              {selfieTaken && selfieImage ? (
                <Image
                  src={selfieImage.imageUrl}
                  alt="Captured selfie"
                  width={300}
                  height={300}
                  className="rounded-lg object-cover aspect-square"
                  data-ai-hint={selfieImage.imageHint || "person portrait"}
                />
              ) : (
                <Camera className="h-16 w-16 text-muted-foreground" />
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setSelfieTaken(true)}
              disabled={selfieTaken}
            >
              <Camera className="mr-2 h-4 w-4" />
              {selfieTaken ? "Selfie Captured" : "Capture Selfie"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Step 3: Verification</CardTitle>
          <CardDescription>
            Click below to compare the images and get a verification result.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Button
            size="lg"
            variant="accent"
            onClick={handleVerification}
            disabled={!selfieTaken || isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify Match
          </Button>

          {error && (
            <Alert variant="destructive" className="mt-4 w-full">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Verification Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {verificationResult && (
            <Card className="w-full mt-4 bg-secondary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  {verificationResult.isMatch ? (
                    <CheckCircle className="text-green-500" />
                  ) : (
                    <XCircle className="text-destructive" />
                  )}
                  {verificationResult.isMatch ? "Match Found" : "No Match"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Label>Confidence Score</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Progress value={verificationResult.confidence * 100} />
                  <span className="font-bold text-lg">
                    {(verificationResult.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {verificationResult.isMatch
                    ? "The faces in the images are likely of the same person."
                    : "The faces in the images are likely not of the same person."}
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
