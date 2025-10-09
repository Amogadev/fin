
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getUserById, type User } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

function EditUserSkeleton() {
  return (
    <div className="space-y-4">
       <PageHeader
        title="பயனரைத் திருத்து"
        description="பயனரின் தனிப்பட்ட தகவலைப் புதுப்பிக்கவும்."
      >
        <Button asChild variant="outline">
          <Link href="/dashboard/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            பயனர்கள் பக்கத்திற்குத் திரும்பு
          </Link>
        </Button>
      </PageHeader>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>தனிப்பட்ட தகவல்</CardTitle>
          <CardDescription>
            பயனருக்கான விவரங்களை மாற்றியமைக்கவும்.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
            </div>
             <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
            </div>
             <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
            </div>
        </CardContent>
        <CardFooter>
            <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    </div>
  )
}


export default function EditUserPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const { id } = use(paramsPromise);
  const router = useRouter();
  const { toast } = useToast();
  
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [idProof, setIdProof] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const userData = await getUserById(id);
      if (userData) {
        setUser(userData);
        setName(userData.name);
        setContact(userData.contact);
        setIdProof(userData.idProof);
      }
    }
    fetchUser();
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const tempUsersJson = localStorage.getItem('temp_new_users');
      let tempUsers: User[] = tempUsersJson ? JSON.parse(tempUsersJson) : [];
      
      const userIndex = tempUsers.findIndex(u => u.id === id);

      if (userIndex !== -1) {
        tempUsers[userIndex] = {
          ...tempUsers[userIndex],
          name,
          contact,
          idProof,
        };
        localStorage.setItem('temp_new_users', JSON.stringify(tempUsers));

        toast({
          title: "பயனர் புதுப்பிக்கப்பட்டார்",
          description: `${name} இன் விவரங்கள் வெற்றிகரமாக புதுப்பிக்கப்பட்டன.`,
        });
        
        router.push(`/dashboard/users`);
      } else {
        toast({
            variant: "destructive",
            title: "புதுப்பித்தல் தோல்வியடைந்தது",
            description: "பயனரைக் கண்டுபிடிக்க முடியவில்லை.",
        })
      }

      setIsSubmitting(false);
    }, 1000);
  };
  
  if (!user) {
    return <EditUserSkeleton />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PageHeader
        title="பயனரைத் திருத்து"
        description="பயனரின் தனிப்பட்ட தகவலைப் புதுப்பிக்கவும்."
      >
        <Button asChild variant="outline">
          <Link href="/dashboard/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            பயனர்கள் பக்கத்திற்குத் திரும்பு
          </Link>
        </Button>
      </PageHeader>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>தனிப்பட்ட தகவல்</CardTitle>
          <CardDescription>
            {user.name} க்கான விவரங்களை மாற்றியமைக்கவும்.
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
        <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
                <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                சேமிக்கப்படுகிறது...
                </>
            ) : (
                <>
                <Save className="mr-2 h-4 w-4" />
                மாற்றங்களைச் சேமி
                </>
            )}
            </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
