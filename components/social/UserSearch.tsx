"use client";

import { useState } from "react";
import { db } from "@/lib/firebase/client";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TeamBadge } from "@/components/team/TeamBadge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function UserSearch() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    
    setSearching(true);
    setHasSearched(true);
    try {
      // Basic prefix search using Firestore
      const q = query(
        collection(db, "users"),
        where("displayName", ">=", search),
        where("displayName", "<=", search + "\uf8ff"),
        limit(5)
      );
      const snap = await getDocs(q);
      setResults(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error(error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="w-full relative">
      <form onSubmit={handleSearch} className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-neutral-500" />
        </div>
        <Input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search fans by exact display name..."
          className="pl-10 bg-neutral-900 border-neutral-800 text-white w-full"
        />
        <button type="submit" className="hidden" />
      </form>

      {hasSearched && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
          {searching ? (
            <div className="p-4 text-center text-sm text-neutral-400">Searching...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-neutral-400">No users found matching "{search}"</div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {results.map(user => (
                <Link key={user.id} href={`/profile/${user.id}`} className="flex items-center justify-between p-3 hover:bg-neutral-800/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <TeamBadge letters={user.badge?.letters || "?"} color={user.badge?.color || "#333"} className="w-8 h-8 text-[10px]" />
                    <div>
                      <div className="font-semibold text-sm text-white">{user.displayName}</div>
                      <div className="text-xs text-neutral-400">{user.favoriteIplTeam} Fan</div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">View</Button>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
