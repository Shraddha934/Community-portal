// /api/points/route.js
import { NextResponse } from "next/server";
import connectToDB from "../../../lib/mongoose";
import User from "../../../models/User";

export async function GET(req) {
  try {
    await connectToDB();

    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email not provided" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ points: user.points || 0 });
  } catch (err) {
    console.error("Error in GET /api/points:", err);
    return NextResponse.json(
      { error: "Failed to fetch points" },
      { status: 500 }
    );
  }
}
