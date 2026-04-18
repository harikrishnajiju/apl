import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export function useLiveMatch(matchId: string, initialMatch: any) {
  const [match, setMatch] = useState(initialMatch);

  useEffect(() => {
    // Only run if match is live
    if (!initialMatch || initialMatch.status !== "live") {
      setMatch(initialMatch);
      return;
    }

    const sessionKey = `live_match_${matchId}`;
    const stored = sessionStorage.getItem(sessionKey);
    let currentInningIdx = initialMatch.innings ? initialMatch.innings.length - 1 : 0;
    
    if (stored) {
      const parsed = JSON.parse(stored);
      setMatch(parsed);
      currentInningIdx = parsed.innings ? parsed.innings.length - 1 : 0;
    } else {
      setMatch(initialMatch);
    }

    const interval = setInterval(() => {
      setMatch((prev: any) => {
        if (prev.status !== "live") return prev;
        
        const next = JSON.parse(JSON.stringify(prev));
        if (!next.innings || next.innings.length === 0) return next;
        
        const currentInning = next.innings[currentInningIdx];
        
        // 1. Add runs (0-6)
        const runsScored = Math.floor(Math.random() * 7);
        currentInning.runs += runsScored;

        // 2. Wicket? (5% chance)
        if (Math.random() < 0.05 && currentInning.wickets < 10) {
          currentInning.wickets += 1;
        }

        // 3. Update overs
        let balls = Math.round((currentInning.overs - Math.floor(currentInning.overs)) * 10);
        balls += 1;
        if (balls === 6) {
          currentInning.overs = Math.floor(currentInning.overs) + 1;
        } else {
          currentInning.overs = Math.floor(currentInning.overs) + (balls / 10);
        }

        // 4. Update top batter randomly
        if (currentInning.topScorers && currentInning.topScorers.length > 0) {
          currentInning.topScorers[0].runs += runsScored;
          currentInning.topScorers[0].balls += 1;
          currentInning.topScorers[0].sr = parseFloat(((currentInning.topScorers[0].runs / currentInning.topScorers[0].balls) * 100).toFixed(1));
        }

        // Update scoreA or scoreB shortcut
        if (next.teamA === currentInning.team) {
          next.scoreA = { runs: currentInning.runs, wickets: currentInning.wickets, overs: currentInning.overs };
        } else {
          next.scoreB = { runs: currentInning.runs, wickets: currentInning.wickets, overs: currentInning.overs };
        }

        // Check for end of innings
        if (currentInning.wickets === 10 || currentInning.overs >= 20) {
          if (currentInningIdx === 0) {
            // Start second innings (mocking)
            currentInningIdx = 1;
            next.innings.push({
              team: prev.teamA === currentInning.team ? prev.teamB : prev.teamA,
              runs: 0,
              wickets: 0,
              overs: 0,
              topScorers: [],
              topBowlers: []
            });
            next.scoreB = { runs: 0, wickets: 0, overs: 0 };
          } else {
            // End of match
            next.status = "completed";
            next.result = "Match Completed";
            clearInterval(interval);
            // Optionally update firestore to completed
            updateDoc(doc(db, "matches", matchId), { status: "completed", result: next.result, innings: next.innings, scoreA: next.scoreA, scoreB: next.scoreB }).catch(console.error);
          }
        }

        sessionStorage.setItem(sessionKey, JSON.stringify(next));
        return next;
      });
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }, [matchId, initialMatch]);

  return match;
}
