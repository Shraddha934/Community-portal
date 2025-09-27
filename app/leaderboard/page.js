"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>🏆 Top Contributors of the Month</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2">Rank</th>
              <th className="p-2">Name</th>
              <th className="p-2">Points</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <tr key={user._id} className="border-b">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{user.name || user.email}</td>
                <td className="p-2">{user.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
