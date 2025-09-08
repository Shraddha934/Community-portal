// app/dashboard/page.jsx
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // shadcn ui input
import { Heart, Search } from "lucide-react";
import { Plus, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

const dummyIssues = [
  {
    id: 1,
    title: "Broken Streetlight",
    image: "/issues/streetlight.jpg",
    landmark: "Sector 21",
    status: "Pending",
  },
  {
    id: 2,
    title: "Pothole",
    image: "/issues/pothole.jpg",
    landmark: "Main Road",
    status: "In Progress",
  },
  {
    id: 3,
    title: "Fallen Tree",
    image: "/issues/tree.jpg",
    landmark: "Park Entrance",
    status: "Resolved",
  },
  {
    id: 4,
    title: "Broken Benches",
    image: "/issues/bench.jpg",
    landmark: "Near Shiv Mandir",
    status: "Pending",
  },{
    id: 5,
    title: "OpenManhole",
    image: "/issues/tree.jpg",
    landmark: "Kamothe",
    status: "Resolved",
  }
  ,{
    id: 6,
    title: "leakyPipe",
    image: "/issues/tree.jpg",
    landmark: "Park Entrance",
    status: "Resolved",
  }
  ,{
    id: 7,
    title: "Garbage",
    image: "/issues/tree.jpg",
    landmark: "Park Entrance",
    status: "In Progress",
  }
 
];

export default function DashboardPage() {
  const [liked, setLiked] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fabOpen, setFabOpen] = useState(false);
  const router = useRouter();

  const toggleLike = (id) => {
    setLiked((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filter issues by search query (title or landmark)
  const filteredIssues = dummyIssues.filter(
    (issue) =>
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.landmark.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Dashboard Title */}
      <h1 className="text-3xl font-bold mb-6 text-center">Dashboard</h1>

      {/* Search Bar */}
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

      {/* Issues Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredIssues.map((issue) => (
          <Card key={issue.id} className="relative shadow-lg hover:shadow-xl transition">
            {/* Issue Image */}
            <div className="relative">
              <img
                src={issue.image}
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
              <h2 className="text-lg font-bold">{issue.title}</h2>
            </CardContent>

            {/* Card Footer */}
            <CardFooter className="flex justify-between items-center px-4 pb-4">
              <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">
                {issue.landmark}
              </span>

              <Button
                variant="outline"
                size="sm"
                className={`flex items-center gap-1 ${
                  liked.includes(issue.id) ? "text-red-600" : "text-gray-600"
                }`}
                onClick={() => toggleLike(issue.id)}
              >
                <Heart size={16} />
                {liked.includes(issue.id) ? "Voted" : "Vote"}
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

      {/* Floating Action Button */}
      <div className="fixed bottom-10 right-10 flex flex-col items-end gap-3">
        {/* Menu buttons (show only if fabOpen is true) */}
        {fabOpen && (
          <>
            <Button
              className="rounded-full shadow-md"
              onClick={() => router.push("/dashboard/add-issue")}
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Issue
            </Button>
            <Button
              className="rounded-full shadow-md"
              onClick={() => router.push("/dashboard/my-issue")}
            >
              <FileText className="mr-2 h-4 w-4" /> My Issues
            </Button>
          </>
        )}

                {/* Main FAB */}
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
