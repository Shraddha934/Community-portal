"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";

export default function Home() {
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

  // 🔹 States
  const [image, setImage] = useState(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [description, setDescription] = useState("");
  const [issueType, setIssueType] = useState(""); // current dropdown value (snake_case)
  const [prediction, setPrediction] = useState(""); // normalized model prediction (snake_case)
  const [priority, setPriority] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [loadingPriority, setLoadingPriority] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // track whether user changed the dropdown after prediction
  const [userModifiedIssueType, setUserModifiedIssueType] = useState(false);

  // 🎤 Speech recognition states
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // ─────────────────────────────────────────────────────────
  // Helper: normalize any label into the same snake_case used by issueOptions
  const normalizeToOptionValue = (label) => {
    if (!label && label !== 0) return "";
    return String(label)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_") // spaces -> underscores
      .replace(/[^a-z0-9_]/g, ""); // remove weird chars
  };

  // Human friendly display
  const humanize = (val) => (val ? val.replaceAll("_", " ") : "");

  // ─────────────────────────────────────────────────────────
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
      alert("Speech Recognition not supported in this browser (try Chrome).");
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

  // ─────────────────────────────────────────────────────────
  // Handle image upload + prediction (Flask)
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // preview
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

      // raw label from model (might be "Garbage" / "garbage" / "garbage ")
      const raw = res.data?.class ?? "";

      // normalize to our option value format
      const normalized = normalizeToOptionValue(raw);

      // if normalized isn't one of our options, keep as-is but normalized will still be stored
      setIssueType(normalized);
      setPrediction(normalized);
      setUserModifiedIssueType(false); // reset user-change flag for new prediction

      console.log("Model predicted:", raw, "-> normalized:", normalized);
    } catch (error) {
      console.error("Prediction error:", error);
      alert("Error classifying the issue. Please try again.");
    } finally {
      setLoadingPrediction(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // Location detection (unchanged)
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
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
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          setAddress(`${lat}, ${lon}`);
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        console.error(error);
        alert("Unable to retrieve location.");
        setLoadingLocation(false);
      }
    );
  };

  // ─────────────────────────────────────────────────────────
  // Priority detection (unchanged)
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
        const txt = (res.data.priority || "").toString().toLowerCase();
        if (txt.includes("critical")) raw = "critical";
        else if (txt.includes("low")) raw = "low";
        else raw = "normal";
      }

      setPriority(raw);
    } catch (err) {
      console.error("Error getting priority:", err);
      alert("Unable to get priority. Try again.");
    } finally {
      setLoadingPriority(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // When user changes dropdown, handle and log immediately
  const handleIssueTypeChange = (e) => {
    const newVal = e.target.value; // already snake_case option values
    setIssueType(newVal);

    // mark that user manually changed the selection after prediction
    setUserModifiedIssueType(true);

    if (prediction) {
      if (newVal !== prediction) {
        console.log("User corrected prediction:", {
          predicted: prediction,
          final: newVal,
        });
      } else {
        console.log("User explicitly re-selected the predicted value:", newVal);
      }
    } else {
      console.log("User selected issue type (no prediction present):", newVal);
    }
  };

  // ─────────────────────────────────────────────────────────
  // Submit (logs as well)
  const handleSubmit = async () => {
    if (!priority) {
      alert("Please detect priority first.");
      return;
    }

    setSubmitting(true);
    try {
      let mappedPriority = "low";
      if (priority === "critical") mappedPriority = "high";
      else if (priority === "normal") mappedPriority = "medium";
      else if (priority === "low") mappedPriority = "low";

      const criticalityForDb =
        priority.charAt(0).toUpperCase() + priority.slice(1);

      // Determine accepted vs corrected
      let issueStatus = "accepted";
      if (!prediction) issueStatus = "user_provided";
      else if (prediction && issueType !== prediction)
        issueStatus = "corrected";
      else issueStatus = "accepted";

      const payload = {
        issueType,
        image,
        location: {
          latitude,
          longitude,
          landmark,
        },
        status: "open",
        usermail: userEmail || "unknown@example.com",
        priority: mappedPriority,
        description,
        criticality: criticalityForDb,
        issueStatus,
        predicted: prediction || null,
      };

      console.log("Submitting issue:", payload);

      // Save issue in main collection
      const res = await axios.post("/api/issues", payload);

      // If corrected, also log into Corrected collection
      if (issueStatus === "corrected") {
        await axios.post("/api/corrected", {
          image,
          predicted: prediction,
          actual: issueType, // <-- match API field name
        });
      }

      if (res.data?.success) {
        alert("Issue submitted successfully!");
        // clear form
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
        console.error("DB insert error:", res.data);
        alert("Failed to save issue. Check server logs.");
      }
    } catch (err) {
      console.error("Error submitting issue:", err);
      alert("Error submitting issue.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────
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
                  ⏳ Classifying issue, please wait...
                </p>
              )}
            </div>

            {/* Location Detection */}
            <div>
              <label className="text-sm font-medium">Detected Location</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Click detect to fetch location"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  readOnly
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
                placeholder="E.g., Near City Mall, Opposite Bus Stop"
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

              {/* small helper text if the user changed the selection */}
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

            {/* Get Priority + Submit buttons */}
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
          </form>

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
        </CardContent>
      </Card>
    </div>
  );
}
