"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { TeamBadge } from "@/components/team/TeamBadge";
import { MatchCard } from "@/components/match/MatchCard";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, MapPin, Target } from "lucide-react";

export default function TeamDetailPage({ params }: { params: { teamId: string } }) {
  const [team, setTeam] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teamDoc = await getDoc(doc(db, "teams", params.teamId));
        if (teamDoc.exists()) {
          setTeam(teamDoc.data());
        }

        const teamsSnap = await getDocs(collection(db, "teams"));
        setAllTeams(teamsSnap.docs.map(d => d.data()));

        const matchSnap = await getDocs(collection(db, "matches"));
        const matchData = matchSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const teamMatches = matchData.filter(m => m.teamA === params.teamId || m.teamB === params.teamId);
        teamMatches.sort((a, b) => b.date.seconds - a.date.seconds);
        setMatches(teamMatches);

        const playerSnap = await getDocs(collection(db, "players"));
        const playerData = playerSnap.docs.map(d => d.data());
        const teamPlayers = playerData.filter(p => p.team === params.teamId);
        setPlayers(teamPlayers);

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.teamId]);

  if (loading) return <div className="p-8 text-neutral-400 text-center min-h-screen pt-20">Loading team details...</div>;
  if (!team) return <div className="p-8 text-neutral-400 text-center min-h-screen pt-20">Team not found.</div>;

  const getTeamColor = (code: string) => allTeams.find(t => t.shortCode === code)?.primaryColor || "#FFFFFF";

  return (
    <div className="min-h-full pb-16">
      {/* Header Banner */}
      <div 
        className="w-full h-48 md:h-64 relative border-b border-neutral-800 flex flex-col justify-end px-4 md:px-8 pb-6 overflow-hidden"
      >
        <div 
          className="absolute inset-0 z-0 opacity-40"
          style={{ 
            background: `linear-gradient(to top, ${team.primaryColor}, transparent)`
          }}
        />
        <div className="container mx-auto flex items-end space-x-6 relative z-10">
          <TeamBadge letters={team.shortCode} color={team.primaryColor} className="w-24 h-24 text-3xl shadow-2xl border-4 border-neutral-950 hidden sm:flex flex-shrink-0" />
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-md">{team.name}</h1>
            <p className="text-neutral-200 mt-2 font-medium flex items-center">
              <MapPin className="w-4 h-4 mr-1" /> {team.homeGround}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4">Last 5 Matches</h2>
              {matches.length === 0 ? (
                <div className="text-neutral-500 bg-neutral-900/50 p-6 rounded-xl border border-neutral-800">
                  No match data found.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {matches.slice(0, 5).map(m => (
                    <MatchCard key={m.id} match={m} teamAColor={getTeamColor(m.teamA)} teamBColor={getTeamColor(m.teamB)} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-neutral-400" /> Key Players
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {players.map(player => (
                  <Card key={player.name} className="bg-neutral-900 border-neutral-800 text-white">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-bold">{player.name}</div>
                        <div className="text-xs text-neutral-400">{player.role}</div>
                      </div>
                      <div className="text-right text-xs">
                        <div className="text-neutral-300">{player.runs > 0 && `${player.runs} Runs`}</div>
                        <div className="text-neutral-300">{player.wickets > 0 && `${player.wickets} Wickets`}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-neutral-900 border-neutral-800 text-white">
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="text-sm text-neutral-400 uppercase tracking-wider font-semibold mb-1">Captain</div>
                  <div className="text-lg font-bold">{team.captain}</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-400 uppercase tracking-wider font-semibold mb-1">Coach</div>
                  <div className="text-lg font-bold">{team.coach}</div>
                </div>
                <div className="flex items-center space-x-3 pt-4 border-t border-neutral-800">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <div>
                    <div className="text-sm text-neutral-400">IPL Titles</div>
                    <div className="text-xl font-black">{team.titles}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Target className="w-6 h-6 text-blue-400" />
                  <div>
                    <div className="text-sm text-neutral-400">Current Rank</div>
                    <div className="text-xl font-black">{team.currentSeasonRank}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
