// /api/my-issues/route.js
import { NextResponse } from "next/server";
import connectToDB from "../../../lib/mongoose";
import Issue from "../../../models/Issues";
import User from "../../../models/User"; // ✅ Import User model

export async function GET(req) {
  try {
    await connectToDB();

    const url = new URL(req.url);
    const userEmail = url.searchParams.get("email");
    console.log("Fetching issues for email:", userEmail);

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not provided" },
        { status: 400 }
      );
    }

    // Fetch issues
    const userIssues = await Issue.find({ usermail: userEmail }).sort({
      createdAt: -1,
    });

    // Fetch user points
    const user = await User.findOne({ email: userEmail });

    console.log("Number of issues found:", userIssues.length);
    console.log("User points:", user?.points || 0);

    return NextResponse.json({
      issues: userIssues,
      points: user?.points || 0,
    });
  } catch (err) {
    console.error("Error in GET /api/my-issues:", err);
    return NextResponse.json(
      { error: "Failed to fetch issues" },
      { status: 500 }
    );
  }
}
