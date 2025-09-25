"use client";
import { useUser } from "@clerk/nextjs";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Search, Plus, FileText, MessageCircle } from "lucide-react";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [issues, setIssues] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fabOpen, setFabOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    status: "",
    issueType: "",
    priority: "",
    radius: "", // in km
  });

  // User location
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
        },
        (err) => {
          console.error("Error fetching location:", err);
        }
      );
    }
  }, []);

  const router = useRouter();
  const { isSignedIn, user } = useUser();

  // Fetch issues from backend with filters
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.status) params.append("status", filters.status);
        if (filters.issueType) params.append("issueType", filters.issueType);
        if (filters.priority) params.append("priority", filters.priority);
        if (filters.radius && userLat && userLng) {
          params.append("near", "true");
          params.append("lat", userLat);
          params.append("lon", userLng);
          params.append("radius", filters.radius); // in km
        }
        if (user?.primaryEmailAddress?.emailAddress) {
          params.append("usermail", user.primaryEmailAddress.emailAddress);
        }

        const res = await fetch(`/api/issues?${params.toString()}`, {
          cache: "no-store",
        });
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
  }, [filters, userLat, userLng, user]);

  // Toggle like button
  const toggleLike = async (issueId) => {
    if (!isSignedIn || !user) {
      alert("Please sign in to vote!");
      return;
    }

    try {
      // Optimistic UI update
      setIssues((prev) =>
        prev.map((issue) =>
          issue._id === issueId
            ? {
                ...issue,
                isLiked: !issue.isLiked,
                likesCount: issue.isLiked
                  ? issue.likesCount - 1
                  : issue.likesCount + 1,
              }
            : issue
        )
      );

      // Call backend to persist like/unlike
      const res = await fetch("/api/issues", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueId,
          usermail: user.primaryEmailAddress.emailAddress,
        }),
      });
      const data = await res.json();
      if (!data.success) console.error("Like failed:", data.error);
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) return <p className="text-center">Loading issues...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  // Client-side search filtering
  const searchedIssues = issues.filter((issue) => {
    const query = searchQuery.toLowerCase();
    return (
      issue.title?.toLowerCase().includes(query) ||
      issue.issueType?.toLowerCase().includes(query) ||
      issue.location?.landmark?.toLowerCase().includes(query) ||
      issue.location?.fullAddress?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8 mt-10">
      {/* 🔹 Filters Bar */}
      <div className="bg-white shadow-md rounded-xl p-4 mb-8 flex flex-wrap items-center gap-4 justify-center">
        {/* Status */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Status:</span>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">All</option>
            <option value="open">Open</option>
            <option value="inprogress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Issue Type */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Issue:</span>
          <select
            value={filters.issueType}
            onChange={(e) => handleFilterChange("issueType", e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">All</option>
            <option value="broken_benches">Broken Benches</option>
            <option value="fallen_trees">Fallen Trees</option>
            <option value="garbage">Garbage</option>
            <option value="leaky_pipes">Leaky Pipes</option>
            <option value="open_manhole">Open Manhole</option>
            <option value="potholes">Potholes</option>
            <option value="streetlight">Streetlight</option>
          </select>
        </div>

        {/* Priority */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Priority:</span>
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange("priority", e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Radius */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Radius:</span>
          <select
            value={filters.radius}
            onChange={(e) => handleFilterChange("radius", e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">All</option>
            <option value="1">1 km</option>
            <option value="3">3 km</option>
            <option value="5">5 km</option>
            <option value="10">10 km</option>
            <option value="20">20 km</option>
          </select>
        </div>

        {/* Reset */}
        <button
          onClick={() =>
            setFilters({ status: "", issueType: "", priority: "", radius: "" })
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
            placeholder="Search by issue, landmark, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-12"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* 📝 Issues Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
        {searchedIssues.map((issue) => (
          <Card
            key={issue._id}
            className="relative shadow-lg hover:shadow-xl transition cursor-pointer"
            onClick={() => router.push(`/dashboard/view-issue?id=${issue._id}`)}
          >
            <div className="relative">
              <img
                src={issue.image || "/placeholder.jpg"}
                alt={issue.title || "Issue"}
                className="w-full h-56 object-cover rounded-t-lg"
              />
              <div className="absolute top-3 left-3 bg-white/50 backdrop-blur-sm text-sm px-3 py-1 rounded-full font-semibold text-gray-800">
                {issue.status}
              </div>
            </div>

            <CardContent className="pt-4">
              <p className="text-lg text-black-600 capitalize font-bold">
                🏷️ {issue.issueType?.replaceAll("_", " ") || "General"}
              </p>
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
                  {issue.priority
                    ? issue.priority.charAt(0).toUpperCase() +
                      issue.priority.slice(1)
                    : "Medium"}
                </span>
              </p>

              <div className="mt-2 text-sm text-gray-700 space-y-1">
                {issue.location?.landmark && (
                  <p className="flex items-center gap-2">
                    <span className="text-indigo-600">🏠</span>
                    <span>{issue.location.landmark}</span>
                  </p>
                )}
                {issue.location?.fullAddress && (
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">📍</span>
                    <span>{issue.location.fullAddress}</span>
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex justify-between items-center px-4 pb-4">
              <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">
                {issue.location?.landmark || "Unknown"}
              </span>

              <div className="flex gap-2">
                {/* Like Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-1 ${
                    issue.isLiked ? "text-red-600" : "text-gray-600"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation(); // prevent card click
                    toggleLike(issue._id);
                  }}
                >
                  <Heart size={20} />
                  {issue.likesCount || 0}
                </Button>

                {/* Comment Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-1 ${
                    issue.comments?.length > 0
                      ? "text-blue-600"
                      : "text-gray-600"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(
                      `/dashboard/view-issue?id=${issue._id}#comments`
                    );
                  }}
                >
                  <MessageCircle size={16} />
                  {issue.comments?.length || 0}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}

        {searchedIssues.length === 0 && (
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
