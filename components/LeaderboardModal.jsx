"use client";
import React from "react";

export default function LeaderboardModal({ leaderboard, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-lg"
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          🏆 Top 3 Users
        </h2>

        {(!leaderboard || leaderboard.length === 0) ? (
          <p className="text-gray-500 text-center">
            No leaderboard data available
          </p>
        ) : (
          <ul className="space-y-3">
            {leaderboard.map((user, index) => (
              <li
                key={user.email}
                className="flex justify-between items-center border-b pb-2"
              >
                <span className="font-semibold">
                  {index + 1}. {user.firstName || user.email.split("@")[0]}
                </span>
                <span className="text-blue-600 font-bold">{user.points} pts</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
