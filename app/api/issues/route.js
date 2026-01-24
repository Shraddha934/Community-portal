import { NextResponse } from "next/server";
import connectToDB from "../../../lib/mongoose";
import Issue from "../../../models/Issues";
import User from "../../../models/User";
import { getPriorityFromGemini } from "../../../lib/priorityAI";
import { ISSUE_DEPARTMENT_MAP } from "../../../lib/departmentMap";

/* ================= POST ================= */
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
      description,
      criticality,
      title,
    } = body;

    const department = ISSUE_DEPARTMENT_MAP[issueType];
    if (!department) {
      return NextResponse.json(
        { success: false, error: "Invalid issue type" },
        { status: 400 },
      );
    }

    const geoLocation = {
      type: "Point",
      coordinates: [Number(location.longitude), Number(location.latitude)],
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
      landmark: location.landmark || "",
      fullAddress: location.fullAddress || "",
    };

    const newIssue = await Issue.create({
      issueType,
      department, // ✅ FIXED
      image,
      location: geoLocation,
      title: title || "Untitled Issue",
      status: status || "open",
      usermail: usermail,
      priority: "pending",
      description: description || "",
      criticality: criticality || "Normal",
    });

    const finalPriority = await getPriorityFromGemini({
      image,
      location,
      description,
      issueType,
    });

    newIssue.priority = finalPriority;
    await newIssue.save();

    if (usermail) {
      await User.updateOne(
        { email: usermail },
        { $inc: { points: 3 } },
        { upsert: true },
      );
    }

    return NextResponse.json(
      { success: true, issue: newIssue },
      { status: 201 },
    );
  } catch (error) {
    console.error("❌ POST issue error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

/* ================= GET ================= */
export async function GET(req) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);

    const filters = {};
    if (searchParams.get("status")) filters.status = searchParams.get("status");
    if (searchParams.get("issueType"))
      filters.issueType = searchParams.get("issueType");
    if (searchParams.get("priority"))
      filters.priority = searchParams.get("priority");

    const usermail = searchParams.get("usermail");
    if (!usermail) {
      return NextResponse.json(
        { success: false, error: "usermail required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: usermail });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    let issues;

    // 👑 ADMIN → ALL
    if (user.role === "admin") {
      issues = await Issue.find(filters)
        .sort({ createdAt: -1 })
        .lean();
    }

    // 🏢 DEPARTMENT → ONLY DEPARTMENT ISSUES
    else if (user.role === "department" && user.department) {
      issues = await Issue.find({
        ...filters,
        department: user.department,
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    // 👤 NORMAL USER → OWN ISSUES
    else {
      issues = await Issue.find({
        ...filters,
        usermail,
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    issues = issues.map((issue) => ({
      ...issue,
      isLiked: issue.likedBy?.includes(usermail),
    }));

    return NextResponse.json({ success: true, issues });
  } catch (error) {
    console.error("❌ GET issue error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


/* ================= PATCH ================= */
export async function PATCH(req) {
  try {
    await connectToDB();
    const body = await req.json();
    const { issueId, usermail, commentText } = body;

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return NextResponse.json(
        { success: false, error: "Issue not found" },
        { status: 404 },
      );
    }

    if (usermail && !commentText) {
      if (issue.likedBy.includes(usermail)) {
        issue.likedBy = issue.likedBy.filter((e) => e !== usermail);
        issue.likesCount--;
      } else {
        issue.likedBy.push(usermail);
        issue.likesCount++;
      }
    }

    if (commentText && usermail) {
      issue.comments.push({
        usermail,
        text: commentText,
        createdAt: new Date(),
      });
    }

    await issue.save();

    return NextResponse.json({
      success: true,
      likesCount: issue.likesCount,
      comments: issue.comments,
    });
  } catch (error) {
    console.error("❌ PATCH issue error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
