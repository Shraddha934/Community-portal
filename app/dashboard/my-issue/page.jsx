// app/dashboard/my-issues/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Dummy Data – later replace with API response
const dummyIssues = [
  {
    id: 1,
    title: "Broken Streetlight",
    date: "2025-09-01",
    status: "Pending",
    image: "https://via.placeholder.com/150",
    landmark: "Near City Park",
  },
  {
    id: 2,
    title: "Pothole on Road",
    date: "2025-09-03",
    status: "In Progress",
    image: "https://via.placeholder.com/150",
    landmark: "MG Road Junction",
  },
  {
    id: 3,
    title: "Garbage Overflow",
    date: "2025-09-05",
    status: "Resolved",
    image: "https://via.placeholder.com/150",
    landmark: "Behind Bus Stand",
  },
];

export default function MyIssuesPage() {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    // Replace this with API call to fetch user’s issues
    setIssues(dummyIssues);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">My Reported Issues</h1>

      {issues.length === 0 ? (
        <p className="text-center text-gray-600">No issues reported yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue) => (
            <Card key={issue.id} className="shadow-md rounded-xl">
              <div className="relative">
                <img
                  src={issue.image}
                  alt={issue.title}
                  className="w-full h-40 object-cover rounded-t-xl"
                />
                <Badge className="absolute top-2 left-2 bg-white/80 backdrop-blur-md text-gray-800">
                  {issue.status}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h2 className="font-semibold text-lg">{issue.title}</h2>
                <p className="text-sm text-gray-600">{issue.landmark}</p>
                <p className="text-xs text-gray-500 mt-2">📅 {issue.date}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
