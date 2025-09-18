"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import IssueStatus from "../../components/IssueStatus";
import IssueMap from "../../components/IssueMap";

export default function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIssues() {
      try {
        const res = await axios.get("/api/issues");
        if (res.data.success) {
          setIssues(res.data.issues);
        }
      } catch (err) {
        console.error("Error fetching issues:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchIssues();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Loading issues...</p>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">📋 All Reported Issues</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {issues.map((issue) => (
          <Card key={issue._id} className="shadow-md rounded-lg">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="capitalize">{issue.issueType.replaceAll("_", " ")}</span>
                {/* 🔥 Status dropdown instead of static badge */}
                <IssueStatus issue={issue} />
              </CardTitle>
            </CardHeader>

            <CardContent>
              {issue.image && (
                <img
                  src={issue.image}
                  alt="Issue"
                  className="w-full h-40 object-cover rounded-md mb-3"
                />
              )}

              <p className="text-sm text-gray-700 mb-2">
                <b>Description:</b> {issue.description || "No description"}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <b>Location:</b> {issue.location?.landmark || "Not provided"}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <b>Priority:</b>{" "}
                <span
                  className={
                    issue.priority === "high"
                      ? "text-red-600 font-semibold"
                      : issue.priority === "medium"
                      ? "text-yellow-600 font-semibold"
                      : "text-green-600 font-semibold"
                  }
                >
                  {issue.priority}
                </span>
              </p>
              <p className="text-xs text-gray-500">
                Reported by: {issue.usermail}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(issue.createdAt).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

          {/* 🔥 Map showing issues */}
    <h2 className="text-xl font-bold mb-4">🌍 Issues on Map</h2>
    <IssueMap issues={issues} />
    </div>
  );
}
