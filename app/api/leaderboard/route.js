// /api/leaderboard/route.js
import { NextResponse } from "next/server";
import connectToDB from "../../../lib/mongoose";
import User from "../../../models/User";

export async function GET() {
  try {
    await connectToDB();

    // Get top 3 users sorted by points
    const topUsers = await User.find({})
      .sort({ points: -1 })
      .limit(3)
      .select("firstName email points");

    return NextResponse.json({ success: true, leaderboard: topUsers });
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
