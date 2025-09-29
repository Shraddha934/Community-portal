"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { Trophy, Award, Star, Crown, Building2 } from "lucide-react";
import { motion } from "framer-motion";

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
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch points");
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, [isLoaded, userEmail]);

  // Badge thresholds
  const badges = [
    {
      label: "City Hero",
      icon: <Building2 className="w-10 h-10" />,
      threshold: 100,
      gradient: "from-purple-500 to-indigo-500",
    },
    {
      label: "Gold",
      icon: <Crown className="w-10 h-10" />,
      threshold: 80,
      gradient: "from-yellow-400 to-yellow-600",
    },
    {
      label: "Silver",
      icon: <Star className="w-10 h-10" />,
      threshold: 60,
      gradient: "from-gray-300 to-gray-500",
    },
    {
      label: "Bronze",
      icon: <Award className="w-10 h-10" />,
      threshold: 40,
      gradient: "from-orange-400 to-red-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6 flex flex-col items-start">
      {/* Total Points Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="p-4 w-full max-w-xs rounded-2xl shadow-lg bg-white/90 backdrop-blur-md mb-8 mt-20">
          <CardHeader className="flex flex-col items-start">
            <Trophy className="w-10 h-10 text-yellow-500 mb-2" />
            <CardTitle className="text-lg font-bold text-gray-800">
              🏆 Your Total Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-blue-600 drop-shadow-sm">
              {loading ? "…" : error ? error : points}
            </div>
            {!loading && !error && (
              <p className="text-sm text-gray-600 italic">
                Keep reporting issues, {user?.firstName || "Champion"}! 🚀
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Badges Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {badges.map((badge, idx) => {
          const unlocked = points >= badge.threshold;
          const pointsNeeded = badge.threshold - points;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.2 }}
            >
              <Card
                className={`p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center transform transition hover:scale-105 ${
                  unlocked
                    ? `bg-gradient-to-br ${badge.gradient} text-white`
                    : "bg-white/80 text-gray-800"
                }`}
              >
                <div className="mb-3">{badge.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{badge.label}</h3>
                {unlocked ? (
                  <p className="text-sm font-medium">✅ Unlocked!</p>
                ) : (
                  <p className="text-sm text-gray-600">
                    {pointsNeeded} points needed
                  </p>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
