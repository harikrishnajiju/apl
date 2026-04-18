"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { collection, getDocs } from "firebase/firestore";
import { TeamCard } from "@/components/team/TeamCard";

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const snap = await getDocs(collection(db, "teams"));
        const data = snap.docs.map(d => d.data());
        data.sort((a, b) => a.name.localeCompare(b.name));
        setTeams(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  if (loading) return <div className="p-8 text-neutral-400 text-center min-h-screen">Loading teams...</div>;

  return (
    <div className="container mx-auto px-4 py-8 pb-16">
      <h1 className="text-3xl font-bold mb-2">IPL Franchises</h1>
      <p className="text-neutral-400 mb-8">Select a team to view their squad and recent matches.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {teams.map(team => (
          <TeamCard key={team.shortCode} team={team} />
        ))}
      </div>
    </div>
  );
}
