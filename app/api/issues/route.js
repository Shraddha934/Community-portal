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

    // Check if geospatial query is requested
    if (
      searchParams.get("near") === "true" &&
      searchParams.get("lat") &&
      searchParams.get("lon")
    ) {
      const lat = parseFloat(searchParams.get("lat"));
      const lon = parseFloat(searchParams.get("lon"));
      const radiusKm = parseFloat(searchParams.get("radius")) || 0.5; // default 0.5 km

      // Convert radius to meters for MongoDB
      const radiusMeters = radiusKm * 1000;

      const nearbyIssues = await Issue.find({
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

      return NextResponse.json({ success: true, issues: nearbyIssues });
    }

    // Normal fetch without geospatial
    const issues = await Issue.find(filters).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, issues });
  } catch (error) {
    console.error("❌ Error fetching issues:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
