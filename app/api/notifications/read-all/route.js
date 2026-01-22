import connectToDB from "../../../../lib/mongoose";
import Notification from "../../../../models/Notification";
import { NextResponse } from "next/server";

export async function PATCH(req) {
  try {
    await connectToDB();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email required" });
    }

    await Notification.updateMany(
      { usermail: email, isRead: false },
      { isRead: true },
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
