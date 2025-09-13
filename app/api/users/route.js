import { auth, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectToDB from "../../../lib/mongoose";
import User from "../../../models/User";

export async function POST(req) {
  try {
    const { userId } = getAuth(req); // Clerk session
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDB();

    const { name, email } = await req.json();

    const user = await User.findOneAndUpdate(
      { _id: userId }, // use Clerk userId as _id
      { $setOnInsert: { name, email, role: "user" } }, // only insert if not exists
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
