import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamBadge } from "@/components/team/TeamBadge";
import Link from "next/link";
import { Clock } from "lucide-react";

export function NextMatchWidget({ match, teamAColor, teamBColor }: any) {
  if (!match) return null;
  
  const matchDate = match.date?.seconds 
    ? new Date(match.date.seconds * 1000) 
    : new Date(match.date);

  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Card className="bg-neutral-900 border-neutral-800 text-white overflow-hidden shadow-lg transition-all hover:border-neutral-700">
      <CardHeader className="bg-neutral-950 p-4 border-b border-neutral-800 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold text-neutral-200">Next Match</CardTitle>
        <div className="flex items-center text-xs text-neutral-400 bg-neutral-900 px-2 py-1 rounded-md">
          <Clock className="w-3 h-3 mr-1.5" />
          <span>{formatter.format(matchDate)}</span>
        </div>
      </CardHeader>
      <Link href={`/matches/${match.id}`} className="block transition-colors hover:bg-neutral-800/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-6">
            <div className="flex flex-col items-center space-y-2">
              <TeamBadge letters={match.teamA} color={teamAColor} className="w-16 h-16 text-lg" />
              <span className="font-bold">{match.teamA}</span>
            </div>
            
            <div className="text-xl font-black text-neutral-600">VS</div>
            
            <div className="flex flex-col items-center space-y-2">
              <TeamBadge letters={match.teamB} color={teamBColor} className="w-16 h-16 text-lg" />
              <span className="font-bold">{match.teamB}</span>
            </div>
          </div>
          <div className="mt-6 text-center text-sm text-neutral-400">
            {match.venue}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
