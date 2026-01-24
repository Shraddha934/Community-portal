"use client";

export default function IssueCard({ issue }) {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-4 hover:shadow-md transition">
      <h2 className="font-semibold text-lg mb-1">
        {issue.title || "Untitled Issue"}
      </h2>

      <p className="text-sm text-gray-600 capitalize">
        {issue.issueType.replace("_", " ")}
      </p>

      <div className="flex justify-between items-center mt-3">
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            issue.status === "open"
              ? "bg-red-100 text-red-700"
              : issue.status === "in_progress"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {issue.status}
        </span>

        <span className="text-xs font-medium text-blue-600">
          {issue.priority || "pending"}
        </span>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        📍 {issue.location?.landmark || "Unknown location"}
      </p>

      <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
        <span>👍 {issue.likesCount || 0}</span>
        <span>💬 {issue.comments?.length || 0}</span>
      </div>
    </div>
  );
}
