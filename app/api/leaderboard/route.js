import User from "../../../models/User";
import dbConnect from "@/lib/dbConnect";

export async function GET() {
  await dbConnect();

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const topUsers = await User.find({ updatedAt: { $gte: startOfMonth } })
    .sort({ points: -1 })
    .limit(5)
    .select("name email points");

  return Response.json(topUsers);
}
