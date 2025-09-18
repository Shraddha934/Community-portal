"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { UserButton, SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const { isSignedIn, user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (isSignedIn && user) {
      const createOrFetchUser = async () => {
        try {
          const res = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              clerkId: user.id, // store Clerk ID
              name: user.fullName,
              email: user.emailAddresses[0].emailAddress,
            }),
          });

          const data = await res.json();
          console.log("User created/fetched:", data);

          if (data?.user?.role) {
            setRole(data.user.role); // set role in state
          }
        } catch (err) {
          console.error("Error creating/fetching user:", err);
        }
      };

      createOrFetchUser();
    }
  }, [isSignedIn, user]);

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 fixed w-full top-0 left-0 z-50 py-3">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo / Brand */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Community Issue Reporting Portal
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {isSignedIn ? (
            <>
              {/* Dashboard link based on role */}
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

              {/* Common Map link */}
              <Link href="/map" className="text-gray-700 hover:text-blue-600">
                Map
              </Link>

              {/* Wrong predicted only for admin */}
              {role === "admin" && (
                <Link
                  href="/wrongpredict"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Wrong predicted
                </Link>
              )}

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

      {/* Mobile Menu Dropdown */}
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

              {/* Common Map link */}
              <Link
                href="/map"
                className="text-gray-700 hover:text-blue-600"
                onClick={() => setMenuOpen(false)}
              >
                Map
              </Link>

              {/* Wrong predicted only for admin */}
              {role === "admin" && (
                <Link
                  href="/wrongpredict"
                  className="text-gray-700 hover:text-blue-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Wrong predicted
                </Link>
              )}

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
