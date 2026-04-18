import { Card, CardContent } from "@/components/ui/card";
import { TeamBadge } from "@/components/team/TeamBadge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function TeamCard({ team }: { team: any }) {
  const hexToRgbA = (hex: string, alpha: number) => {
    if (!hex || hex.length !== 7) return `rgba(255,255,255,${alpha})`;
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <Link href={`/teams/${team.shortCode}`} className="block h-full transition-transform hover:-translate-y-1">
      <Card 
        className="h-full border-neutral-800 text-white overflow-hidden relative group"
        style={{ backgroundColor: hexToRgbA(team.primaryColor, 0.1) }}
      >
        <div 
          className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-20 transition-opacity group-hover:opacity-40"
          style={{ backgroundColor: team.primaryColor }}
        />
        <CardContent className="p-6 relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-start mb-6">
            <TeamBadge letters={team.shortCode} color={team.primaryColor} className="w-12 h-12 text-base shadow-lg shadow-black/20 flex-shrink-0" />
            <ArrowRight className="w-5 h-5 text-neutral-500 opacity-0 -translate-x-4 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
          </div>
          <div className="mt-auto">
            <h3 className="text-xl font-bold leading-tight">{team.name}</h3>
            <p className="text-sm text-neutral-400 mt-2 flex justify-between items-center">
              <span className="truncate">{team.homeGround}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
