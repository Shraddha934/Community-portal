"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { UserButton, SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { Menu, X } from "lucide-react"; // hamburger & close icons

const Navbar = () => {
  const { isSignedIn, user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (isSignedIn && user) {
      const createUser = async () => {
        try {
          const res = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              name: user.fullName,
              email: user.emailAddresses[0].emailAddress,
            }),
          });

          const data = await res.json();
          console.log("User created/fetched:", data);
        } catch (err) {
          console.error("Error creating user:", err);
        }
      };

      createUser();
    }
  }, [isSignedIn, user]);
  return (
    <nav className="bg-white shadow-md fixed w-full top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo / Brand */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Community Issue Reporting Portal
        </Link>
        <header className="flex items-center justify-between px-6 py-4 ">
          <nav className="hidden md:flex gap-6 text-gray-700">
            <Link href="#features" className="hover:text-blue-600">
              Features
            </Link>
            <Link href="#about" className="hover:text-blue-600">
              About
            </Link>
            <Link href="#contact" className="hover:text-blue-600">
              Contact
            </Link>
          </nav>
        </header>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-blue-600"
              >
                Dashboard
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

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md flex flex-col items-center gap-4 py-6">
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-blue-600"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
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
