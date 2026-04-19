"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase/client";
import { doc, getDoc, collection, getDocs, addDoc, serverTimestamp, updateDoc, increment } from "firebase/firestore";
import Link from "next/link";
import { VoteButtons } from "@/components/post/VoteButtons";
import { CommentThread } from "@/components/post/CommentThread";
import { TeamBadge } from "@/components/team/TeamBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export default function PostDetailPage({ params }: { params: { postId: string } }) {
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postDoc = await getDoc(doc(db, "posts", params.postId));
        if (postDoc.exists()) {
          setPost({ id: postDoc.id, ...postDoc.data() });
        }

        const commentsSnap = await getDocs(collection(db, "posts", params.postId, "comments"));
        const fetchedComments = commentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setComments(fetchedComments);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.postId]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !auth.currentUser) return;
    setSubmitting(true);
    try {
      const commentObj = {
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || "Anonymous",
        body: newComment,
        createdAt: serverTimestamp(),
        upvotes: 0,
        downvotes: 0,
        score: 0,
        parentCommentId: null
      };
      
      const docRef = await addDoc(collection(db, "posts", params.postId, "comments"), commentObj);
      await updateDoc(doc(db, "posts", params.postId), {
        commentCount: increment(1)
      });
      
      setComments([...comments, { id: docRef.id, ...commentObj, createdAt: { seconds: Date.now() / 1000 } }]);
      setNewComment("");
    } catch (e) {
      console.error(e);
      alert("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-neutral-400 min-h-screen pt-20">Loading post...</div>;
  if (!post) return <div className="p-8 text-center text-neutral-400 min-h-screen pt-20">Post not found.</div>;

  const timeAgo = post.createdAt?.seconds 
    ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() 
    : "Just now";

  return (
    <div className="container mx-auto px-4 py-8 pb-16 max-w-4xl">
      <div className="mb-6">
        <Link href={`/forums/${post.forumId}`} className="text-sm text-neutral-400 hover:text-white transition-colors">
          &larr; Back to Forum
        </Link>
      </div>

      <Card className="bg-neutral-900 border-neutral-800 text-white mb-8 overflow-hidden flex flex-row p-0 gap-0">
        <div className="bg-neutral-950 p-4 flex flex-col items-center border-r border-neutral-800 shrink-0">
          <VoteButtons itemId={post.id} initialScore={post.score || 0} collectionName="posts" />
        </div>
        <CardContent className="p-6 md:p-8 flex-1">
          <div className="flex items-center text-sm text-neutral-400 mb-4 space-x-2">
            {post.authorBadge && (
              <TeamBadge letters={post.authorBadge.letters} color={post.authorBadge.color} className="w-6 h-6 text-[10px]" />
            )}
            <span className="font-semibold text-neutral-300">{post.authorName}</span>
            <span>•</span>
            <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{timeAgo}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{post.title}</h1>
          <div className="text-neutral-200 whitespace-pre-wrap leading-relaxed">
            {post.body}
          </div>
          
          {post.matchId && (
            <div className="mt-8 pt-4 border-t border-neutral-800">
              <Link href={`/matches/${post.matchId}`} className="text-blue-400 hover:underline">
                View Attached Match
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">{post.commentCount || 0} Comments</h3>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <textarea 
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex min-h-[80px] w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 text-white mb-4"
          />
          <div className="flex justify-end">
            <Button onClick={handleAddComment} disabled={submitting} className="bg-white text-black hover:bg-neutral-200">
              {submitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-neutral-950/50 rounded-xl p-4 md:p-8 border border-neutral-800/50">
        <CommentThread comments={comments} postId={post.id} />
      </div>
    </div>
  );
}
