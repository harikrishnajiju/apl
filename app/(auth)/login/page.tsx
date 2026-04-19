"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase/client";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-950">
      <Card className="w-full max-w-md bg-neutral-900 text-white border-neutral-800">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login to PitchSide</CardTitle>
          <CardDescription className="text-center text-neutral-400">Connect with your team's fans.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="msdhoni@csk.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
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
                className="bg-neutral-800 border-neutral-700 text-white"
                required
              />
            </div>
            <Button type="submit" className="w-full">Sign In</Button>
          </form>
          
          <div className="mt-6 flex items-center">
            <div className="flex-grow border-t border-neutral-800"></div>
            <span className="mx-2 text-neutral-500 text-sm">OR</span>
            <div className="flex-grow border-t border-neutral-800"></div>
          </div>
          
          <Button onClick={handleGoogleLogin} className="w-full mt-6 bg-white text-black hover:bg-neutral-200">
            Sign In with Google
          </Button>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-neutral-400">
            Don't have an account? <Link href="/signup" className="text-white hover:underline">Sign up</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
