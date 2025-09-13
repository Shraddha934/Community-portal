import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "Latitude & Longitude required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://apis.mapmyindia.com/advancedmaps/v1/${process.env.MAPMYINDIA_KEY}/rev_geocode?lat=${lat}&lng=${lon}`,
      { cache: "no-store" }
    );

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Reverse geocode failed", details: err.message }, { status: 500 });
  }
}
