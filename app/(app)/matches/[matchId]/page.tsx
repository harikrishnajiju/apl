"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { LiveScoreTicker } from "@/components/match/LiveScoreTicker";
import { Scorecard } from "@/components/match/Scorecard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Youtube, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function MatchDetailPage({ params }: { params: { matchId: string } }) {
  const [initialMatch, setInitialMatch] = useState<any>(null);
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const matchDoc = await getDoc(doc(db, "matches", params.matchId));
        if (matchDoc.exists()) {
          const matchData = { id: matchDoc.id, ...matchDoc.data() };
          setInitialMatch(matchData);
          if (matchData.summary) {
            setSummary(matchData.summary);
          }
        }

        const teamsSnap = await getDocs(collection(db, "teams"));
        setAllTeams(teamsSnap.docs.map(d => d.data()));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.matchId]);

  if (loading) return <div className="p-8 text-neutral-400 text-center min-h-screen pt-20">Loading match...</div>;
  if (!initialMatch) return <div className="p-8 text-neutral-400 text-center min-h-screen pt-20">Match not found.</div>;

  const getTeamColor = (code: string) => allTeams.find(t => t.shortCode === code)?.primaryColor || "#FFFFFF";

  const generateSummary = async () => {
    if (generatingSummary) return;
    setGeneratingSummary(true);
    try {
      const res = await fetch("/api/gemini/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchData: initialMatch }),
      });
      const data = await res.json();
      
      if (data.summary) {
        setSummary(data.summary);
        // Cache to firestore
        await updateDoc(doc(db, "matches", params.matchId), { summary: data.summary });
      } else {
        throw new Error(data.error || "Failed");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate summary. Please ensure your Gemini API key is set.");
    } finally {
      setGeneratingSummary(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-16 max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-white transition-colors">
          &larr; Back to Dashboard
        </Link>
      </div>

      <LiveScoreTicker 
        matchId={params.matchId} 
        initialMatch={initialMatch} 
        teamAColor={getTeamColor(initialMatch.teamA)} 
        teamBColor={getTeamColor(initialMatch.teamB)} 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          {/* AI Match Summary */}
          <Card className="bg-neutral-900 border-neutral-800 text-white overflow-hidden relative h-full">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Sparkles className="w-32 h-32" />
            </div>
            <CardHeader className="p-4 border-b border-neutral-800 flex flex-row items-center justify-between relative z-10 bg-neutral-950">
              <CardTitle className="text-lg font-bold flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-yellow-400" /> AI Match Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 relative z-10 flex flex-col justify-center min-h-[160px]">
              {summary ? (
                <p className="text-neutral-200 leading-relaxed">{summary}</p>
              ) : (
                <div className="text-center py-2">
                  <p className="text-neutral-400 mb-4 text-sm">Generate a 3-sentence punchy summary of this match using Gemini AI.</p>
                  <Button 
                    onClick={generateSummary} 
                    disabled={generatingSummary}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
                  >
                    {generatingSummary ? "Generating..." : "Generate AI Summary"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Player of Match */}
          {initialMatch.playerOfMatch && (
            <Card className="bg-neutral-900 border-neutral-800 text-white">
              <CardHeader className="p-4 border-b border-neutral-800">
                <CardTitle className="text-sm uppercase text-neutral-400 tracking-wider">Player of the Match</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="font-bold text-lg">{initialMatch.playerOfMatch}</p>
              </CardContent>
            </Card>
          )}

          {/* Highlights */}
          {initialMatch.highlightsSearchQuery && (
            <Card className="bg-neutral-900 border-neutral-800 text-white transition-colors hover:border-neutral-700">
              <a 
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(initialMatch.highlightsSearchQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-red-500">
                    <Youtube className="w-6 h-6" />
                    <span className="font-bold">Watch Highlights</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-neutral-500" />
                </div>
              </a>
            </Card>
          )}
        </div>
      </div>

      <Scorecard innings={initialMatch.innings || []} />
    </div>
  );
}
