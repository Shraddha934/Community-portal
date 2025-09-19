"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import IssueStatus from "../../components/IssueStatus";
import IssueMap from "../../components/IssueMap";

export default function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

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

  // 📊 Count stats
  const total = issues.length;
  const openCount = issues.filter((i) => i.status === "open").length;
  const inProgressCount = issues.filter(
    (i) => i.status === "inprogress"
  ).length;
  const resolvedCount = issues.filter((i) => i.status === "resolved").length;

  // 🔍 Apply filter
  const filteredIssues =
    filterStatus === "all"
      ? issues
      : issues.filter((i) => i.status === filterStatus);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        📊 Admin Dashboard
      </h1>

      {/* 📊 Analytics Bar */}
      <div className="flex flex-wrap gap-4 mb-10">
        <Button
          variant={filterStatus === "all" ? "default" : "outline"}
          className="flex items-center gap-2 shadow-sm"
          onClick={() => setFilterStatus("all")}
        >
          Total
          <Badge variant="secondary" className="bg-gray-200 text-gray-800">
            {total}
          </Badge>
        </Button>

        <Button
          variant={filterStatus === "open" ? "default" : "outline"}
          className="flex items-center gap-2 shadow-sm bg-black text-white"
          onClick={() => setFilterStatus("open")}
        >
          Open
          <Badge className="bg-red-500 text-white">{openCount}</Badge>
        </Button>

        <Button
          variant={filterStatus === "inprogress" ? "default" : "outline"}
          className="flex items-center gap-2 shadow-sm bg-black text-white"
          onClick={() => setFilterStatus("inprogress")}
        >
          In Progress
          <Badge className="bg-yellow-500 text-white">{inProgressCount}</Badge>
        </Button>

        <Button
          variant={filterStatus === "resolved" ? "default" : "outline"}
          className="flex items-center gap-2 shadow-sm bg-black text-white"
          onClick={() => setFilterStatus("resolved")}
        >
          Resolved
          <Badge className="bg-green-500 text-white">{resolvedCount}</Badge>
        </Button>
      </div>

      {/* 🗂 Issues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIssues.map((issue) => (
          <Card
            key={issue._id}
            className="shadow-md rounded-xl hover:shadow-lg transition duration-200 bg-white"
          >
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-lg">
                <span className="capitalize">
                  {issue.issueType.replaceAll("_", " ")}
                </span>
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

      {/* 🌍 Map Section */}
      <h2 className="text-xl font-bold mt-12 mb-4 text-gray-800">
        🌍 Issues on Map
      </h2>
      <IssueMap issues={filteredIssues} />
    </div>
  );
}
