"use client";

import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [issueType, setIssueType] = useState("");
  const [priority, setPriority] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result); // base64 string
    reader.readAsDataURL(file);
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
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Civic Issue Classifier</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleImageChange} />
        <br />
        <br />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <br />
        <br />
        <input
          type="text"
          placeholder="Issue Type"
          value={issueType}
          onChange={(e) => setIssueType(e.target.value)}
        />
        <br />
        <br />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <br />
        <br />
        <button type="submit">Classify</button>
      </form>

      {priority && (
        <h2>
          Predicted Priority:{" "}
          <span
            style={{
              color:
                priority === "Critical"
                  ? "red"
                  : priority === "Normal"
                  ? "orange"
                  : "green",
            }}
          >
            {priority}
          </span>
        </h2>
      )}
    </div>
  );
}
