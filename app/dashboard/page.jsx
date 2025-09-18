"use client";
import { useUser } from "@clerk/nextjs";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Search, Plus, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [issues, setIssues] = useState([]);
  const [liked, setLiked] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fabOpen, setFabOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Filters state
  const [filters, setFilters] = useState({
    status: "",
    issueType: "",
    priority: "",
  });

  const router = useRouter();
  const { isSignedIn } = useUser();

  // Fetch all issues
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await fetch("/api/issues", { cache: "no-store" });
        const data = await res.json();

        if (data.success && Array.isArray(data.issues)) {
          setIssues(data.issues);
        } else {
          setIssues([]);
        }
      } catch (err) {
        console.error("Error fetching issues:", err);
        setError("Failed to load issues.");
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  // ✅ Toggle like
  const toggleLike = (id) => {
    setLiked((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // ✅ Apply filters client-side
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.location?.landmark
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      issue.issueType?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !filters.status || issue.status === filters.status;
    const matchesType =
      !filters.issueType || issue.issueType === filters.issueType;
    const matchesPriority =
      !filters.priority || issue.priority === filters.priority;

    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({ status: "", issueType: "", priority: "" });
  };

  if (loading) return <p className="text-center">Loading issues...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 mt-14">
      {/* 🔹 SubNavBar Filters */}
      {/* 🔽 Subnavbar Filters */}
      <div className="bg-white shadow-md rounded-xl p-4 mb-8 flex flex-wrap items-center gap-4 justify-center">
        {/* Status */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Status:</span>
          {["open", "in_progress", "resolved"].map((status) => (
            <button
              key={status}
              onClick={() => setFilters((prev) => ({ ...prev, status }))}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                filters.status === status
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Issue Type */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Issue:</span>
          {[
            "broken_benches",
            "fallen_trees",
            "garbage",
            "leaky_pipes",
            "open_manhole",
            "potholes",
            "streetlight",
          ].map((type) => (
            <button
              key={type}
              onClick={() =>
                setFilters((prev) => ({ ...prev, issueType: type }))
              }
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                filters.issueType === type
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {type.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Priority */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Priority:</span>
          {["high", "medium", "low"].map((priority) => (
            <button
              key={priority}
              onClick={() => setFilters((prev) => ({ ...prev, priority }))}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                filters.priority === priority
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {priority}
            </button>
          ))}
        </div>

        {/* Reset */}
        <button
          onClick={() =>
            setFilters({ status: "", issueType: "", priority: "" })
          }
          className="ml-4 px-4 py-1 rounded-full text-sm font-semibold bg-gray-300 hover:bg-gray-400 text-black transition"
        >
          Reset
        </button>
      </div>

      {/* 🔍 Search Bar */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-md">
          <Input
            type="text"
            placeholder="Search by issue or landmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-12"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* 📝 Issues Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
        {filteredIssues.map((issue) => (
          <Card
            key={issue._id}
            className="relative shadow-lg hover:shadow-xl transition"
          >
            {/* Issue Image */}
            <div className="relative">
              <img
                src={issue.image || "/placeholder.jpg"}
                alt={issue.title}
                className="w-full h-56 object-cover rounded-t-lg"
              />
              {/* Status Badge */}
              <div className="absolute top-3 left-3 bg-white/50 backdrop-blur-sm text-sm px-3 py-1 rounded-full font-semibold text-gray-800">
                {issue.status}
              </div>
            </div>

            {/* Card Content */}
            <CardContent className="pt-4">
              <h2 className="text-sm font-bold">{issue.title}</h2>
              <p className="text-lg text-black-600 capitalize font-bold">
                🏷️{" "}
                {issue.issueType
                  ? issue.issueType.replaceAll("_", " ")
                  : "General"}
              </p>

              {/* Priority */}
              <p className="mt-2 text-sm font-semibold">
                ⚡ Priority:{" "}
                <span
                  className={`px-2 py-1 rounded-full text-white ${
                    issue.priority === "high"
                      ? "bg-red-600"
                      : issue.priority === "medium"
                      ? "bg-yellow-500"
                      : "bg-green-600"
                  }`}
                >
                  {issue.priority.charAt(0).toUpperCase() +
                    issue.priority.slice(1)}
                </span>
              </p>
            </CardContent>

            {/* Card Footer */}
            <CardFooter className="flex justify-between items-center px-4 pb-4">
              <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">
                {issue.location?.landmark || "Unknown"}
              </span>

              <Button
                variant="outline"
                size="sm"
                className={`flex items-center gap-1 ${
                  liked.includes(issue._id) ? "text-red-600" : "text-gray-600"
                }`}
                onClick={() => toggleLike(issue._id)}
              >
                <Heart size={16} />
                {liked.includes(issue._id) ? "Voted" : "Vote"}
              </Button>
            </CardFooter>
          </Card>
        ))}

        {filteredIssues.length === 0 && (
          <p className="text-center col-span-full text-gray-500">
            No issues found.
          </p>
        )}
      </div>

      {/* ➕ Floating Action Button */}
      <div className="fixed bottom-10 right-10 flex flex-col items-end gap-3">
        {fabOpen && isSignedIn && (
          <>
            <Button
              className="rounded-full bg-gray-300 text-black"
              onClick={() => router.push("/dashboard/add-issue")}
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Issue
            </Button>
            <Button
              className="rounded-full bg-gray-300 text-black"
              onClick={() => router.push("/dashboard/my-issue")}
            >
              <FileText className="mr-2 h-4 w-4" /> My Issues
            </Button>
          </>
        )}

        <Button
          size="lg"
          className="rounded-full w-14 h-14 flex items-center justify-center shadow-xl bg-purple-600 hover:bg-violet-700"
          onClick={() => setFabOpen(!fabOpen)}
        >
          <Plus size={24} className="text-white" />
        </Button>
      </div>
    </div>
  );
}
