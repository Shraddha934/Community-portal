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
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AnalyticDashboard() {
  const [issues, setIssues] = useState([]);
  const [interval, setInterval] = useState("day"); // default interval
  const [data, setData] = useState([]);

  // Fetch issues from API
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await axios.get("/api/issues");
        console.log("API response:", res.data);

        // Make sure we get an array
        const issuesArray = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.issues)
          ? res.data.issues
          : [];

        setIssues(issuesArray);
      } catch (err) {
        console.error(err);
        setIssues([]); // fallback to empty array
      }
    };
    fetchIssues();
  }, []);

  // Group issues based on selected interval
  useEffect(() => {
    if (!Array.isArray(issues) || issues.length === 0) {
      setData([]);
      return;
    }

    const groupedData = {};

    issues.forEach((issue) => {
      const date = new Date(issue.createdAt);
      let key;

      if (interval === "day") {
        key = date.toLocaleDateString();
      } else if (interval === "week") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // start of week
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
  }, [issues, interval]);

  return (
    <div className="space-y-4">
      {/* Interval Dropdown */}
      <Select onValueChange={(value) => setInterval(value)}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select Interval" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="day">Day</SelectItem>
          <SelectItem value="week">Week</SelectItem>
          <SelectItem value="month">Month</SelectItem>
          <SelectItem value="year">Year</SelectItem>
        </SelectContent>
      </Select>

      {/* Chart */}
      {data.length === 0 ? (
        <p className="text-center">No analytics data available.</p>
      ) : (
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#8884d8"
                fill="#8884d8"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
