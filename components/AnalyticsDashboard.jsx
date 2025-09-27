"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bug, CheckCircle, Clock, AlertCircle } from "lucide-react";

const COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444"];

export default function AnalyticsDashboard() {
  const [issues, setIssues] = useState([]);
  const [interval, setInterval] = useState("day");
  const [data, setData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await axios.get("/api/issues");
        const issuesArray = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.issues)
          ? res.data.issues
          : [];
        setIssues(issuesArray);
      } catch (err) {
        console.error(err);
        setIssues([]);
      }
    };
    fetchIssues();
  }, []);

  // Group issues over time (Area Chart)
  useEffect(() => {
    if (!Array.isArray(issues) || issues.length === 0) {
      setData([]);
      setStatusData([]);
      setCategoryData([]);
      return;
    }

    // Area Chart - Issues Over Time
    const groupedData = {};
    issues.forEach((issue) => {
      const date = new Date(issue.createdAt);
      let key;
      if (interval === "day") {
        key = date.toLocaleDateString();
      } else if (interval === "week") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toLocaleDateString();
      } else if (interval === "month") {
        key = `${date.getMonth() + 1}-${date.getFullYear()}`;
      } else if (interval === "year") {
        key = `${date.getFullYear()}`;
      }
      groupedData[key] = (groupedData[key] || 0) + 1;
    });
    const chartData = Object.keys(groupedData)
      .sort((a, b) => new Date(a) - new Date(b))
      .map((key) => ({ date: key, count: groupedData[key] }));
    setData(chartData);

    // Status Data (Bar Chart)
    const statusCounts = issues.reduce((acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1;
      return acc;
    }, {});
    setStatusData(
      Object.keys(statusCounts).map((s) => ({
        status: s,
        count: statusCounts[s],
      }))
    );

    // Category Data (Pie Chart)
    const categoryCounts = issues.reduce((acc, issue) => {
      acc[issue.category || "Other"] =
        (acc[issue.category || "Other"] || 0) + 1;
      return acc;
    }, {});
    setCategoryData(
      Object.keys(categoryCounts).map((c) => ({
        name: c,
        value: categoryCounts[c],
      }))
    );
  }, [issues, interval]);

  // Stat Cards
  const totalIssues = issues.length;
  const openIssues = issues.filter((i) => i.status === "open").length;
  const closedIssues = issues.filter((i) => i.status === "resolved").length;
  const avgResolution = issues.length
    ? Math.floor(Math.random() * 5 + 1) // placeholder
    : 0;

  useEffect(() => {
    if (issues.length > 0) {
      const categoryCounts = issues.reduce((acc, issue) => {
        acc[issue.issueType || "Other"] =
          (acc[issue.issueType || "Other"] || 0) + 1;
        return acc;
      }, {});

      setCategoryData(
        Object.keys(categoryCounts).map((c) => ({
          name: c,
          value: categoryCounts[c],
        }))
      );
    }
  }, [issues]); // ✅ only recompute when `issues` changes

  return (
    <div className="space-y-6 mt-10">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 shadow rounded-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Issues</p>
            <Bug className="w-5 h-5 text-purple-500" />
          </div>
          <h2 className="text-2xl font-bold">{totalIssues}</h2>
        </Card>

        <Card className="p-4 shadow rounded-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Open Issues</p>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold">{openIssues}</h2>
        </Card>

        <Card className="p-4 shadow rounded-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Closed Issues</p>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold">{closedIssues}</h2>
        </Card>

        <Card className="p-4 shadow rounded-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Avg Resolution (days)</p>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold">{avgResolution}</h2>
        </Card>
      </div>

      {/* Interval Selector + Area Chart */}
      <Card className="p-4">
        <CardHeader className="flex flex-row justify-between items-center pb-4">
          <CardTitle>📈 Issues Over Time</CardTitle>
          <Select onValueChange={(value) => setInterval(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <p className="text-gray-400 text-center">No data available</p>
          ) : (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#6366F1"
                    fillOpacity={1}
                    fill="url(#colorCount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Bar Chart + Category Pie Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <CardHeader>
            <CardTitle>📊 Issues by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <p className="text-gray-400 text-center">No data</p>
            ) : (
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366F1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader>
            <CardTitle>🟢 Issues by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <p className="text-gray-400 text-center">No data</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500 border-b">
                  <tr>
                    <th className="pb-2">Category</th>
                    <th className="pb-2">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryData
                    .sort((a, b) => b.value - a.value) // sort by count (highest first)
                    .map((cat, idx) => (
                      <tr
                        key={idx}
                        className="border-t border-gray-200 text-gray-700"
                      >
                        <td className="py-2">{cat.name}</td>
                        <td className="py-2 font-semibold">{cat.value}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Issues Table */}
      <Card className="p-4">
        <CardHeader>
          <CardTitle>📝 Recent Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            {issues.length === 0 ? (
              <p className="text-gray-400 text-center">No recent issues</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500">
                  <tr>
                    <th className="pb-2">Description</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Reported By</th>
                    <th className="pb-2">Reported Date</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.slice(0, 6).map((issue, idx) => (
                    <tr
                      key={idx}
                      className="border-t border-gray-200 text-gray-700"
                    >
                      <td className="py-2">
                        {issue.description || "Untitled Issue"}
                      </td>
                      <td className="py-2">{issue.issueType || "Other"}</td>
                      <td className="py-2">{issue.status || "open"}</td>
                      <td className="py-2">{issue.usermail || "Unknown"}</td>
                      <td className="py-2">
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
