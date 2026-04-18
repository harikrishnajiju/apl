import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function Scorecard({ innings }: { innings: any[] }) {
  if (!innings || innings.length === 0) return null;

  return (
    <div className="space-y-6">
      {innings.map((inning, idx) => (
        <Card key={idx} className="bg-neutral-900 border-neutral-800 text-white overflow-hidden">
          <CardHeader className="p-4 border-b border-neutral-800 bg-neutral-950 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">{inning.team} Innings</CardTitle>
            <div className="font-bold">
              {inning.runs}/{inning.wickets} <span className="text-neutral-400 font-normal text-sm ml-2">({inning.overs} ov)</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800">
              {/* Batters */}
              <div className="p-4">
                <div className="flex text-xs font-semibold text-neutral-400 uppercase mb-3 px-2">
                  <span className="flex-1">Top Batters</span>
                  <div className="w-32 flex justify-between text-right">
                    <span className="w-10">R</span>
                    <span className="w-10">B</span>
                    <span className="w-12">SR</span>
                  </div>
                </div>
                <div className="space-y-1">
                  {inning.topScorers?.map((batter: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm hover:bg-neutral-800/50 p-2 rounded-md">
                      <span className="font-medium truncate mr-2">{batter.name}</span>
                      <div className="w-32 flex justify-between text-right flex-shrink-0">
                        <span className="font-bold w-10">{batter.runs}</span>
                        <span className="text-neutral-400 w-10">{batter.balls}</span>
                        <span className="text-neutral-500 w-12">{batter.sr}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Bowlers */}
              <div className="p-4">
                <div className="flex text-xs font-semibold text-neutral-400 uppercase mb-3 px-2">
                  <span className="flex-1">Top Bowlers</span>
                  <div className="w-32 flex justify-between text-right">
                    <span className="w-12">W-R</span>
                    <span className="w-10">O</span>
                    <span className="w-10">Econ</span>
                  </div>
                </div>
                <div className="space-y-1">
                  {inning.topBowlers?.map((bowler: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm hover:bg-neutral-800/50 p-2 rounded-md">
                      <span className="font-medium truncate mr-2">{bowler.name}</span>
                      <div className="w-32 flex justify-between text-right flex-shrink-0">
                        <span className="font-bold w-12">{bowler.wickets}-{bowler.runs}</span>
                        <span className="text-neutral-400 w-10">{bowler.overs}</span>
                        <span className="text-neutral-500 w-10">{bowler.econ}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
