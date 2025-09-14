import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectToDB from "../../../lib/mongoose";
import User from "../../../models/User";

//const ADMIN_EMIAL="add_your_mail"
const ADMIN_EMAIL = [
  "shraddhaghuleshraddha@gmail.com",
  "paurasmore22@gmail.com",
]; // set your admin email

export async function POST(req) {
  try {
    const { userId } = getAuth(req); // Clerk userId
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const { name, email } = await req.json();

    // If admin email, set role = admin
    const role = ADMIN_EMAIL.includes(email) ? "admin" : "user";

    // Always ensure user exists (create or update)
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { name, email, role }, // update role in case email matches
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error("Error in user route:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
