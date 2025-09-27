import { NextResponse } from "next/server";
import connectToDB from "../../../lib/mongoose";
import Issue from "../../../models/Issues";

// ✅ POST - create a new issue
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
      title,
    } = body;

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
      image,
      location: geoLocation,
      title: title || "Untitled Issue",
      status: status || "open",
      usermail: usermail || "unknown@example.com",
      priority: priority || "low",
      description: description || "",
      criticality: criticality || "Normal",
    });

    return NextResponse.json(
      { success: true, issue: newIssue },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating issue:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ✅ GET - fetch issues, optionally nearby
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

    const usermail = searchParams.get("usermail") || null; // current user

    let issues;

    // Check if geospatial query is requested
    if (
      searchParams.get("near") === "true" &&
      searchParams.get("lat") &&
      searchParams.get("lon")
    ) {
      const lat = parseFloat(searchParams.get("lat"));
      const lon = parseFloat(searchParams.get("lon"));
      const radiusKm = parseFloat(searchParams.get("radius")) || 0.5; // default 0.5 km
      const radiusMeters = radiusKm * 1000;

      issues = await Issue.find({
        ...filters,
        "location.coordinates": {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: [lon, lat],
            },
            $maxDistance: radiusMeters,
          },
        },
      })
        .sort({ createdAt: -1 })
        .lean();
    } else {
      issues = await Issue.find(filters).sort({ createdAt: -1 }).lean();
    }

    // Add "isLiked" info for current user
    if (usermail) {
      issues = issues.map((issue) => ({
        ...issue,
        isLiked: issue.likedBy?.includes(usermail),
      }));
    }

    return NextResponse.json({ success: true, issues });
  } catch (error) {
    console.error("❌ Error fetching issues:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ✅ PATCH - toggle like/unlike
export async function PATCH(req) {
  try {
    await connectToDB();
    const body = await req.json();
    const { issueId, usermail, commentText } = body;

    if (!issueId) {
      return NextResponse.json(
        { success: false, error: "Missing issueId" },
        { status: 400 }
      );
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return NextResponse.json(
        { success: false, error: "Issue not found" },
        { status: 404 }
      );
    }

    // 🔹 Handle like toggle
    if (usermail && !commentText) {
      let likedBy = issue.likedBy || [];
      if (likedBy.includes(usermail)) {
        // Unlike
        issue.likedBy = likedBy.filter((email) => email !== usermail);
        issue.likesCount = Math.max(0, issue.likesCount - 1);
      } else {
        // Like
        likedBy.push(usermail);
        issue.likedBy = likedBy;
        issue.likesCount = (issue.likesCount || 0) + 1;
      }
    }

    // 🔹 Handle adding comment
    if (commentText && usermail) {
      issue.comments = issue.comments || [];
      issue.comments.push({
        usermail,
        text: commentText,
        createdAt: new Date(),
      });
    }

    await issue.save();

    await User.updateOne(
      { email: req.body.usermail },
      { $inc: { points: 3 } } // +3 points per issue
    );

    return NextResponse.json({
      success: true,
      issueId,
      likesCount: issue.likesCount,
      comments: issue.comments,
    });
  } catch (error) {
    console.error("❌ Error updating issue:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
