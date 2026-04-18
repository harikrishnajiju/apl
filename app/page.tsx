"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Just redirect to dashboard, which will handle auth checks
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400">
      Loading PitchSide...
    </div>
  );
}
