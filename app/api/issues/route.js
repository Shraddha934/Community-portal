import { NextResponse } from "next/server";
import connectToDB from "../../../lib/mongoose";
import Issue from "../../../models/Issues";

// POST - create new issue
export async function POST(req) {
  try {
    await connectToDB();

    const body = await req.json();
    const {
      issueType,
      image,
      location,
      status,
      usermail,
      priority,
      description,
      criticality,
    } = body;

    const newIssue = await Issue.create({
      issueType,
      image,
      location,
      status,
      usermail,
      priority,
      description,
      criticality,
    });

    return NextResponse.json(
      { success: true, issue: newIssue },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating issue:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET - fetch all issues
export async function GET() {
  try {
    await connectToDB();
    const issues = await Issue.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, issues });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
