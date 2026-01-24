import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await connectDB();
  const { email, password } = await req.json();

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return Response.json({ success: false, message: "Admin not found" });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return Response.json({ success: false, message: "Invalid credentials" });
  }

  return Response.json({
    success: true,
    admin: {
      id: admin._id,
      name: admin.name,
      department: admin.department,
    },
  });
}
