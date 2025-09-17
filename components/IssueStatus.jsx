"use client";
import { useState } from "react";

export default function IssueStatus({ issue }) {
  const [status, setStatus] = useState(issue.status);

  const updateStatus = async (newStatus) => {
    setStatus(newStatus);

    const res = await fetch(`/api/issues/${issue._id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => updateStatus(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="open">Open</option>
        <option value="inprogress">In Progress</option>
        <option value="resolved">Resolved</option>
      </select>
    </div>
  );
}
