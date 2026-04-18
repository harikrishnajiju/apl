"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase/client";
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { TeamBadge } from "@/components/team/TeamBadge";
import { PostCard } from "@/components/post/PostCard";
import { Button } from "@/components/ui/button";
import { UserPlus, Check, Clock } from "lucide-react";

export default function ProfilePage({ params }: { params: { userId: string } }) {
  const [profileUser, setProfileUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [friendStatus, setFriendStatus] = useState<"none" | "pending" | "friends">("none");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", params.userId));
        if (userDoc.exists()) {
          setProfileUser({ id: userDoc.id, ...userDoc.data() });
        }

        const q = query(
          collection(db, "posts"),
          where("authorId", "==", params.userId)
        );
        const snap = await getDocs(q);
        const fetchedPosts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        fetchedPosts.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
        setPosts(fetchedPosts.slice(0, 10)); // max 10 recent

        // Check friend status
        if (auth.currentUser && auth.currentUser.uid !== params.userId) {
          const myDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (myDoc.exists() && myDoc.data().friends?.includes(params.userId)) {
            setFriendStatus("friends");
          } else {
            // check if pending request exists
            const reqQ1 = query(collection(db, "friendRequests"), where("fromUid", "==", auth.currentUser.uid), where("toUid", "==", params.userId), where("status", "==", "pending"));
            const reqQ2 = query(collection(db, "friendRequests"), where("fromUid", "==", params.userId), where("toUid", "==", auth.currentUser.uid), where("status", "==", "pending"));
            
            const [snap1, snap2] = await Promise.all([getDocs(reqQ1), getDocs(reqQ2)]);
            if (!snap1.empty || !snap2.empty) {
              setFriendStatus("pending");
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    // Ensure auth is loaded before checking friend status
    const unsubscribe = auth.onAuthStateChanged((user) => {
      fetchData();
    });
    
    return () => unsubscribe();
  }, [params.userId]);

  const handleAddFriend = async () => {
    if (!auth.currentUser) return;
    setActionLoading(true);
    try {
      await addDoc(collection(db, "friendRequests"), {
        fromUid: auth.currentUser.uid,
        toUid: params.userId,
        status: "pending",
        createdAt: serverTimestamp()
      });
      setFriendStatus("pending");
    } catch (e) {
      console.error(e);
      alert("Failed to send request");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-neutral-400 min-h-screen pt-20">Loading profile...</div>;
  if (!profileUser) return <div className="p-8 text-center text-neutral-400 min-h-screen pt-20">User not found.</div>;

  const isMe = auth.currentUser?.uid === params.userId;

  return (
    <div className="container mx-auto px-4 py-8 pb-16 max-w-4xl">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 mb-8 relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0 opacity-20 pointer-events-none"
          style={{ 
            background: `linear-gradient(to right, ${profileUser.badge?.color || '#333'}, transparent)`
          }}
        />
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          <TeamBadge letters={profileUser.badge?.letters || "?"} color={profileUser.badge?.color || "#333"} className="w-32 h-32 text-4xl shadow-xl flex-shrink-0" />
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">{profileUser.displayName}</h1>
            <p className="text-neutral-300 mb-4">{profileUser.bio || "Hardcore cricket fan."}</p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
              <div className="bg-neutral-950 border border-neutral-800 px-4 py-2 rounded-full text-sm">
                <span className="text-neutral-500 mr-2">IPL Team:</span>
                <span className="font-bold">{profileUser.favoriteIplTeam}</span>
              </div>
              <div className="bg-neutral-950 border border-neutral-800 px-4 py-2 rounded-full text-sm">
                <span className="text-neutral-500 mr-2">National:</span>
                <span className="font-bold">{profileUser.favoriteNationalTeam}</span>
              </div>
            </div>

            {!isMe && (
              <div>
                {friendStatus === "none" && (
                  <Button onClick={handleAddFriend} disabled={actionLoading} className="bg-white text-black hover:bg-neutral-200">
                    <UserPlus className="w-4 h-4 mr-2" />
                    {actionLoading ? "Sending..." : "Add Friend"}
                  </Button>
                )}
                {friendStatus === "pending" && (
                  <Button disabled variant="outline" className="border-neutral-700 text-neutral-400">
                    <Clock className="w-4 h-4 mr-2" /> Request Pending
                  </Button>
                )}
                {friendStatus === "friends" && (
                  <Button disabled variant="outline" className="border-green-900/50 text-green-500 bg-green-950/20">
                    <Check className="w-4 h-4 mr-2" /> Friends
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold">Recent Posts</h2>
        {posts.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 bg-neutral-900/30 rounded-xl border border-neutral-800 border-dashed">
            {profileUser.displayName} hasn't posted anything yet.
          </div>
        ) : (
          posts.map(post => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
