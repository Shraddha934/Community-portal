import { NextResponse } from "next/server";
import connectToDB from "../../../lib/mongoose"; // your existing DB helper
import Corrected from "../../../models/Corrected";

function normalizeLabel(s) {
  if (!s) return "";
  return String(s).trim().toLowerCase().replace(/\s+/g, "_");
}

// strip data URL prefix if present
function extractBase64(dataUrlOrBase64) {
  if (!dataUrlOrBase64) return "";
  const s = String(dataUrlOrBase64).trim();
  if (s.startsWith("data:")) {
    const idx = s.indexOf(",");
    return idx >= 0 ? s.substring(idx + 1) : s;
  }
  return s;
}

export async function POST(req) {
  try {
    const { image, predicted, actual } = await req.json();

    if (!image || !predicted || !actual) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const predictedNorm = normalizeLabel(predicted);
    const actualNorm = normalizeLabel(actual);

    if (predictedNorm === actualNorm) {
      return NextResponse.json(
        { error: "Prediction matches actual, not saving." },
        { status: 400 }
      );
    }

    const base64 = extractBase64(image);

    await connectToDB();

    const corrected = await Corrected.create({
      image: base64,
      predicted: predictedNorm,
      actual: actualNorm,
    });

    return NextResponse.json(
      { success: true, id: corrected._id },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error saving corrected:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDB();
    const corrected = await Corrected.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ corrected }, { status: 200 });
  } catch (err) {
    console.error("Error fetching corrected issues:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
