"use client";

import { useState, useEffect, Suspense } from "react";
import { auth, db } from "@/lib/firebase/client";
import { doc, getDoc, collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function CreatePostForm() {
  const searchParams = useSearchParams();
  const initialForumId = searchParams.get("forumId") || "";
  
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [forumId, setForumId] = useState(initialForumId);
  const [matchId, setMatchId] = useState("");
  const [forums, setForums] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchSelectData = async () => {
      const forumsSnap = await getDocs(collection(db, "forums"));
      setForums(forumsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
      const matchSnap = await getDocs(collection(db, "matches"));
      setMatches(matchSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(m => m.status !== "completed"));
    };
    fetchSelectData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !forumId) return;
    setLoading(true);

    try {
      // Get author badge info
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      const badge = userDoc.exists() ? userDoc.data().badge : { letters: "?", color: "#333" };

      const docRef = await addDoc(collection(db, "posts"), {
        forumId,
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || "Anonymous",
        authorBadge: badge,
        title,
        body,
        createdAt: serverTimestamp(),
        upvotes: 0,
        downvotes: 0,
        score: 0,
        matchId: matchId || null,
        commentCount: 0
      });
      router.push(`/posts/${docRef.id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to create post");
      setLoading(false);
    }
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800 text-white">
      <CardHeader>
        <CardTitle className="text-2xl">Create a Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Forum</label>
            <select 
              required
              value={forumId} 
              onChange={e => setForumId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
            >
              <option value="" disabled>Choose a forum...</option>
              {forums.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input 
              required 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Give your post a title" 
              className="bg-neutral-950 border-neutral-800 text-white"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Body</label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={async () => {
                  if (!body.trim()) return;
                  try {
                    const res = await fetch("/api/gemini/improve", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ draft: body })
                    });
                    const data = await res.json();
                    if (data.polished) setBody(data.polished);
                  } catch (e) {
                    console.error("Failed to improve post", e);
                  }
                }}
                className="text-xs h-7 text-purple-400 hover:text-purple-300 hover:bg-purple-400/10"
              >
                <span className="mr-1">✨</span> Improve with AI
              </Button>
            </div>
            <textarea 
              required 
              value={body} 
              onChange={e => setBody(e.target.value)} 
              placeholder="What's on your mind?" 
              className="flex min-h-[150px] w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tag a Match (Optional)</label>
            <select 
              value={matchId} 
              onChange={e => setMatchId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
            >
              <option value="">No match</option>
              {matches.map(m => (
                <option key={m.id} value={m.id}>{m.teamA} vs {m.teamB}</option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-white text-black hover:bg-neutral-200">
            {loading ? "Posting..." : "Create Post"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function CreatePostPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Suspense fallback={<div className="text-neutral-400">Loading form...</div>}>
        <CreatePostForm />
      </Suspense>
    </div>
  );
}
