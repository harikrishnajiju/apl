"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase/client";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { UserSearch } from "@/components/social/UserSearch";
import { FriendRequestCard } from "@/components/social/FriendRequestCard";
import { TeamBadge } from "@/components/team/TeamBadge";
import Link from "next/link";
import { Users, UserPlus, Search } from "lucide-react";

export default function FriendsDashboardPage() {
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!auth.currentUser) return;
    try {
      setLoading(true);
      // Fetch current user doc to get friends array
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (!userDoc.exists()) return;
      
      const friendIds = userDoc.data().friends || [];
      const friendsData = [];
      for (const id of friendIds) {
        const d = await getDoc(doc(db, "users", id));
        if (d.exists()) friendsData.push({ id: d.id, ...d.data() });
      }
      setFriends(friendsData);

      // Fetch pending requests where toUid === me
      const q = query(
        collection(db, "friendRequests"),
        where("toUid", "==", auth.currentUser.uid),
        where("status", "==", "pending")
      );
      const snap = await getDocs(q);
      const reqs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Fetch sender details
      for (const req of reqs) {
        const senderDoc = await getDoc(doc(db, "users", req.fromUid));
        if (senderDoc.exists()) {
          (req as any).senderData = senderDoc.data();
        }
      }
      setRequests(reqs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchData();
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-8 text-center text-neutral-400 min-h-screen pt-20">Loading friends...</div>;

  return (
    <div className="container mx-auto px-4 py-8 pb-16 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Friends</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-neutral-400" /> My Friends ({friends.length})
            </h2>
            {friends.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 bg-neutral-900/50 rounded-xl border border-neutral-800">
                You haven't added any friends yet. Use the search to find fans!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {friends.map(friend => (
                  <Link key={friend.id} href={`/profile/${friend.id}`} className="block">
                    <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center space-x-4 hover:border-neutral-700 transition-colors">
                      <TeamBadge letters={friend.badge?.letters || "?"} color={friend.badge?.color || "#333"} />
                      <div>
                        <div className="font-bold">{friend.displayName}</div>
                        <div className="text-xs text-neutral-400">{friend.favoriteIplTeam} Fan</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <Search className="w-4 h-4 mr-2 text-neutral-400" /> Find Fans
            </h2>
            <UserSearch />
          </section>

          <section>
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <UserPlus className="w-4 h-4 mr-2 text-neutral-400" /> Friend Requests
            </h2>
            {requests.length === 0 ? (
              <div className="text-sm text-neutral-500">No pending requests.</div>
            ) : (
              <div className="space-y-4">
                {requests.map(req => (
                  <FriendRequestCard key={req.id} request={req} onActionComplete={fetchData} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
