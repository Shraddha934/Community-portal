// app/page.js

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardPage from "./dashboard/page";
import LandingPage from "../components/LandingPage";

export default function HomePage() {
  const { userId } = auth();

  // ✅ If the user is logged in → show Dashboard
  if (userId) {
    return <DashboardPage />;
  }

  // ✅ If the user is not logged in → show Landing Page
  return <LandingPage />;
}
