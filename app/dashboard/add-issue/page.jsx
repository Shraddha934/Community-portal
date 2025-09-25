"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddIssuePage() {
  const router = useRouter();
  const issueOptions = [
    "broken_benches",
    "fallen_trees",
    "garbage",
    "leaky_pipes",
    "open_manhole",
    "potholes",
    "streetlight",
    "others",
  ];

  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  const [image, setImage] = useState(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [description, setDescription] = useState("");
  const [issueType, setIssueType] = useState("");
  const [prediction, setPrediction] = useState("");
  const [priority, setPriority] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [loadingPriority, setLoadingPriority] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userModifiedIssueType, setUserModifiedIssueType] = useState(false);
  const [topIssues, setTopIssues] = useState([]);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // Speech recognition setup
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setDescription((prev) => prev + transcriptChunk + " ");
          }
        }
      };

      recognitionRef.current.onerror = (err) => {
        console.error("Speech recognition error:", err);
        setListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const normalizeToOptionValue = (label) => {
    if (!label && label !== 0) return "";
    return String(label)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  };

  const humanize = (val) => (val ? val.replaceAll("_", " ") : "");

  // Image upload & prediction
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("file", file);

    setLoadingPrediction(true);
    try {
      const res = await axios.post("http://127.0.0.1:5000/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const raw = res.data?.class ?? "";
      const normalized = normalizeToOptionValue(raw);
      setIssueType(normalized);
      setPrediction(normalized);
      setUserModifiedIssueType(false);
    } catch (error) {
      console.error("Prediction error:", error);
      alert("Error classifying the issue. Please try again.");
    } finally {
      setLoadingPrediction(false);
    }
  };

  // Detect location
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lon);

        try {
          const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
          const data = await res.json();
          if (data?.results && data.results.length > 0) {
            setAddress(data.results[0].formatted_address);
          } else {
            setAddress(`${lat}, ${lon}`);
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          setAddress(`${lat}, ${lon}`);
        } finally {
          setLoadingLocation(false);
        }
      },
      (err) => {
        console.error(err);
        alert("Unable to retrieve location.");
        setLoadingLocation(false);
      }
    );
  };

  // Get priority and fetch nearby issues
  const getPriority = async () => {
    setLoadingPriority(true);
    try {
      const res = await axios.post("/api/prioritize", {
        image,
        location: { latitude, longitude, address, landmark },
        description,
        issueType,
      });

      let raw = (res.data.priority || "").toString().trim().toLowerCase();
      if (!["critical", "normal", "low"].includes(raw)) {
        if (raw.includes("critical")) raw = "critical";
        else if (raw.includes("low")) raw = "low";
        else raw = "normal";
      }
      setPriority(raw);

      if (issueType) {
        const duplicateRes = await axios.get("/api/issues", {
          params: {
            issueType,
            lat: latitude,
            lon: longitude,
            near: true,
          },
        });

        const nearbyIssues = duplicateRes.data.issues || [];
        setTopIssues(nearbyIssues.slice(0, 3));
      }
    } catch (err) {
      console.error("Unable to get priority or fetch nearby issues.", err);
      alert("Unable to get priority or fetch nearby issues.");
    } finally {
      setLoadingPriority(false);
    }
  };

  const handleIssueTypeChange = (e) => {
    setIssueType(e.target.value);
    setUserModifiedIssueType(true);
  };

  // Submit issue
  const handleSubmit = async () => {
    if (!priority) {
      alert("Please detect priority first.");
      return;
    }

    setSubmitting(true);
    try {
      const mappedPriority =
        priority === "critical"
          ? "high"
          : priority === "normal"
          ? "medium"
          : "low";
      const criticalityForDb =
        priority.charAt(0).toUpperCase() + priority.slice(1);

      const issueStatus =
        prediction && prediction !== issueType
          ? "corrected"
          : prediction
          ? "accepted"
          : "user_provided";

      const finalAddress = address || `${latitude}, ${longitude}`;

      const payload = {
        issueType,
        image,
        location: {
          latitude: Number(latitude),
          longitude: Number(longitude),
          landmark,
          fullAddress: finalAddress,
        },
        status: "open",
        usermail: userEmail || "unknown@example.com",
        priority: mappedPriority,
        description,
        criticality: criticalityForDb,
        issueStatus,
        predicted: prediction || null,
      };

      const res = await axios.post("/api/issues", payload);

      if (issueStatus === "corrected") {
        await axios.post("/api/corrected", {
          image,
          predicted: prediction,
          actual: issueType,
        });
      }

      if (res.data?.success) {
        alert("Issue submitted successfully!");
        setImage(null);
        setDescription("");
        setIssueType("");
        setPrediction("");
        setUserModifiedIssueType(false);
        setLandmark("");
        setAddress("");
        setLatitude("");
        setLongitude("");
        setPriority("");
        setTopIssues([]);
      } else {
        alert("Failed to save issue.");
      }
    } catch (err) {
      console.error("Error submitting issue:", err);
      alert("Error submitting issue.");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Like
  const toggleLike = async (issueId) => {
    if (!user) {
      alert("Please sign in to vote!");
      return;
    }

    try {
      // Optimistic UI update
      setTopIssues((prev) =>
        prev.map((issue) =>
          issue._id === issueId
            ? {
                ...issue,
                isLiked: !issue.isLiked,
                likesCount: issue.isLiked
                  ? (issue.likesCount || 1) - 1
                  : (issue.likesCount || 0) + 1,
              }
            : issue
        )
      );

      // Call backend to persist like/unlike
      const res = await fetch("/api/issues", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueId,
          usermail: user.primaryEmailAddress?.emailAddress,
        }),
      });

      const data = await res.json();
      if (!data.success) console.error("Like failed:", data.error);
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 min-h-screen bg-white p-6">
      {/* Add Issue Form */}
      <Card className="w-full max-w-xl shadow-2xl rounded-2xl bg-gradient-to-r from-blue-50 via-blue-100 to-blue-200">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-indigo-700">
            Civic Issue Classifier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            {/* File Upload */}
            <div>
              <label className="text-sm font-medium">Upload Image</label>
              <Input type="file" onChange={handleImageChange} />
              {image && (
                <img
                  src={image}
                  alt="preview"
                  className="mt-3 h-32 w-full object-cover rounded-lg border"
                />
              )}
              {loadingPrediction && (
                <p className="text-blue-600 mt-2 text-sm">
                  ⏳ Classifying issue...
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="text-sm font-medium">Detected Location</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Click detect or type manually"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <Button
                  type="button"
                  onClick={detectLocation}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={loadingLocation}
                >
                  {loadingLocation ? "Detecting..." : "📍 Auto Detect"}
                </Button>
              </div>
            </div>

            {/* Landmark */}
            <div>
              <label className="text-sm font-medium">Nearby Landmark</label>
              <Input
                type="text"
                placeholder="E.g., Near City Mall"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
              />
            </div>

            {/* Issue Type */}
            <div>
              <label className="text-sm font-medium">
                Issue Type{" "}
                {prediction && (
                  <span className="text-xs text-gray-500">
                    (Predicted: {humanize(prediction)})
                  </span>
                )}
              </label>
              <select
                value={issueType}
                onChange={handleIssueTypeChange}
                className="w-full border rounded-lg p-2"
              >
                <option value="">
                  {loadingPrediction
                    ? "Detecting issue..."
                    : "Select Issue Type"}
                </option>
                {issueOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
              {userModifiedIssueType && (
                <p className="mt-2 text-sm text-yellow-700">
                  You changed the predicted issue type — this will be recorded
                  as a correction.
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium">Description</label>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Describe the issue"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <Button
                  type="button"
                  onClick={toggleListening}
                  className={`${
                    listening
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-500 hover:bg-green-600"
                  } text-white`}
                >
                  {listening ? "🎤 Stop" : "🎤 Speak"}
                </Button>
              </div>
            </div>

            {/* Priority + Submit */}
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={getPriority}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded-lg"
                disabled={loadingPrediction || loadingPriority}
              >
                {loadingPriority ? "Detecting Priority..." : "Get Priority"}
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!priority || submitting}
              >
                {submitting ? "Submitting..." : "Submit Issue"}
              </Button>
            </div>

            {/* Priority Result */}
            {priority && (
              <div className="mt-6 text-center">
                <h2 className="text-lg font-semibold">Predicted Priority:</h2>
                <span
                  className={`text-xl font-bold ${
                    priority === "critical"
                      ? "text-red-600"
                      : priority === "normal"
                      ? "text-yellow-500"
                      : "text-green-600"
                  }`}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </span>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Similar Issues Section */}
      {topIssues.length > 0 && (
        <div className="w-full max-w-xl">
          <h2 className="text-xl font-bold text-center mb-6">
            🔹 Similar Issues Nearby
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {topIssues.map((sim) => (
              <Card
                key={sim._id}
                className="shadow-md hover:shadow-lg transition cursor-pointer flex flex-col"
                onClick={() =>
                  router.push(`/dashboard/view-issue?id=${sim._id}`)
                }
              >
                <div className="relative">
                  <img
                    src={sim.image || "/placeholder.jpg"}
                    alt={sim.title || "Issue"}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <span className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-gray-800">
                    {sim.status?.toUpperCase() || "OPEN"}
                  </span>
                </div>

                <CardContent className="flex-1 flex flex-col gap-2 pt-3">
                  <p className="font-semibold text-gray-900 capitalize">
                    🏷️ {sim.issueType?.replaceAll("_", " ") || "General"}
                  </p>
                  <p className="text-sm text-gray-700 flex items-center gap-1">
                    📍 {sim.location?.fullAddress || "No address available"}
                  </p>
                  {sim.location?.landmark && (
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      🗺️ Landmark: {sim.location.landmark}
                    </p>
                  )}
                  <p className="text-sm">
                    ⚡ Priority:{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-white text-xs ${
                        sim.priority === "high"
                          ? "bg-red-600"
                          : sim.priority === "medium"
                          ? "bg-yellow-500"
                          : "bg-green-600"
                      }`}
                    >
                      {sim.priority
                        ? sim.priority.charAt(0).toUpperCase() +
                          sim.priority.slice(1)
                        : "Medium"}
                    </span>
                  </p>
                </CardContent>

                <CardFooter className="flex justify-between items-center px-4 py-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`flex items-center gap-1 ${
                      sim.isLiked ? "text-red-600" : "text-gray-600"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(sim._id);
                    }}
                  >
                    <Heart size={16} />
                    {sim.likesCount || 0}
                  </Button>
                  <span className="text-xs text-gray-500">
                    {sim.comments?.length || 0} comments
                  </span>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
