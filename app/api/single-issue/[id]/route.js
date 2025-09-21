import Issue from "../../../../models/Issues";
import connectToDB from "../../../../lib/mongoose";

export async function GET(req, { params }) {
  const { id } = params;
  await connectToDB();

  try {
    const issue = await Issue.findById(id);
    if (!issue) {
      return new Response(
        JSON.stringify({ success: false, error: "Issue not found" }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify({ success: true, issue }), {
      status: 200,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: "Server error" }),
      { status: 500 }
    );
  }
}
