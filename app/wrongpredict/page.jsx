"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminPage = () => {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await axios.get("/api/corrected");
        setIssues(res.data.corrected);
      } catch (err) {
        console.error("Error fetching issues:", err);
      }
    };
    fetchIssues();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">
        Admin Dashboard - Corrected Issues
      </h1>
      {issues.length === 0 ? (
        <p>No corrected issues found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {issues.map((issue) => (
            <div
              key={issue._id}
              className="bg-white shadow-md rounded-xl p-4 flex flex-col items-center"
            >
              <img
                src={`data:image/jpeg;base64,${issue.image}`}
                alt="Corrected Issue"
                className="w-48 h-48 object-cover rounded-lg mb-4 border"
              />
              <div className="text-center">
                <p>
                  <span className="font-semibold text-red-600">Predicted:</span>{" "}
                  {issue.predicted}
                </p>
                <p>
                  <span className="font-semibold text-green-600">Actual:</span>{" "}
                  {issue.actual}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
