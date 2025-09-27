"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { Trophy } from "lucide-react";

export default function LeaderboardPage() {
  const { user, isLoaded } = useUser();
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userEmail = user?.primaryEmailAddress?.emailAddress;

  useEffect(() => {
    if (!isLoaded || !userEmail) return;

    const fetchPoints = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/my-issues?email=${userEmail}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        setPoints(data.points ?? 0);
        console.log("Fetched total points:", data.points);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch points");
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, [isLoaded, userEmail]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6">
      <Card className="p-6 w-full max-w-sm rounded-2xl shadow-xl bg-white/90 backdrop-blur-md">
        <CardHeader className="flex flex-col items-center">
          <Trophy className="w-12 h-12 text-yellow-500 mb-2" />
          <CardTitle className="text-xl font-bold text-gray-800">
            🏆 Your Total Points
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-2">
          <div className="text-5xl font-extrabold text-blue-600 drop-shadow-sm">
            {loading ? "…" : error ? error : points}
          </div>
          {!loading && !error && (
            <p className="text-sm text-gray-600 italic">
              Keep reporting issues, {user?.firstName || "Champion"}! 🚀
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
