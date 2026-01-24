"use client";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("admin"));
    if (!admin) return;

    fetch(`/api/admin/issues?department=${admin.department}`)
      .then((res) => res.json())
      .then((data) => setIssues(data.issues || []));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Department Issues</h1>

      {issues.map((issue) => (
        <div key={issue._id} className="border p-3 mb-3">
          <p>{issue.issueType}</p>
          <p>Status: {issue.status}</p>
        </div>
      ))}
    </div>
  );
}
