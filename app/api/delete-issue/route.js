// app/api/delete-issue/route.js
import { NextResponse } from "next/server";
import connectToDB from "../../../lib/mongoose";
import Issues from "../../../models/Issues";

export async function DELETE(req) {
  try {
    await connectToDB();

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Issue ID required" },
        { status: 400 }
      );
    }

    const deletedIssue = await Issues.findByIdAndDelete(id);

    if (!deletedIssue) {
      return NextResponse.json(
        { success: false, message: "Issue not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error deleting issue", error: err.message },
      { status: 500 }
    );
  }
}
