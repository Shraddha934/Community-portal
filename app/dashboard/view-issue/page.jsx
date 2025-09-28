"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import {
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export default function ViewIssuePage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();

  const { user, isLoaded, isSignedIn } = useUser();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  // Inline edit states
  const [editDesc, setEditDesc] = useState(false);
  const [editLandmark, setEditLandmark] = useState(false);
  const [description, setDescription] = useState("");
  const [landmark, setLandmark] = useState("");

  // Check if logged-in user is the owner of the issue
  const isOwner =
    isLoaded &&
    isSignedIn &&
    user?.emailAddresses?.[0]?.emailAddress === issue?.usermail;

  // Fetch issue
  useEffect(() => {
    if (!id) return;
    const fetchIssue = async () => {
      try {
        const res = await fetch(`/api/single-issue/${id}`);
        const data = await res.json();
        if (data.success) {
          setIssue(data.issue);
          setComments(data.issue.comments || []);
          setDescription(data.issue.description || "");
          setLandmark(data.issue.location?.landmark || "");
        } else {
          setError(data.error || "Issue not found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch issue");
      } finally {
        setLoading(false);
      }
    };
    fetchIssue();
  }, [id]);

  // Handle update
  const handleUpdate = async (field) => {
    try {
      const res = await fetch("/api/update-issue", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: issue._id,
          ...(field === "description" && { description }),
          ...(field === "landmark" && { location: { landmark } }),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIssue(data.issue);
        if (field === "description") setEditDesc(false);
        if (field === "landmark") setEditLandmark(false);
      } else {
        alert(data.message || "Failed to update issue");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating issue");
    }
  };

  // Handle delete
  const handleDelete = async () => {
    const confirmed = confirm(
      "⚠️ Are you sure you want to delete this issue? This action cannot be reversed!"
    );
    if (!confirmed) return;

    try {
      const res = await fetch("/api/delete-issue", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: issue._id }),
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Issue deleted successfully!");
        router.push("/"); // Redirect to homepage or issue list
      } else {
        alert(data.message || "Failed to delete issue");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting issue");
    }
  };

  // Comment submit
  const handleCommentSubmit = async () => {
    if (!comment.trim()) return;
    if (!isLoaded || !isSignedIn) {
      alert("Please sign in to comment");
      return;
    }
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    if (!userEmail) {
      alert("Could not get your email");
      return;
    }
    try {
      const res = await fetch("/api/issues", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueId: issue._id,
          usermail: userEmail,
          commentText: comment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setComments(data.comments.reverse());
        setComment("");
      } else {
        alert("Failed to post comment: " + data.error);
      }
    } catch (err) {
      console.error("Error posting comment:", err);
      alert("Error posting comment");
    }
  };

  if (!id)
    return (
      <p className="text-center mt-10 text-gray-600">No issue ID provided.</p>
    );
  if (loading)
    return <p className="text-center mt-10 text-gray-600">Loading issue...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  const statusColor = {
    open: "bg-green-100 text-green-800",
    inprogress: "bg-yellow-100 text-yellow-800",
    resolved: "bg-blue-100 text-blue-800",
  };
  const priorityColor = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800",
  };
  const criticalityColor = {
    Normal: "bg-gray-100 text-gray-800",
    Critical: "bg-red-200 text-red-900",
    Moderate: "bg-yellow-200 text-yellow-900",
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 mt-20">
      {/* Issue ID, Back & Delete */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        {/* Left: Delete + Back */}
        <div className="flex gap-2 items-center">
          <Button size="sm" variant="outline" onClick={() => router.back()}>
            Back
          </Button>

          {isOwner && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              className="flex items-center gap-1 bg-red-600 text-white hover:bg-red-700"
            >
              <TrashIcon className="w-4 h-4 " />
              Delete
            </Button>
          )}
        </div>

        {/* Right: Issue ID */}
        <h1 className="text-gray-500 font-semibold">Issue ID: {id}</h1>
      </div>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Details */}
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {issue.title || "Untitled Issue"}
          </h1>

          {/* Status, priority, criticality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <div>
                <span className="font-semibold mr-2">Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    statusColor[issue.status] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {issue.status}
                </span>
              </div>
              <div>
                <span className="font-semibold mr-2">Issue Type:</span>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800">
                  {issue.issueType.replaceAll("_", " ")}
                </span>
              </div>
              <div>
                <span className="font-semibold mr-2">Priority:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    priorityColor[issue.priority] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {issue.priority}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div>
                <span className="font-semibold mr-2">Criticality:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    criticalityColor[issue.criticality] ||
                    "bg-gray-100 text-gray-800"
                  }`}
                >
                  {issue.criticality || "Normal"}
                </span>
              </div>
              <div>
                <span className="font-semibold mr-2">Created At:</span>
                <span className="text-gray-700">
                  {new Date(issue.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Description with inline edit */}
          <div className="relative">
            <h2 className="font-semibold text-gray-800 mb-2 flex items-center justify-between">
              Description
              {!editDesc && isOwner && (
                <PencilIcon
                  className="w-5 h-5 text-gray-500 cursor-pointer"
                  onClick={() => setEditDesc(true)}
                />
              )}
            </h2>
            {editDesc ? (
              <div className="flex gap-2">
                <textarea
                  className="border p-2 rounded w-full"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <CheckIcon
                  className="w-6 h-6 text-green-600 cursor-pointer"
                  onClick={() => handleUpdate("description")}
                />
                <XMarkIcon
                  className="w-6 h-6 text-red-600 cursor-pointer"
                  onClick={() => {
                    setEditDesc(false);
                    setDescription(issue.description || "");
                  }}
                />
              </div>
            ) : (
              <p className="text-gray-700">{description || "No description"}</p>
            )}
          </div>

          {/* Landmark with inline edit */}
          {issue.location && (
            <div className="relative mt-4">
              <h2 className="font-semibold text-gray-800 mb-2 flex items-center justify-between">
                Landmark
                {!editLandmark && isOwner && (
                  <PencilIcon
                    className="w-5 h-5 text-gray-500 cursor-pointer"
                    onClick={() => setEditLandmark(true)}
                  />
                )}
              </h2>
              {editLandmark ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="border p-2 rounded w-full"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                  />
                  <CheckIcon
                    className="w-6 h-6 text-green-600 cursor-pointer"
                    onClick={() => handleUpdate("landmark")}
                  />
                  <XMarkIcon
                    className="w-6 h-6 text-red-600 cursor-pointer"
                    onClick={() => {
                      setEditLandmark(false);
                      setLandmark(issue.location?.landmark || "");
                    }}
                  />
                </div>
              ) : (
                <p className="text-gray-700">{landmark || "N/A"}</p>
              )}
            </div>
          )}

          {/* Address */}
          {issue.location && (
            <p className="text-gray-700 mt-2">
              <span className="font-semibold">Address:</span>{" "}
              {issue.location.fullAddress || "N/A"}
            </p>
          )}
        </div>

        {/* Right: Image */}
        <div className="flex-shrink-0 w-full lg:w-96 h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden shadow-lg">
          <img
            src={issue.image || "/placeholder.jpg"}
            alt={issue.title || "Issue Image"}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="timeline">
        <p className="text-sm text-gray-700">
          <b>Opened On:</b> {new Date(issue.createdAt).toLocaleString()}
        </p>
        <p className="text-sm text-gray-700">
          <b>In Progress On:</b>{" "}
          {issue.inProgressOn
            ? new Date(issue.inProgressOn).toLocaleString()
            : "Not yet"}
        </p>
        <p className="text-sm text-gray-700">
          <b>Closed On:</b>{" "}
          {issue.closedOn
            ? new Date(issue.closedOn).toLocaleString()
            : "Not yet"}
        </p>
      </div>
      {/* Comment Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Comments</h2>
        {comments.length === 0 ? (
          <p className="text-gray-500 italic">
            No comments yet. Be the first to post something!
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {comments.map((c, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <p className="text-gray-800 font-semibold">
                  {c.usermail || "Anonymous"}
                </p>
                <p className="text-gray-700 text-sm">{c.text}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <input
            type="text"
            placeholder="Add a comment..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button
            className="bg-purple-600 text-white hover:bg-violet-700 rounded-full px-6"
            onClick={handleCommentSubmit}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}
