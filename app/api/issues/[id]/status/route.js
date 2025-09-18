// app/api/issues/[id]/status/route.js
import connectToDB from "../../../../../lib/mongoose";
import Issue from "../../../../../models/Issues";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    await connectToDB();
    const { id } = await params;
    const { status } = await req.json(); // admin sends new status (e.g., "In Progress")

    const updatedIssue = await Issue.findByIdAndUpdate(
      id,
      { status },
      { new: true } // return updated doc
    );

    if (!updatedIssue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json(updatedIssue, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
