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
import { Camera, ArrowLeft } from "lucide-react";

export default function NewUserPage() {
  return (
    <div className="space-y-4">
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
                <Input id="name" placeholder="e.g., Rohan Verma" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input id="contact" placeholder="e.g., +91 98765 43210" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="id-proof">ID Proof</Label>
                <Input id="id-proof" placeholder="e.g., AADHAAR, PAN number" />
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
              <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                <Camera className="w-16 h-16 text-muted-foreground" />
              </div>
              <Button variant="outline">
                <Camera className="mr-2 h-4 w-4" />
                Open Camera
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <Button asChild size="lg">
          <Link href="/dashboard/users/user002">Create User & Proceed</Link>
        </Button>
      </div>
    </div>
  );
}
