"use client";

import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default function Home() {
  const issueOptions = [
    "broken_benches",
    "fallen_trees",
    "garbage",
    "leaky_pipes",
    "open_manhole",
    "potholes",
    "streetlight",
    "others"
  ];

  const [image, setImage] = useState(null);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [issueType, setIssueType] = useState("");
  const [priority, setPriority] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  // 📍 Auto-detect location
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          const res = await fetch(
            `/api/reverse-geocode?lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();

          if (data?.results && data.results.length > 0) {
            setLocation(data.results[0].formatted_address);
          } else {
            setLocation(`${latitude}, ${longitude}`);
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          setLocation(`${latitude}, ${longitude}`);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await axios.post("/api/prioritize", {
      image,
      location,
      description,
      issueType,
    });

    setPriority(res.data.priority);
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
          <form onSubmit={handleSubmit} className="space-y-4">
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
            </div>

            {/* Location */}
            <div>
              <label className="text-sm font-medium">Location</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Detecting location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
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

            {/* Issue Type */}
            <div>
              <label className="text-sm font-medium">Issue Type</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full border rounded-lg p-2"
              >
                <option value="">Select Issue Type</option>
                {issueOptions.map((issue) => (
                  <option key={issue} value={issue}>
                    {issue.replaceAll("_", " ")}{" "}
                    {/* optional: show nicer text */}
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

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg"
            >
              Classify Issue
            </Button>
          </form>

          {/* Priority Result */}
          {priority && (
            <div className="mt-6 text-center">
              <h2 className="text-lg font-semibold">Predicted Priority:</h2>
              <span
                className={`text-xl font-bold ${
                  priority === "Critical"
                    ? "text-red-600"
                    : priority === "Normal"
                    ? "text-yellow-500"
                    : "text-green-600"
                }`}
              >
                {priority}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
