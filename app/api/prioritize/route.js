import { NextResponse } from "next/server";
import { getPriorityFromGemini } from "@/lib/priorityAI";

export async function POST(req) {
  try {
    const body = await req.json();
    const priority = await getPriorityFromGemini(body);

    return NextResponse.json({ priority });
  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
