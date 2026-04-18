import { Card, CardContent } from "@/components/ui/card";
import { VoteButtons } from "./VoteButtons";
import { TeamBadge } from "@/components/team/TeamBadge";
import Link from "next/link";
import { MessageSquare, Clock } from "lucide-react";

export function PostCard({ post }: { post: any }) {
  const timeAgo = post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : "Just now";

  return (
    <Card className="bg-neutral-900 border-neutral-800 text-white hover:border-neutral-700 transition-colors flex overflow-hidden">
      <div className="bg-neutral-950 p-2 flex items-start border-r border-neutral-800">
        <VoteButtons itemId={post.id} initialScore={post.score || 0} collectionName="posts" />
      </div>
      <CardContent className="p-4 flex-1">
        <div className="flex items-center text-xs text-neutral-400 mb-2 space-x-2">
          {post.authorBadge && (
            <TeamBadge letters={post.authorBadge.letters} color={post.authorBadge.color} className="w-5 h-5 text-[10px]" />
          )}
          <span className="font-semibold text-neutral-300">{post.authorName}</span>
          <span>•</span>
          <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{timeAgo}</span>
        </div>
        <Link href={`/posts/${post.id}`}>
          <h3 className="text-lg font-bold mb-2 hover:underline">{post.title}</h3>
          <p className="text-sm text-neutral-300 line-clamp-3 mb-4">{post.body}</p>
        </Link>
        <div className="flex items-center text-xs text-neutral-500 space-x-4">
          <Link href={`/posts/${post.id}`} className="flex items-center hover:bg-neutral-800 p-1.5 rounded-md transition-colors">
            <MessageSquare className="w-4 h-4 mr-1.5" />
            {post.commentCount || 0} Comments
          </Link>
          {post.matchId && (
            <Link href={`/matches/${post.matchId}`} className="text-blue-400 hover:underline">
              Attached Match
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
