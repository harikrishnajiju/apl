"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

export function RecentActivity() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(4));
        const snap = await getDocs(q);
        setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <Card className="bg-neutral-900 border-neutral-800 text-white h-full">
      <CardHeader className="p-4 border-b border-neutral-800 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold">Recent Forum Activity</CardTitle>
        <Link href="/forums" className="text-xs text-blue-400 hover:underline">View All</Link>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 text-center text-neutral-500">Loading activity...</div>
        ) : posts.length === 0 ? (
          <div className="p-6 flex flex-col items-center justify-center text-center h-[280px] space-y-3">
            <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-neutral-500" />
            </div>
            <p className="text-sm text-neutral-400">
              No recent activity to show yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {posts.map(post => (
              <Link key={post.id} href={`/posts/${post.id}`} className="block p-4 hover:bg-neutral-800/50 transition-colors">
                <h4 className="font-bold text-sm mb-1 truncate">{post.title}</h4>
                <div className="flex items-center text-xs text-neutral-500 space-x-2">
                  <span className="font-medium text-neutral-400">{post.authorName}</span>
                  <span>•</span>
                  <span className="flex items-center"><MessageSquare className="w-3 h-3 mr-1" />{post.commentCount || 0}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
