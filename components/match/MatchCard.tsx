import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { TeamBadge } from "@/components/team/TeamBadge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface MatchCardProps {
  match: any;
  teamAColor?: string;
  teamBColor?: string;
}

export function MatchCard({ match, teamAColor = "#FFFFFF", teamBColor = "#FFFFFF" }: MatchCardProps) {
  const isLive = match.status === "live";
  const isUpcoming = match.status === "upcoming";
  const isCompleted = match.status === "completed";

  const matchDate = match.date?.seconds 
    ? new Date(match.date.seconds * 1000) 
    : new Date(match.date);

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Card className="bg-neutral-900 border-neutral-800 text-white overflow-hidden transition-colors hover:border-neutral-700 hover:bg-neutral-800/50">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <span className="text-xs text-neutral-400">
          {formatter.format(matchDate)}
        </span>
        {isLive && (
          <span className="flex items-center text-xs font-bold text-red-500 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5" />
            LIVE
          </span>
        )}
        {isUpcoming && <span className="text-xs font-medium text-blue-400">UPCOMING</span>}
        {isCompleted && <span className="text-xs font-medium text-neutral-500">FINAL</span>}
      </CardHeader>
      
      <Link href={`/matches/${match.id}`} className="block">
        <CardContent className="p-4 pt-2">
          <div className="flex flex-col space-y-4">
            {/* Team A */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TeamBadge letters={match.teamA} color={teamAColor} />
                <span className="font-semibold">{match.teamA}</span>
              </div>
              {match.scoreA ? (
                <div className="text-right">
                  <span className="font-bold text-lg">{match.scoreA.runs}/{match.scoreA.wickets}</span>
                  <span className="text-xs text-neutral-400 ml-2">({match.scoreA.overs})</span>
                </div>
              ) : (
                <span className="text-neutral-500">-</span>
              )}
            </div>

            {/* Team B */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TeamBadge letters={match.teamB} color={teamBColor} />
                <span className="font-semibold">{match.teamB}</span>
              </div>
              {match.scoreB ? (
                <div className="text-right">
                  <span className="font-bold text-lg">{match.scoreB.runs}/{match.scoreB.wickets}</span>
                  <span className="text-xs text-neutral-400 ml-2">({match.scoreB.overs})</span>
                </div>
              ) : (
                <span className="text-neutral-500">-</span>
              )}
            </div>
          </div>
        </CardContent>
      </Link>

      {(match.result || isLive) && (
        <CardFooter className="p-4 pt-2 border-t border-neutral-800/50 bg-neutral-900/50 flex items-center justify-between">
          <p className="text-xs text-neutral-300 truncate mr-2">
            {match.result || "Match in progress..."}
          </p>
          <ArrowRight className="w-4 h-4 text-neutral-500 flex-shrink-0" />
        </CardFooter>
      )}
    </Card>
  );
}
