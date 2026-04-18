"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { NextMatchWidget } from "@/components/dashboard/NextMatchWidget";
import { StandingsTable } from "@/components/dashboard/StandingsTable";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { MatchCard } from "@/components/match/MatchCard";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser(userData);
            
            // Fetch teams
            const teamsSnapshot = await getDocs(collection(db, "teams"));
            const teamsList = teamsSnapshot.docs.map(d => d.data());
            setTeams(teamsList);

            // Fetch recent matches for team
            // Firebase doesn't support logical OR in simple queries without "in" up to 10.
            // So we just fetch all and filter client side for now since it's a hackathon demo.
            const matchSnapshot = await getDocs(collection(db, "matches"));
            const matchData = matchSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            
            // Filter
            const userMatches = matchData.filter(m => m.teamA === userData.favoriteIplTeam || m.teamB === userData.favoriteIplTeam);
            
            // Sort by date descending
            userMatches.sort((a, b) => b.date.seconds - a.date.seconds);
            setMatches(userMatches);
          }
        } catch (error) {
          console.error("Dashboard error:", error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex justify-center text-neutral-400">
        Loading your dashboard...
      </div>
    );
  }

  if (!user) return null;

  // Split matches into upcoming and past
  const now = new Date().getTime() / 1000;
  const upcomingMatches = matches.filter(m => m.date.seconds > now || m.status === "live" || m.status === "upcoming").reverse();
  const pastMatches = matches.filter(m => m.status === "completed").slice(0, 5);

  const nextMatch = upcomingMatches[0] || null;
  
  const getTeamColor = (code: string) => {
    return teams.find(t => t.shortCode === code)?.primaryColor || "#FFFFFF";
  };

  const bgStyle = user.badge?.color ? {
    background: `linear-gradient(to bottom, ${user.badge.color}15, transparent)`,
    minHeight: 'calc(100vh - 4rem)'
  } : { minHeight: 'calc(100vh - 4rem)' };

  return (
    <div style={bgStyle}>
      <div className="container mx-auto px-4 pt-8 pb-12">
        <h1 className="text-3xl font-bold mb-8">
          Welcome back, {user.displayName?.split(" ")[0] || "Fan"}
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Matches */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <NextMatchWidget 
                match={nextMatch} 
                teamAColor={getTeamColor(nextMatch?.teamA)}
                teamBColor={getTeamColor(nextMatch?.teamB)}
              />
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4">Last 5 Matches</h2>
              {pastMatches.length === 0 ? (
                <div className="text-neutral-500 bg-neutral-900/50 p-6 rounded-xl border border-neutral-800">
                  No recent matches found for {user.favoriteIplTeam}.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pastMatches.map(m => (
                    <MatchCard 
                      key={m.id} 
                      match={m} 
                      teamAColor={getTeamColor(m.teamA)}
                      teamBColor={getTeamColor(m.teamB)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
          
          {/* Right Column: Standings & Activity */}
          <div className="space-y-8">
            <section>
              <StandingsTable teams={teams} favoriteTeamId={user.favoriteIplTeam} />
            </section>
            
            <section>
              <RecentActivity />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
