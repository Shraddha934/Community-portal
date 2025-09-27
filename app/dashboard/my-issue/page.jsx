"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function MyIssuesPage() {
  const { user, isLoaded } = useUser(); // wait until Clerk user is loaded
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extract email once user is loaded
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const router = useRouter();
  useEffect(() => {
    if (!isLoaded || !userEmail) return; // wait until user and email are ready

    const fetchIssues = async () => {
      try {
        setLoading(true);
        // Pass email as query param
        const res = await axios.get(`/api/my-issues?email=${userEmail}`);
        const totalPoints = res.data.points;
        const userIssues = res.data.issues;

        const pointsPerIssue =
          userIssues.length > 0
            ? Math.floor(totalPoints / userIssues.length)
            : 0;
        setIssues(
          res.data.issues.map((issue) => ({
            ...issue,
            userPoints: pointsPerIssue,
          }))
        );
      } catch (err) {
        console.error("Error fetching issues:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [isLoaded, userEmail]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        My Reported Issues
      </h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading issues...</p>
      ) : issues.length === 0 ? (
        <p className="text-center text-gray-600">No issues reported yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue) => (
            <Card
              key={issue._id}
              className="shadow-md rounded-xl cursor-pointer hover:shadow-lg transition"
              onClick={() =>
                router.push(`/dashboard/view-issue?id=${issue._id}`)
              }
            >
              <div className="relative">
                <img
                  src={issue.image}
                  alt={issue.issueType}
                  className="w-full h-40 object-cover rounded-t-xl"
                />
                <Badge className="absolute top-2 left-2 bg-white/80 backdrop-blur-md text-gray-800">
                  {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                </Badge>
              </div>

              <CardContent className="p-4 space-y-2">
                {/* Issue Type */}
                <h2 className="font-semibold text-lg">
                  {issue.issueType.replaceAll("_", " ")}
                </h2>

                {/* Landmark */}
                {issue.location?.landmark && (
                  <p className="text-sm text-gray-600">
                    📍 {issue.location.landmark}
                  </p>
                )}

                {/* Full Address */}
                {issue.location?.fullAddress && (
                  <p className="text-xs text-gray-500">
                    🏠 {issue.location.fullAddress}
                  </p>
                )}

                {/* Description */}
                {issue.description && (
                  <p className="text-sm text-gray-700 line-clamp-2">
                    📝 {issue.description}
                  </p>
                )}

                {/* Date */}
                <p className="text-xs text-gray-500">
                  📅 {new Date(issue.createdAt).toLocaleDateString()}
                </p>

                {/* Priority */}
                <p className="text-sm font-medium">
                  Priority:{" "}
                  <span
                    className={
                      issue.priority === "high"
                        ? "text-red-600"
                        : issue.priority === "medium"
                        ? "text-yellow-500"
                        : "text-green-600"
                    }
                  >
                    {issue.criticality}
                  </span>
                </p>

                {/* Points */}
                <p className="text-sm font-semibold text-blue-600">
                  🎯 Points: {issue.userPoints}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
