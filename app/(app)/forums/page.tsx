"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, Users } from "lucide-react";

export default function ForumsPage() {
  const [forums, setForums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForums = async () => {
      try {
        const q = query(collection(db, "forums"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setForums(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchForums();
  }, []);

  if (loading) return <div className="p-8 text-center text-neutral-400 min-h-screen pt-20">Loading forums...</div>;

  return (
    <div className="container mx-auto px-4 py-8 pb-16 max-w-5xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Forums</h1>
          <p className="text-neutral-400 mt-1">Join the conversation with other fans.</p>
        </div>
        <Link href="/forums/create" className="mt-4 md:mt-0">
          <Button className="bg-white text-black hover:bg-neutral-200">
            <MessageSquarePlus className="w-4 h-4 mr-2" />
            Create Forum
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forums.map(forum => (
          <Link key={forum.id} href={`/forums/${forum.id}`}>
            <Card className="bg-neutral-900 border-neutral-800 text-white transition-colors hover:border-neutral-700 hover:bg-neutral-800/50 h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <h2 className="text-xl font-bold mb-2">{forum.name}</h2>
                <p className="text-sm text-neutral-400 mb-6 flex-1">{forum.description}</p>
                <div className="flex items-center text-xs text-neutral-500 mt-auto">
                  <Users className="w-4 h-4 mr-1.5" />
                  {forum.memberCount || 0} members
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {forums.length === 0 && (
          <div className="col-span-full p-12 text-center text-neutral-500 bg-neutral-900/30 rounded-xl border border-neutral-800 border-dashed">
            No forums exist yet. Be the first to create one!
          </div>
        )}
      </div>
    </div>
  );
}
