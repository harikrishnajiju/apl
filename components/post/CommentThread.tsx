"use client";

import { VoteButtons } from "./VoteButtons";
import { useState } from "react";
import { auth, db } from "@/lib/firebase/client";
import { collection, addDoc, serverTimestamp, increment, doc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";

export function CommentThread({ comments, postId, parentId = null, depth = 0 }: { comments: any[], postId: string, parentId?: string | null, depth?: number }) {
  // Filter comments for this level
  const levelComments = comments.filter(c => c.parentCommentId === parentId);
  levelComments.sort((a, b) => (b.score || 0) - (a.score || 0));

  if (levelComments.length === 0) return null;

  return (
    <div className={`space-y-2 ${depth > 0 ? "ml-2 md:ml-6 border-l border-neutral-800 pl-2 md:pl-4 mt-2" : "mt-6"}`}>
      {levelComments.map(comment => (
        <CommentItem key={comment.id} comment={comment} allComments={comments} postId={postId} depth={depth} />
      ))}
    </div>
  );
}

function CommentItem({ comment, allComments, postId, depth }: { comment: any, allComments: any[], postId: string, depth: number }) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleReply = async () => {
    if (!replyBody.trim() || !auth.currentUser) return;
    setSubmitting(true);
    try {
      const newComment = {
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || "Anonymous",
        body: replyBody,
        createdAt: serverTimestamp(),
        upvotes: 0,
        downvotes: 0,
        score: 0,
        parentCommentId: comment.id
      };
      
      await addDoc(collection(db, "posts", postId, "comments"), newComment);
      await updateDoc(doc(db, "posts", postId), {
        commentCount: increment(1)
      });
      
      setIsReplying(false);
      setReplyBody("");
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Failed to reply");
    } finally {
      setSubmitting(false);
    }
  };

  const timeAgo = comment.createdAt?.seconds 
    ? new Date(comment.createdAt.seconds * 1000).toLocaleDateString() 
    : "Just now";

  return (
    <div className="flex flex-col pt-2">
      <div className="flex">
        <VoteButtons itemId={comment.id} initialScore={comment.score || 0} collectionName="comments" parentPostId={postId} />
        <div className="ml-3 flex-1 bg-neutral-900/30 p-4 rounded-lg border border-neutral-800/50">
          <div className="flex items-center text-xs text-neutral-400 mb-2">
            <span className="font-semibold text-neutral-300">{comment.authorName}</span>
            <span className="mx-2">•</span>
            <span>{timeAgo}</span>
          </div>
          <p className="text-sm text-neutral-200">{comment.body}</p>
          
          {depth < 2 && (
            <div className="mt-3">
              <button 
                onClick={() => setIsReplying(!isReplying)}
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                Reply
              </button>
            </div>
          )}
          
          {isReplying && (
            <div className="mt-4 space-y-2">
              <textarea 
                value={replyBody}
                onChange={e => setReplyBody(e.target.value)}
                placeholder="Write a reply..."
                className="flex min-h-[60px] w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 text-white"
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleReply} disabled={submitting} className="bg-white text-black hover:bg-neutral-200">
                  {submitting ? "Posting..." : "Post Reply"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsReplying(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Nested Replies */}
      <CommentThread comments={allComments} postId={postId} parentId={comment.id} depth={depth + 1} />
    </div>
  );
}
