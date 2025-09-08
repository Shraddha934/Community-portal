"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export default function AddIssuePage() {
  const [images, setImages] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 3) {
      alert("You can only upload up to 3 images.");
      return;
    }
    setImages((prev) => [...prev, ...files].slice(0, 3));
  };

  const handlePost = () => {
    if (images.length < 1) {
      alert("Please capture or upload at least 1 image.");
      return;
    }
    alert("Issue posted successfully 🚀");
    // Later: API call will go here
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center overflow-y-auto">
      {/* Page Heading */}
      <h1 className="text-2xl font-bold mb-8 sticky top-0 bg-gray-50 w-full text-center py-2 z-10 mt-16">
        Add New Issue
      </h1>

      {/* Upload Section */}
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <p className="text-gray-700 mb-2">Capture or Upload Images (1–3)</p>

        <div className="flex flex-col gap-3 mb-4">
          {/* Capture with Camera */}
          <label className="block">
            <span className="text-gray-600 text-sm">Capture from Camera</span>
            <input
              type="file"
              accept="image/*"
              capture="environment" // back camera
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-500"
            />
          </label>

          {/* Upload from Gallery */}
          <label className="block">
            <span className="text-gray-600 text-sm">Upload from Gallery</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-500"
            />
          </label>
        </div>

        {/* Preview Images */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {images.map((file, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt={`upload-${index}`}
                className="w-full h-24 object-cover rounded-lg border"
              />
            </div>
          ))}
        </div>

        {/* Post Button */}
        <Button
          onClick={handlePost}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Post Issue
        </Button>
      </div>
    </div>
  );
}
