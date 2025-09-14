// /api/my-issues/route.js
import { NextResponse } from "next/server";
import connectToDB from "../../../lib/mongoose";
import Issue from "../../../models/Issues";

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

    const userIssues = await Issue.find({ usermail: userEmail }).sort({
      createdAt: -1,
    });

    console.log("Number of issues found:", userIssues.length);
    return NextResponse.json(userIssues);
  } catch (err) {
    console.error("Error in GET /api/my-issues:", err);
    return NextResponse.json(
      { error: "Failed to fetch issues" },
      { status: 500 }
    );
  }
}
