"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { doc, getDoc, collection, getDocs, query, where, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { PostCard } from "@/components/post/PostCard";
import { Button } from "@/components/ui/button";
import { PenSquare, Users, Sparkles } from "lucide-react";

export default function ForumDetailPage({ params }: { params: { forumId: string } }) {
  const [forum, setForum] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingWelcome, setGeneratingWelcome] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const forumDoc = await getDoc(doc(db, "forums", params.forumId));
        if (forumDoc.exists()) {
          setForum({ id: forumDoc.id, ...forumDoc.data() });
        }

        const q = query(
          collection(db, "posts"),
          where("forumId", "==", params.forumId)
        );
        const snap = await getDocs(q);
        const fetchedPosts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        fetchedPosts.sort((a, b) => (b.score || 0) - (a.score || 0)); // Sort by score descending
        setPosts(fetchedPosts);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.forumId]);

  const handleGenerateWelcome = async () => {
    if (!forum || generatingWelcome) return;
    setGeneratingWelcome(true);
    try {
      const res = await fetch("/api/gemini/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forumName: forum.name, forumDescription: forum.description })
      });
      const data = await res.json();
      if (data.welcomeMessage) {
        await updateDoc(doc(db, "forums", forum.id), { welcomeMessage: data.welcomeMessage });
        setForum(prev => ({ ...prev, welcomeMessage: data.welcomeMessage }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setGeneratingWelcome(false);
    }
  };

  useEffect(() => {
    if (forum && !loading && posts.length === 0 && !forum.welcomeMessage && !generatingWelcome) {
      handleGenerateWelcome();
    }
  }, [forum, loading, posts.length]);

  if (loading) return <div className="p-8 text-center text-neutral-400 min-h-screen pt-20">Loading forum...</div>;
  if (!forum) return <div className="p-8 text-center text-neutral-400 min-h-screen pt-20">Forum not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8 pb-16 max-w-4xl">
      <div className="mb-6">
        <Link href="/forums" className="text-sm text-neutral-400 hover:text-white transition-colors">
          &larr; Back to Forums
        </Link>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 md:p-8 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold">{forum.name}</h1>
          <p className="text-neutral-400 mt-2">{forum.description}</p>
          <div className="flex items-center text-sm text-neutral-500 mt-4">
            <Users className="w-4 h-4 mr-1.5" />
            {forum.memberCount || 0} members
          </div>
        </div>
        <Link href={`/posts/create?forumId=${forum.id}`} className="mt-6 md:mt-0 relative z-10">
          <Button className="bg-white text-black hover:bg-neutral-200">
            <PenSquare className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
        {posts.length === 0 && (
          <div className="p-8 md:p-12 text-center bg-neutral-900/30 rounded-xl border border-neutral-800 border-dashed relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Sparkles className="w-24 h-24" />
            </div>
            
            {generatingWelcome ? (
              <div className="animate-pulse text-purple-400 flex flex-col items-center justify-center">
                <Sparkles className="w-8 h-8 mb-4 animate-spin-slow" />
                <p>Gemini is writing a welcome message...</p>
              </div>
            ) : forum.welcomeMessage ? (
              <div className="relative z-10 max-w-2xl mx-auto">
                <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Welcome to {forum.name}!</h3>
                <p className="text-neutral-300 leading-relaxed text-sm md:text-base">
                  {forum.welcomeMessage}
                </p>
                <div className="mt-6">
                  <Link href={`/posts/create?forumId=${forum.id}`}>
                    <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
                      Be the first to post
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-neutral-500">
                No posts in this forum yet. Be the first to start a discussion!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
