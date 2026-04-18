import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StandingsTable({ teams, favoriteTeamId }: { teams: any[]; favoriteTeamId: string }) {
  // Sort by rank
  const sortedTeams = [...teams].sort((a, b) => a.currentSeasonRank - b.currentSeasonRank);

  return (
    <Card className="bg-neutral-900 border-neutral-800 text-white">
      <CardHeader className="p-4 border-b border-neutral-800">
        <CardTitle className="text-lg font-bold">Current IPL Standings</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-400 bg-neutral-950">
              <tr>
                <th className="px-4 py-3 font-medium">Pos</th>
                <th className="px-4 py-3 font-medium">Team</th>
                <th className="px-4 py-3 font-medium text-center">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {sortedTeams.map((team) => (
                <tr 
                  key={team.shortCode} 
                  className={cn(
                    "hover:bg-neutral-800/50 transition-colors",
                    team.shortCode === favoriteTeamId ? "bg-neutral-800/80 font-medium" : ""
                  )}
                >
                  <td className="px-4 py-3">{team.currentSeasonRank}</td>
                  <td className="px-4 py-3 flex items-center space-x-2">
                    <span 
                      className="w-2 h-2 rounded-full block flex-shrink-0" 
                      style={{ backgroundColor: team.primaryColor }}
                    />
                    <span>{team.name}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {/* Mock points based on rank for demo */}
                    {(10 - team.currentSeasonRank) * 2 + 2}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
