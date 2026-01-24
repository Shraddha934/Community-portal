import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectToDB from "../../../lib/mongoose";
import User from "../../../models/User";

const ADMIN_EMAIL = [
  "shraddhaghuleshraddha@gmail.com",
  "paurasmore22@gmail.com",
];

// 👇 NEW: department head email mapping
const DEPARTMENT_EMAIL_MAP = {
  "shraddhapauras@gmail.com": "DEPT_WATER",
  "eranest226@gmail.com": "DEPT_PWD", 
  "envdept@gmail.com": "DEPT_ENV",
};

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const { name, email } = await req.json();

    let role = "user";
    let department = null;

    // 👑 Admin seeding (unchanged)
    if (ADMIN_EMAIL.includes(email)) {
      role = "admin";
    }

    // 🏢 Department seeding (NEW)
    else if (DEPARTMENT_EMAIL_MAP[email]) {
      role = "department";
      department = DEPARTMENT_EMAIL_MAP[email];
    }

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { name, email, role, department },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error("User route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
