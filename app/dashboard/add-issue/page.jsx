"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";

export default function AddIssuePage() {
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

  // States
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

  // Speech recognition
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const normalizeToOptionValue = (label) => {
    if (!label && label !== 0) return "";
    return String(label)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  };

  const humanize = (val) => (val ? val.replaceAll("_", " ") : "");

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
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setDescription((prev) => prev + transcriptChunk + " ");
          } else {
            interimTranscript += transcriptChunk;
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

  // Priority detection
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

      // Fetch similar nearby issues
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
        console.log("Nearby similar issues detected:", nearbyIssues);
        setTopIssues(nearbyIssues.slice(0, 3));
      }
    } catch (err) {
      console.error("Unable to get priority or fetch nearby issues.", err);
      alert("Unable to get priority or fetch nearby issues.");
    } finally {
      setLoadingPriority(false);
    }
  };
  // Handle dropdown change
  const handleIssueTypeChange = (e) => {
    const newVal = e.target.value;
    setIssueType(newVal);
    setUserModifiedIssueType(true);
  };

  // Submit
  const handleSubmit = async () => {
    if (!priority) {
      alert("Please detect priority first.");
      return;
    }

    setSubmitting(true);
    try {
      let mappedPriority =
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

      // Fallback for fullAddress
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

      console.log("Submitting issue payload:", payload); // <-- log payload

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

  return (
    <div className="flex justify-center items-center min-h-screen bg-white p-6">
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

            {/* Location Detection */}
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
                {issueOptions.map((issue) => (
                  <option key={issue} value={issue}>
                    {issue.replaceAll("_", " ")}
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
          {/* Top 3 similar issues */}
        </CardContent>
        {/* Top 3 similar issues */}
        {/* Top 3 similar issues */}
        {topIssues.length > 0 && (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold text-center">
              Similar Issues Nearby
            </h2>
            {topIssues.map((issue) => (
              <Card key={issue._id} className="border rounded-lg">
                <CardHeader>
                  <CardTitle className="capitalize">
                    {issue.issueType.replaceAll("_", " ")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {issue.image && (
                    <img
                      src={issue.image}
                      alt={issue.issueType}
                      className="h-32 w-full object-cover rounded-lg"
                    />
                  )}
                  <p className="text-sm">
                    <span className="font-semibold">Description:</span>{" "}
                    {issue.description || "No description"}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Status:</span>{" "}
                    <span
                      className={
                        issue.status === "open"
                          ? "text-green-600"
                          : issue.status === "closed"
                          ? "text-red-600"
                          : "text-gray-600"
                      }
                    >
                      {issue.status || "unknown"}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Landmark:</span>{" "}
                    {issue.location?.landmark || "N/A"}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Location:</span>{" "}
                    {issue.location?.fullAddress ||
                      `${issue.location?.latitude}, ${issue.location?.longitude}` ||
                      "N/A"}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Posted by:</span>{" "}
                    {issue.usermail || "unknown"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
