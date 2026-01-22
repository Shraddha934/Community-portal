import connectToDB from "../../../lib/mongoose";
import Notification from "../../../models/Notification";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ success: false, error: "Email required" });
    }

    const notifications = await Notification.find({ usermail: email }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ success: true, notifications });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
