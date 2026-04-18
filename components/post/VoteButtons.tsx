"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase/client";
import { doc, getDoc, runTransaction } from "firebase/firestore";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoteButtonsProps {
  itemId: string;
  initialScore: number;
  collectionName: "posts" | "comments";
  parentPostId?: string;
}

export function VoteButtons({ itemId, initialScore, collectionName, parentPostId }: VoteButtonsProps) {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<1 | -1 | 0>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserVote = async () => {
      if (!auth.currentUser) return;
      const uid = auth.currentUser.uid;
      
      let voteRef;
      if (collectionName === "posts") {
        voteRef = doc(db, "posts", itemId, "votes", uid);
      } else if (parentPostId) {
        voteRef = doc(db, "posts", parentPostId, "comments", itemId, "votes", uid);
      } else {
        return;
      }

      const voteDoc = await getDoc(voteRef);
      if (voteDoc.exists()) {
        setUserVote(voteDoc.data().value);
      }
    };
    fetchUserVote();
  }, [itemId, collectionName, parentPostId]);

  const handleVote = async (value: 1 | -1) => {
    if (!auth.currentUser) return alert("Please log in to vote.");
    if (loading) return;
    setLoading(true);

    const uid = auth.currentUser.uid;
    const newValue = userVote === value ? 0 : value;

    // Optimistic UI update
    const scoreDiff = newValue - userVote;
    setScore(prev => prev + scoreDiff);
    
    // We must capture the old vote to revert properly if transaction fails
    const oldVote = userVote;
    setUserVote(newValue);

    try {
      await runTransaction(db, async (transaction) => {
        let itemRef;
        let voteRef;
        
        if (collectionName === "posts") {
          itemRef = doc(db, "posts", itemId);
          voteRef = doc(db, "posts", itemId, "votes", uid);
        } else if (parentPostId) {
          itemRef = doc(db, "posts", parentPostId, "comments", itemId);
          voteRef = doc(db, "posts", parentPostId, "comments", itemId, "votes", uid);
        } else {
          throw new Error("Invalid collection path");
        }

        const itemDoc = await transaction.get(itemRef);
        if (!itemDoc.exists()) throw new Error("Document does not exist!");

        const currentData = itemDoc.data();
        let upvotes = currentData.upvotes || 0;
        let downvotes = currentData.downvotes || 0;

        // Revert old vote in transaction logic
        if (oldVote === 1) upvotes -= 1;
        if (oldVote === -1) downvotes -= 1;

        // Apply new vote
        if (newValue === 1) upvotes += 1;
        if (newValue === -1) downvotes += 1;

        const newScore = upvotes - downvotes;

        transaction.update(itemRef, { upvotes, downvotes, score: newScore });

        if (newValue === 0) {
          transaction.delete(voteRef);
        } else {
          transaction.set(voteRef, { value: newValue });
        }
      });
    } catch (error) {
      console.error("Transaction failed: ", error);
      // Revert optimistic update
      setScore(prev => prev - scoreDiff);
      setUserVote(oldVote);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-neutral-900/50 rounded-lg p-1 w-12 border border-neutral-800 shrink-0">
      <button 
        onClick={(e) => { e.preventDefault(); handleVote(1); }}
        className={cn("p-1 rounded transition-colors", userVote === 1 ? "text-orange-500 bg-orange-500/10" : "text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300")}
      >
        <ArrowBigUp className={cn("w-6 h-6", userVote === 1 && "fill-current")} />
      </button>
      <span className={cn("font-bold text-sm py-1", userVote === 1 ? "text-orange-500" : userVote === -1 ? "text-blue-500" : "text-neutral-300")}>
        {score}
      </span>
      <button 
        onClick={(e) => { e.preventDefault(); handleVote(-1); }}
        className={cn("p-1 rounded transition-colors", userVote === -1 ? "text-blue-500 bg-blue-500/10" : "text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300")}
      >
        <ArrowBigDown className={cn("w-6 h-6", userVote === -1 && "fill-current")} />
      </button>
    </div>
  );
}
