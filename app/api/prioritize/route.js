import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY, // store key in .env.local
});

export async function POST(req) {
  try {
    const { image, location, description, issueType } = await req.json();

    const prompt = `
You are a civic issue classifier. Classify the issue into one of these categories: Critical, Normal, Low.

Details:
- Issue Type: ${issueType}
- Description: ${description}
- Location: ${location}
- Image: ${image ? "Included" : "No image provided"}
Focus more on image and description for classification.
Return only the priority: Critical / Normal / Low.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // latest Gemini model
      contents: prompt,
    });

    // New SDK returns text as response.output[0].content[0].text or response.text
    const priority = response?.text?.trim() || "Normal";

    return NextResponse.json({ priority });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
