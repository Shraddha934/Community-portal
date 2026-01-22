import { sendEmail } from "@/lib/sendEmail";
import connectToDB from "../../../../../lib/mongoose";
import Issue from "../../../../../models/Issues";
import Notification from "../../../../../models/Notification";
import { NextResponse } from "next/server";

export async function PATCH(req, context) {
  try {
    await connectToDB();

    const { id } = await context.params;
    const { status } = await req.json();

    const issue = await Issue.findById(id);
    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    const oldStatus = issue.status;

    if (oldStatus === status) {
      return NextResponse.json(issue, { status: 200 });
    }

    const updateData = { status };

    if (status === "inprogress" && !issue.inProgressOn) {
      updateData.inProgressOn = new Date();
    }

    if (status === "resolved" && !issue.closedOn) {
      updateData.closedOn = new Date();
    }

    const updatedIssue = await Issue.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    // ================= EMAIL + NOTIFICATION SYSTEM =================

    const subject = "Issue Status Updated";
    const postedDate = new Date(issue.createdAt).toDateString();
    const issueTypeFormatted = issue.issueType.replaceAll("_", " ");

    const creatorMessage = `Your reported issue of type ${issueTypeFormatted}, posted on ${postedDate}, has been moved from ${oldStatus} to ${status}.`;

    const creatorHTML = `
      <div style="font-family: Arial, sans-serif;">
        <h2>Status Update</h2>
        <p>${creatorMessage}</p>
        <p>
          Thank you for helping us keep the community better and safer.
          We appreciate your interaction with the portal and your contribution.
        </p>
        <p>— Community Issue Reporting Team</p>
      </div>
    `;

    // Notify creator (Email + DB)
    if (issue.usermail) {
      await sendEmail(issue.usermail, subject, creatorHTML);

      await Notification.create({
        usermail: issue.usermail,
        message: creatorMessage,
        issueId: issue._id,
        type: "status_update",
      });
    }

    // Notify liked users (Email + DB)
    if (issue.likedBy?.length > 0) {
      for (let email of issue.likedBy) {
        if (email !== issue.usermail) {
          const followerMessage = `An issue you interacted with (type: ${issueTypeFormatted}) was moved from ${oldStatus} to ${status}.`;

          const followerHTML = `
            <div style="font-family: Arial, sans-serif;">
              <h2>Issue Update</h2>
              <p>${followerMessage}</p>
              <p>Thank you for staying engaged with your community.</p>
              <p>— Community Issue Reporting Team</p>
            </div>
          `;

          await sendEmail(email, subject, followerHTML);

          await Notification.create({
            usermail: email,
            message: followerMessage,
            issueId: issue._id,
            type: "status_update",
          });
        }
      }
    }

    // ===============================================================

    return NextResponse.json(updatedIssue, { status: 200 });
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
