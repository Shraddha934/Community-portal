// app/page.js
// No "use client" here
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import connectToDB from "../lib/mongoose";
import User from "../models/User";
import LandingPage from "../components/LandingPage";


export default async function HomePage() {
  const { userId } = auth();

  if (!userId) return <LandingPage />;

  await connectToDB();
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;

  const user = await User.findOne({ email });

  if (!user) redirect("/sign-in");

  if (user.role === "admin") {
    redirect("/admin"); // this only works in server components
  } else {
    redirect("/dashboard");
  }
}
