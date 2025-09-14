"use client";

import { useState } from "react";
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
  const [address, setAddress] = useState(""); // human-readable
  const [landmark, setLandmark] = useState("");
  const [description, setDescription] = useState("");
  const [issueType, setIssueType] = useState("");
  const [priority, setPriority] = useState(""); // normalized: "critical"|"normal"|"low"
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [loadingPriority, setLoadingPriority] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 🔹 Handle image upload + prediction (Flask)
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview as base64
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);

    // Send original file to your Flask /predict
    const formData = new FormData();
    formData.append("file", file);

    setLoadingPrediction(true);
    try {
      const res = await axios.post("http://127.0.0.1:5000/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.class) {
        setIssueType(res.data.class);
      }
    } catch (error) {
      console.error("Prediction error:", error);
      alert("Error classifying the issue. Please try again.");
    } finally {
      setLoadingPrediction(false);
    }
  };

  // 🔹 Auto-detect location
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

  // 🔹 Get Priority (call /api/prioritize) — user clicks this first
  const getPriority = async () => {
    setLoadingPriority(true);
    try {
      const res = await axios.post("/api/prioritize", {
        image,
        location: { latitude, longitude, address, landmark },
        description,
        issueType,
      });

      // Normalize response and defensively parse unexpected text
      let raw = (res.data.priority || "").toString().trim().toLowerCase();
      if (!["critical", "normal", "low"].includes(raw)) {
        const txt = (res.data.priority || "").toString().toLowerCase();
        if (txt.includes("critical")) raw = "critical";
        else if (txt.includes("low")) raw = "low";
        else raw = "normal";
      }

      setPriority(raw); // "critical" | "normal" | "low"
    } catch (err) {
      console.error("Error getting priority:", err);
      alert("Unable to get priority. Try again.");
    } finally {
      setLoadingPriority(false);
    }
  };

  // 🔹 Submit Issue to DB (call /api/issue) — only after priority is set
  const handleSubmit = async () => {
    if (!priority) {
      alert("Please detect priority first.");
      return;
    }

    setSubmitting(true);
    try {
      // Map normalized priority to DB priority field
      // critical -> high, normal -> medium, low -> low
      let mappedPriority = "low";
      if (priority === "critical") mappedPriority = "high";
      else if (priority === "normal") mappedPriority = "medium";
      else if (priority === "low") mappedPriority = "low";

      // capitalized criticality for readability (change if backend expects different)
      const criticalityForDb =
        priority.charAt(0).toUpperCase() + priority.slice(1); // "Critical"|"Normal"|"Low"

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
        priority: mappedPriority, // "high" | "medium" | "low"
        description,
        criticality: criticalityForDb, // "Critical" | "Normal" | "Low"
      };

      const res = await axios.post("/api/issues", payload);

      if (res.data?.success) {
        alert("Issue submitted successfully!");
        // optional: clear form after success
        setImage(null);
        setDescription("");
        setIssueType("");
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
              <label className="text-sm font-medium">Issue Type</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
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
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Describe the issue"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
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
                disabled={!priority || submitting} // 🔹 disabled until priority is set
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
