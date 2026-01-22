import connectToDB from "../../../../lib/mongoose";
import Notification from "../../../../models/Notification";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ count: 0 });
    }

    const count = await Notification.countDocuments({
      usermail: email,
      isRead: false,
    });

    return NextResponse.json({ count });
  } catch (err) {
    return NextResponse.json({ count: 0 });
  }
}
