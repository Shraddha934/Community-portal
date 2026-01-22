"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { UserButton, SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { Menu, X, Bell } from "lucide-react";

const Navbar = () => {
  const { isSignedIn, user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isSignedIn && user) {
      const createOrFetchUser = async () => {
        try {
          const res = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              clerkId: user.id,
              name: user.fullName,
              email: user.emailAddresses[0].emailAddress,
            }),
          });

          const data = await res.json();
          if (data?.user?.role) {
            setRole(data.user.role);
          }
        } catch (err) {
          console.error("Error creating/fetching user:", err);
        }
      };

      createOrFetchUser();
    }
  }, [isSignedIn, user]);

  // 🔔 Fetch unread notification count
  useEffect(() => {
    if (!isSignedIn || !user) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await fetch(
          `/api/notifications/unread-count?email=${user.emailAddresses[0].emailAddress}`,
        );
        const data = await res.json();
        setUnreadCount(data.count || 0);
      } catch (err) {
        console.error("Failed to fetch unread count", err);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 20000);

    return () => clearInterval(interval);
  }, [isSignedIn, user]);

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 fixed w-full top-0 left-0 z-50 py-3">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Community Issue Reporting Portal
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {isSignedIn ? (
            <>
              {role === "admin" ? (
                <Link
                  href="/admin"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Admin Dashboard
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Dashboard
                </Link>
              )}

              <Link href="/map" className="text-gray-700 hover:text-blue-600">
                Map
              </Link>

              <Link
                href="/useranalytics"
                className="text-gray-700 hover:text-blue-600"
              >
                User Analytics
              </Link>

              {role === "admin" && (
                <Link
                  href="/wrongpredict"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Wrong predicted
                </Link>
              )}

              {/* 🔔 Notification Bell */}
              <Link href="/notifications" className="relative">
                <Bell className="text-gray-700 hover:text-blue-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </Link>

              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Log In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
                  Sign Up
                </button>
              </SignUpButton>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex items-center text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md flex flex-col items-center gap-4 py-6">
          {isSignedIn ? (
            <>
              {role === "admin" ? (
                <Link
                  href="/admin"
                  className="text-gray-700 hover:text-blue-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-blue-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}

              <Link
                href="/map"
                className="text-gray-700 hover:text-blue-600"
                onClick={() => setMenuOpen(false)}
              >
                Map
              </Link>

              {role === "admin" && (
                <Link
                  href="/wrongpredict"
                  className="text-gray-700 hover:text-blue-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Wrong predicted
                </Link>
              )}

              {/* 🔔 Mobile Notification */}
              <Link
                href="/notifications"
                className="text-gray-700 hover:text-blue-600 flex items-center gap-2"
                onClick={() => setMenuOpen(false)}
              >
                <Bell size={18} />
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-red-600 text-white text-xs rounded-full px-2 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </Link>

              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button
                  className="w-40 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Log In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  className="w-40 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
