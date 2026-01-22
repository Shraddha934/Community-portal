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

const ISSUE_DRAFT_KEY = "civic_issue_draft";

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
 
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
 
  const [submitting, setSubmitting] = useState(false);
  const [userModifiedIssueType, setUserModifiedIssueType] = useState(false);
  const [topIssues, setTopIssues] = useState([]);
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);

  /* =======================
     🔁 RESTORE DRAFT (ON LOAD)
     ======================= */
  useEffect(() => {
    const cached = localStorage.getItem(ISSUE_DRAFT_KEY);
    if (!cached) return;

    try {
      const data = JSON.parse(cached);
      setImage(data.image || null);
      setLatitude(data.latitude || "");
      setLongitude(data.longitude || "");
      setAddress(data.address || "");
      setLandmark(data.landmark || "");
      setDescription(data.description || "");
      setIssueType(data.issueType || "");
      setPrediction(data.prediction || "");
     
    } catch (err) {
      console.error("Invalid cached draft", err);
    }
  }, []);

  /* =======================
     💾 AUTO-SAVE DRAFT
     ======================= */
  useEffect(() => {
    const draft = {
      image,
      latitude,
      longitude,
      address,
      landmark,
      description,
      issueType,
      prediction,
    };

    localStorage.setItem(ISSUE_DRAFT_KEY, JSON.stringify(draft));
  }, [
    image,
    latitude,
    longitude,
    address,
    landmark,
    description,
    issueType,
    prediction,
  ]);
  const handleIssueTypeChange = (e) => {
    setIssueType(e.target.value);
    setUserModifiedIssueType(true);
  };
  /* =======================
     🎙️ SPEECH RECOGNITION
     ======================= */
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
          if (event.results[i].isFinal) {
            setDescription(
              (prev) => prev + event.results[i][0].transcript + " ",
            );
          }
        }
      };

      recognitionRef.current.onerror = () => setListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    listening ? recognitionRef.current.stop() : recognitionRef.current.start();
    setListening(!listening);
  };

  const normalizeToOptionValue = (label) =>
    label
      ?.toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "") || "";

  const humanize = (val) => val?.replaceAll("_", " ") || "";

  /* =======================
     📸 IMAGE + PREDICTION
     ======================= */
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
      const res = await axios.post("http://127.0.0.1:5000/predict", formData);
      const normalized = normalizeToOptionValue(res.data?.class);
      setIssueType(normalized);
      setPrediction(normalized);
      setUserModifiedIssueType(false);
    } catch {
      alert("Prediction failed");
    } finally {
      setLoadingPrediction(false);
    }
  };

  /* =======================
     📍 LOCATION
     ======================= */
  const detectLocation = () => {
    if (!navigator.geolocation) return;

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);

        try {
          const res = await fetch(
            `/api/reverse-geocode?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`,
          );
          const data = await res.json();
          setAddress(data?.results?.[0]?.formatted_address || "");
        } finally {
          setLoadingLocation(false);
        }
      },
      () => setLoadingLocation(false),
    );
  };

 
  

  /* =======================
     📤 SUBMIT
     ======================= */
  const handleSubmit = async () => {
    

    setSubmitting(true);
    try {
      const payload = {
        issueType,
        image,
        location: {
          latitude: Number(latitude),
          longitude: Number(longitude),
          landmark,
          fullAddress: address,
        },
        status: "open",
        usermail: userEmail || "unknown@example.com",
        description,
      };

      const res = await axios.post("/api/issues", payload);

      if (res.data?.success) {
        localStorage.removeItem(ISSUE_DRAFT_KEY); // ✅ CLEAR CACHE
        alert("Issue submitted successfully!");
        setImage(null);
        setDescription("");
        setIssueType("");
        setPrediction("");
        setLandmark("");
        setAddress("");
        setLatitude("");
        setLongitude("");
        setTopIssues([]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================
     ❤️ LIKE
     ======================= */
  const toggleLike = async (id) => {
    if (!user) return alert("Login required");
    setTopIssues((prev) =>
      prev.map((i) =>
        i._id === id
          ? { ...i, isLiked: !i.isLiked, likesCount: (i.likesCount || 0) + 1 }
          : i,
      ),
    );
  };

  return (
    <div className="flex flex-col items-center gap-8 min-h-screen bg-white p-6 ">
      {/* Add Issue Form */}
      <Card className="w-full max-w-xl shadow-2xl rounded-2xl bg-gradient-to-r from-blue-50 via-blue-100 to-blue-200 ">
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
                onClick={handleSubmit}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Issue"}
              </Button>
            </div>

            {/* Priority Result */}
          </form>
        </CardContent>
      </Card>

      {/* Similar Issues Section */}
      {topIssues.length > 0 && (
        <div className="w-full max-w-xl">
          <h2 className="text-xl font-bold text-center mb-6">
            🔹 This Issue Has Been Reported Earlier
          </h2>
          <p>
            This issue appears to be similar to one that has already been
            reported by another user. To avoid duplicate reports, please like
            the existing issue to show support and help increase its priority.
          </p>
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
