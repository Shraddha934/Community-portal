"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Colors for pie chart slices
const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#8dd1e1",
  "#a4de6c",
  "#d0ed57",
  "#ffc0cb",
];

export default function UserAnalytics() {
  const [radius, setRadius] = useState(10); // default 10 km
  const [analytics, setAnalytics] = useState({});
  const [issueCounts, setIssueCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = async (lat, lng, radiusKm) => {
    try {
      setLoading(true);
      const res = await fetch("/api/user-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          radiusKm: radiusKm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.analytics);
        setIssueCounts(data.issueCounts || {}); // counts for pie chart
      } else {
        setError(data.error || "Failed to fetch analytics");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchAnalytics(
          position.coords.latitude,
          position.coords.longitude,
          radius
        );
      },
      (err) => {
        setError("Failed to get your location: " + err.message);
      }
    );
  }, [radius]);

  // Prepare bar chart data
  const barData = Object.entries(analytics).map(([type, avgTime]) => ({
    type,
    avgTime: Number(avgTime || 0),
  }));

  // Prepare pie chart data (issue distribution)
  const pieData = Object.entries(issueCounts).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  return (
    <div className="max-w-3xl mx-auto p-4 my-24">
      <h2 className="text-xl font-bold mb-4">Issue Analytics</h2>

      {/* Radius selection */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Select Radius:</label>
        <select
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="border rounded p-1"
        >
          <option value={5}>5 km</option>
          <option value={10}>10 km</option>
          <option value={20}>20 km</option>
          <option value={25}>25 km</option>
          <option value={30}>30 km</option>
        </select>
      </div>

      {/* Loading / Error */}
      {loading && <p>Loading analytics...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Bar Chart */}
      {!loading && !error && barData.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">
            Average Resolution Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={barData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis
                label={{ value: "Hours", angle: -90, position: "insideLeft" }}
              />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="avgTime"
                fill="#8884d8"
                name="Avg Resolution Time"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Analytics Table */}
      {!loading && !error && (
        <table className="w-full border border-gray-300 rounded mb-8">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">Issue Type</th>
              <th className="border px-4 py-2 text-left">
                Avg Resolution Time (hrs)
              </th>
            </tr>
          </thead>
          <tbody>
            {barData.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center py-2">
                  No issues found in this radius.
                </td>
              </tr>
            ) : (
              barData.map(({ type, avgTime }) => (
                <tr key={type}>
                  <td className="border px-4 py-2">{type}</td>
                  <td className="border px-4 py-2">{avgTime.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Pie Chart */}
      {!loading && !error && pieData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Issue Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(1)}%`
                }
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} issues`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
