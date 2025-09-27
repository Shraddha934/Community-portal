// app/api/update-issue/route.js
import { NextResponse } from "next/server";
import connectToDB from "../../../lib/mongoose";
import Issues from "../../../models/Issues";

export async function PATCH(req) {
  try {
    await connectToDB();

    const { id, description, location } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Issue ID required" },
        { status: 400 }
      );
    }

    // Build update object
    const updateFields = {};
    if (description !== undefined) updateFields.description = description;

    // Update only landmark if location is provided
    if (location?.landmark !== undefined) {
      updateFields["location.landmark"] = location.landmark;
    }

    const updatedIssue = await Issues.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    if (!updatedIssue) {
      return NextResponse.json(
        { success: false, message: "Issue not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, issue: updatedIssue });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error updating issue", error: err.message },
      { status: 500 }
    );
  }
}
