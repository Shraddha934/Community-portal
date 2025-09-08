// app/page.js

import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import DashboardPage from "./dashboard/page";

export default function HomePage() {
  const { userId } = auth();

  // If the user is not signed in → show landing page with sign-in link
  if (userId) {
    return ("/dashboard");
  }

  // If user is signed in → redirect or show dashboard link
  return <DashboardPage />
}
