// app/post-auth/page.jsx
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import connectToDB from "@/lib/mongoose";
import User from "@/models/User";

const ADMIN_EMAIL = "paurasmore22@gmail.com";

export default async function PostAuthPage() {
  const { userId } = auth(); // server-side auth

  if (!userId) {
    return redirect("/login");
  }

  await connectToDB();
  const user = await User.findById(userId);

  if (!user) {
    return redirect("/login");
  }

  // Trim and lowercase both emails for safe comparison
  if (user.email?.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase()) {
    return redirect("/admin/dashboard");
  }

  // Normal user
  return redirect("/user/dashboard");
}
