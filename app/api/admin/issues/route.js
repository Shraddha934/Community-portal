import { connectDB } from "@/lib/db";
import Issue from "@/models/Issue";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  await connectDB();

  const user = await currentUser();
  if (!user) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  if (user.publicMetadata.role !== "department_admin") {
    return Response.json(
      { success: false, message: "Access denied" },
      { status: 403 },
    );
  }

  const department = user.publicMetadata.department;

  const issues = await Issue.find({ department }).sort({ createdAt: -1 });

  return Response.json({ success: true, issues });
}
