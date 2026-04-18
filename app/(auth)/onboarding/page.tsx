"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase/client";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { onAuthStateChanged } from "firebase/auth";

const IPL_TEAMS = [
  { code: "CSK", name: "Chennai Super Kings", color: "#FFFF00" },
  { code: "MI", name: "Mumbai Indians", color: "#004BA0" },
  { code: "RCB", name: "Royal Challengers Bengaluru", color: "#EC1C24" },
  { code: "KKR", name: "Kolkata Knight Riders", color: "#3A225D" },
  { code: "DC", name: "Delhi Capitals", color: "#17449B" },
  { code: "SRH", name: "Sunrisers Hyderabad", color: "#FB643E" },
  { code: "RR", name: "Rajasthan Royals", color: "#EA1A85" },
  { code: "PBKS", name: "Punjab Kings", color: "#DD1F2D" },
  { code: "LSG", name: "Lucknow Super Giants", color: "#A4DDED" },
  { code: "GT", name: "Gujarat Titans", color: "#1B2133" },
];

const NATIONAL_TEAMS = ["IND", "AUS", "ENG", "SA", "NZ", "PAK", "WI", "SL", "BAN", "AFG"];

export default function OnboardingPage() {
  const [iplTeam, setIplTeam] = useState("");
  const [nationalTeam, setNationalTeam] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!iplTeam || !nationalTeam || !user) return;
    
    setLoading(true);
    try {
      const selectedTeam = IPL_TEAMS.find(t => t.code === iplTeam);
      
      await setDoc(doc(db, "users", user.uid), {
        displayName: user.displayName || "Fan",
        email: user.email,
        photoURL: user.photoURL || null,
        favoriteIplTeam: iplTeam,
        favoriteNationalTeam: nationalTeam,
        badge: {
          letters: iplTeam,
          color: selectedTeam?.color || "#FFFFFF",
        },
        bio: "",
        joinedAt: serverTimestamp(),
        friends: []
      });
      
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!user) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-950">
      <Card className="w-full max-w-md bg-neutral-900 text-white border-neutral-800">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Complete Your Profile</CardTitle>
          <CardDescription className="text-center text-neutral-400">Pick your loyalties.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          <form onSubmit={handleComplete} className="space-y-6">
            <div className="space-y-2">
              <Label>Favorite IPL Team</Label>
              <Select onValueChange={(v) => setIplTeam(v as string)} required>
                <SelectTrigger className="w-full bg-neutral-800 border-neutral-700">
                  <SelectValue placeholder="Select IPL Team" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                  {IPL_TEAMS.map((team) => (
                    <SelectItem key={team.code} value={team.code}>
                      {team.name} ({team.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Favorite National Team</Label>
              <Select onValueChange={(v) => setNationalTeam(v as string)} required>
                <SelectTrigger className="w-full bg-neutral-800 border-neutral-700">
                  <SelectValue placeholder="Select National Team" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                  {NATIONAL_TEAMS.map((team) => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading || !iplTeam || !nationalTeam}>
              {loading ? "Saving..." : "Start Exploring"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
