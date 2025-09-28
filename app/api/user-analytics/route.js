import { NextResponse } from "next/server";
import connectToDB from "../../../lib/mongoose";
import Issue from "../../../models/Issues";

export async function POST(req) {
  try {
    await connectToDB();

    const { latitude, longitude, radiusKm } = await req.json();

    if (!latitude || !longitude || !radiusKm) {
      return NextResponse.json(
        { error: "latitude, longitude, and radiusKm are required" },
        { status: 400 }
      );
    }

    const radiusMeters = radiusKm * 1000;

    // Fetch all issues within radius
    const issues = await Issue.find({
      "location.coordinates": {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], radiusMeters / 6378137],
        },
      },
    });

    const issueTypes = [...new Set(issues.map((i) => i.issueType))];

    const avgTimePerType = {};
    const issueCounts = {};

    issueTypes.forEach((type) => {
      const filtered = issues.filter((i) => i.issueType === type);
      const resolved = filtered.filter((i) => i.closedOn);

      // Average resolution time (hrs)
      const totalMs = resolved.reduce(
        (sum, issue) => sum + (issue.closedOn - issue.createdAt),
        0
      );
      avgTimePerType[type] = resolved.length
        ? totalMs / resolved.length / (1000 * 60 * 60)
        : 0;

      // Count of issues (for pie chart)
      issueCounts[type] = filtered.length;
    });

    return NextResponse.json({
      success: true,
      analytics: avgTimePerType,
      issueCounts: issueCounts,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
