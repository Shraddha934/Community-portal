import connectToDB from "../../../../../lib/mongoose";
import Notification from "../../../../../models/Notification";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    await connectToDB();

    const { id } = params;

    await Notification.findByIdAndUpdate(id, { isRead: true });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
