
"use client";

import React from "react";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LandingPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard"); // redirect signed-in users
    }
  }, [isSignedIn, router]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="w-full px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold text-blue-600">CivicCare</h1>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col md:flex-row items-center justify-center px-8 md:px-20 py-12 bg-gradient-to-r from-blue-50 to-blue-100">
        {/* Left Content */}
        <div className="flex-1 space-y-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
            Report Civic Issues.
            <span className="text-blue-600"> Get Them Fixed.</span>
          </h2>
          <p className="text-lg text-gray-600">
            From potholes to broken streetlights — report issues instantly. Our
            AI-powered system prioritizes them, auto-tags location, and keeps
            you updated until resolved by the municipality.
          </p>
          <div className="space-x-4">
            <Link
              href="/sign-up"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition"
            >
              Report Issue
            </Link>
            <a
              href="#features"
              className="px-6 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Right Image */}
        <div className="flex-1 mt-10 md:mt-0 flex justify-center">
          <img
            src="/hero-city.png"
            alt="City Issue Reporting"
            className="w-3/4 md:w-full rounded-xl shadow-lg"
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-8 md:px-20 py-16 bg-white">
        <h3 className="text-3xl font-bold text-center mb-12">
          Why Use CivicCare?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="p-6 border rounded-xl shadow hover:shadow-lg transition">
            <h4 className="text-xl font-semibold text-blue-600">
              📷 Easy Reporting
            </h4>
            <p className="mt-2 text-gray-600">
              Snap a photo of issues like potholes, broken benches, or
              streetlights in seconds.
            </p>
          </div>
          <div className="p-6 border rounded-xl shadow hover:shadow-lg transition">
            <h4 className="text-xl font-semibold text-blue-600">
              🤖 AI Prioritization
            </h4>
            <p className="mt-2 text-gray-600">
              Our AI automatically classifies and prioritizes issues for quick
              municipal action.
            </p>
          </div>
          <div className="p-6 border rounded-xl shadow hover:shadow-lg transition">
            <h4 className="text-xl font-semibold text-blue-600">
              📍 Auto Geotagging
            </h4>
            <p className="mt-2 text-gray-600">
              Issues are pinned to their exact location so authorities know
              where to act.
            </p>
          </div>
          <div className="p-6 border rounded-xl shadow hover:shadow-lg transition">
            <h4 className="text-xl font-semibold text-blue-600">
              📊 Live Status Updates
            </h4>
            <p className="mt-2 text-gray-600">
              Track the progress of your report until it’s resolved by the
              municipality.
            </p>
          </div>
          <div className="p-6 border rounded-xl shadow hover:shadow-lg transition">
            <h4 className="text-xl font-semibold text-blue-600">
              👥 Community Impact
            </h4>
            <p className="mt-2 text-gray-600">
              Your reports make neighborhoods safer and cleaner for everyone.
            </p>
          </div>
          <div className="p-6 border rounded-xl shadow hover:shadow-lg transition">
            <h4 className="text-xl font-semibold text-blue-600">
              ⚡ Fast & Transparent
            </h4>
            <p className="mt-2 text-gray-600">
              No more delays — instant reporting and transparent updates for
              citizens.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="px-8 md:px-20 py-10 bg-blue-600 text-white text-center">
        <h4 className="text-2xl font-bold mb-4">
          Be the change in your city 🚀
        </h4>
        <p className="mb-6">
          Join CivicCare today and help make your neighborhood a better place.
        </p>
        <Link
          href="/sign-up"
          className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl shadow hover:bg-gray-100 transition"
        >
          Get Started
        </Link>
      </footer>
    </div>
  );
}
