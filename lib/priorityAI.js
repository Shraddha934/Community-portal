import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function getPriorityFromGemini({
  image,
  location,
  description,
  issueType,
}) {
  const prompt = `
You are a civic issue classifier. Classify the issue into one of these categories: Critical, Normal, Low.

Details:
- Issue Type: ${issueType}
- Description: ${description}
- Location: ${JSON.stringify(location)}
- Image: ${image ? "Included" : "No image provided"}

Return only one word: Critical / Normal / Low.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response?.text?.trim()?.toLowerCase() || "normal";
}
