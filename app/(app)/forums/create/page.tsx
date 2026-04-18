"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase/client";
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreateForumPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [teamId, setTeamId] = useState("");
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTeams = async () => {
      const snap = await getDocs(collection(db, "teams"));
      setTeams(snap.docs.map(d => d.data()).sort((a,b) => a.name.localeCompare(b.name)));
    };
    fetchTeams();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);

    try {
      const docRef = await addDoc(collection(db, "forums"), {
        name,
        description,
        teamId: teamId || null,
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        memberCount: 1
      });
      router.push(`/forums/${docRef.id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to create forum");
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card className="bg-neutral-900 border-neutral-800 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">Create a New Forum</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Forum Name</label>
              <Input 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g. RCB Match Threads" 
                className="bg-neutral-950 border-neutral-800 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea 
                required 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="What is this forum about?" 
                className="flex min-h-[100px] w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Associated Team (Optional)</label>
              <select 
                value={teamId} 
                onChange={e => setTeamId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
              >
                <option value="">General (No specific team)</option>
                {teams.map(t => (
                  <option key={t.shortCode} value={t.shortCode}>{t.name}</option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-white text-black hover:bg-neutral-200">
              {loading ? "Creating..." : "Create Forum"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
