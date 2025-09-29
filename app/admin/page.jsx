"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import IssueMap from "../../components/IssueMap";
import Sidebar from "../../components/SideBar";

export default function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingStatuses, setPendingStatuses] = useState({});

  // NEW FILTER STATES
  const [filters, setFilters] = useState({
    issueType: "",
    priority: "",
  });

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

  // 🔍 Apply filters
  const filteredIssues = issues.filter((i) => {
    const statusOk = filterStatus === "all" || i.status === filterStatus;
    const typeOk = !filters.issueType || i.issueType === filters.issueType;
    const priorityOk = !filters.priority || i.priority === filters.priority;
    return statusOk && typeOk && priorityOk;
  });

  // handle dropdown change
  const handleDropdownChange = (id, value) => {
    setPendingStatuses((prev) => ({ ...prev, [id]: value }));
  };

  // confirm update
  const handleConfirm = async (issue) => {
    try {
      const res = await axios.patch(`/api/issues/${issue._id}/status`, {
        status: pendingStatuses[issue._id],
      });

      setIssues((prevIssues) =>
        prevIssues.map((i) =>
          i._id === issue._id ? { ...i, status: res.data.status } : i
        )
      );

      setPendingStatuses((prev) => {
        const copy = { ...prev };
        delete copy[issue._id];
        return copy;
      });
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        📊 Admin Dashboard
      </h1>

      {/* 📊 Analytics Bar + Filters + Sidebar */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        {/* Left: Status Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            onClick={() => setFilterStatus("all")}
          >
            Total <Badge>{total}</Badge>
          </Button>
          <Button
            variant={filterStatus === "open" ? "default" : "outline"}
            onClick={() => setFilterStatus("open")}
          >
            Open <Badge className="bg-red-500 text-white">{openCount}</Badge>
          </Button>
          <Button
            variant={filterStatus === "inprogress" ? "default" : "outline"}
            onClick={() => setFilterStatus("inprogress")}
          >
            In Progress{" "}
            <Badge className="bg-yellow-500 text-white">
              {inProgressCount}
            </Badge>
          </Button>
          <Button
            variant={filterStatus === "resolved" ? "default" : "outline"}
            onClick={() => setFilterStatus("resolved")}
          >
            Resolved{" "}
            <Badge className="bg-green-500 text-white">{resolvedCount}</Badge>
          </Button>
        </div>

        {/* Middle: Dropdowns */}
        <div className="flex flex-wrap gap-3">
          {/* Issue Type */}
          <select
            value={filters.issueType}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, issueType: e.target.value }))
            }
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

          {/* Priority */}
          <select
            value={filters.priority}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, priority: e.target.value }))
            }
            className="border rounded px-2 py-1"
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Reset */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ issueType: "", priority: "" })}
          >
            Reset
          </Button>
        </div>

        {/* Right: Sidebar Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-md hover:bg-gray-200 transition"
        >
          ☰
        </button>
      </div>

      {/* 🗂 Issues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIssues.map((issue) => {
          const pendingValue = pendingStatuses[issue._id] ?? issue.status;
          return (
            <Card
              key={issue._id}
              className="shadow-md rounded-xl hover:shadow-lg transition bg-white"
            >
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-lg">
                  <span className="capitalize">
                    {issue.issueType.replaceAll("_", " ")}
                  </span>
                  <div className="flex items-center gap-2">
                    <select
                      value={pendingValue}
                      onChange={(e) =>
                        handleDropdownChange(issue._id, e.target.value)
                      }
                      className="border rounded-md px-2 py-1 text-sm"
                    >
                      <option value="open">Open</option>
                      <option value="inprogress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    {pendingValue !== issue.status && (
                      <Button
                        size="sm"
                        onClick={() => handleConfirm(issue)}
                        className="bg-blue-600 text-white"
                      >
                        Confirm
                      </Button>
                    )}
                  </div>
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
                <p className="text-sm">
                  <b>Description:</b> {issue.description || "No description"}
                </p>
                <p className="text-sm">
                  <b>Location:</b> {issue.location?.landmark || "Not provided"}
                </p>
                <p className="text-sm">
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
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 🌍 Map Section */}
      <h2 className="text-xl font-bold mt-12 mb-4 text-gray-800">
        🌍 Issues on Map
      </h2>
      <IssueMap issues={filteredIssues} />

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} issues={issues} />
    </div>
  );
}
