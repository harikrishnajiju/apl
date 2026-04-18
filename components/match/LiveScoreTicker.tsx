import { Card, CardContent } from "@/components/ui/card";
import { useLiveMatch } from "@/lib/liveSimulator";
import { TeamBadge } from "@/components/team/TeamBadge";

export function LiveScoreTicker({ matchId, initialMatch, teamAColor, teamBColor }: any) {
  const match = useLiveMatch(matchId, initialMatch);
  if (!match) return null;

  return (
    <Card className="bg-neutral-900 border-neutral-800 text-white mb-8 overflow-hidden">
      <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 flex items-center justify-center">
        <span className="flex items-center text-xs font-bold text-red-500 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-500 mr-2 flex-shrink-0" />
          LIVE MATCH SIMULATION
        </span>
      </div>
      <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
        <div className="flex flex-col items-center flex-1">
          <TeamBadge letters={match.teamA} color={teamAColor} className="w-20 h-20 text-2xl mb-4 shadow-xl" />
          <h2 className="text-2xl font-bold">{match.teamA}</h2>
          {match.scoreA ? (
            <div className="text-center mt-2">
              <div className="text-4xl font-black">{match.scoreA.runs}/{match.scoreA.wickets}</div>
              <div className="text-neutral-400 mt-1">({match.scoreA.overs} overs)</div>
            </div>
          ) : (
            <div className="text-xl text-neutral-500 mt-2">Yet to bat</div>
          )}
        </div>

        <div className="text-3xl font-black text-neutral-700">VS</div>

        <div className="flex flex-col items-center flex-1">
          <TeamBadge letters={match.teamB} color={teamBColor} className="w-20 h-20 text-2xl mb-4 shadow-xl" />
          <h2 className="text-2xl font-bold">{match.teamB}</h2>
          {match.scoreB ? (
            <div className="text-center mt-2">
              <div className="text-4xl font-black">{match.scoreB.runs}/{match.scoreB.wickets}</div>
              <div className="text-neutral-400 mt-1">({match.scoreB.overs} overs)</div>
            </div>
          ) : (
            <div className="text-xl text-neutral-500 mt-2">Yet to bat</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
