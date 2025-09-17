// app/map/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import IssueMap from "../../components/IssueMap";

export default function MapPage() {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await fetch("/api/issues");
        const data = await res.json();
        setIssues(data.issues); // 👈 match your API response
      } catch (err) {
        console.error("Error fetching issues:", err);
      }
    };
    fetchIssues();
  }, []);

  return (
    <div className="h-screen w-full">
      <IssueMap issues={issues} />
    </div>
  );
}
