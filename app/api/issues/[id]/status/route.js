import connectToDB from "../../../../../lib/mongoose";
import Issue from "../../../../../models/Issues";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    await connectToDB();

    // params is directly available here
    const id = params.id;
    const { status } = await req.json();

    // Find the issue
    const issue = await Issue.findById(id);
    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // Prepare update object
    const updateData = { status };

    // Set lifecycle dates if missing
    if (status === "inprogress" && !issue.inProgressOn) {
      updateData.inProgressOn = new Date();
    }
    if (status === "resolved" && !issue.closedOn) {
      updateData.closedOn = new Date();
    }

    const updatedIssue = await Issue.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return NextResponse.json(updatedIssue, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
