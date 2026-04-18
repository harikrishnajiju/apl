"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase/client";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      
      // We don't create full Firestore user doc here, we wait for onboarding.
      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Wait for onboarding
      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-950">
      <Card className="w-full max-w-md bg-neutral-900 text-white border-neutral-800">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Join PitchSide</CardTitle>
          <CardDescription className="text-center text-neutral-400">Create an account to connect.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Fan123"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-neutral-800 border-neutral-700"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="msdhoni@csk.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-neutral-800 border-neutral-700"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-neutral-800 border-neutral-700"
                required
              />
            </div>
            <Button type="submit" className="w-full">Sign Up</Button>
          </form>
          
          <div className="mt-6 flex items-center">
            <div className="flex-grow border-t border-neutral-800"></div>
            <span className="mx-2 text-neutral-500 text-sm">OR</span>
            <div className="flex-grow border-t border-neutral-800"></div>
          </div>
          
          <Button variant="outline" onClick={handleGoogleSignup} className="w-full mt-6 border-neutral-700 hover:bg-neutral-800 text-neutral-100">
            Sign Up with Google
          </Button>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-neutral-400">
            Already have an account? <Link href="/login" className="text-white hover:underline">Log in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
