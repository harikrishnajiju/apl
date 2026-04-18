"use client";

import { useState } from "react";
import { db, auth } from "@/lib/firebase/client";
import { doc, runTransaction, arrayUnion } from "firebase/firestore";
import { TeamBadge } from "@/components/team/TeamBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function FriendRequestCard({ request, onActionComplete }: { request: any, onActionComplete: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: "accept" | "reject") => {
    if (!auth.currentUser) return;
    setLoading(true);
    
    try {
      const reqRef = doc(db, "friendRequests", request.id);
      
      if (action === "reject") {
        await runTransaction(db, async (transaction) => {
          transaction.update(reqRef, { status: "rejected" });
        });
      } else {
        const myRef = doc(db, "users", auth.currentUser.uid);
        const theirRef = doc(db, "users", request.fromUid);

        await runTransaction(db, async (transaction) => {
          // Double check request is still pending
          const reqDoc = await transaction.get(reqRef);
          if (!reqDoc.exists() || reqDoc.data().status !== "pending") {
            throw new Error("Request already processed");
          }

          transaction.update(reqRef, { status: "accepted" });
          transaction.update(myRef, { friends: arrayUnion(request.fromUid) });
          transaction.update(theirRef, { friends: arrayUnion(auth.currentUser!.uid) });
        });
      }
      onActionComplete();
    } catch (e) {
      console.error(e);
      alert("Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800 text-white">
      <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3 w-full">
          <TeamBadge letters={request.senderData?.badge?.letters || "?"} color={request.senderData?.badge?.color || "#333"} />
          <div>
            <div className="font-semibold text-sm">{request.senderData?.displayName || "User"}</div>
            <div className="text-xs text-neutral-400">Wants to connect</div>
          </div>
        </div>
        <div className="flex space-x-2 shrink-0">
          <Button size="sm" onClick={() => handleAction("accept")} disabled={loading} className="bg-white text-black hover:bg-neutral-200">
            Accept
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleAction("reject")} disabled={loading} className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
