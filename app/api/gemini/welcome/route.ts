import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { forumName, forumDescription } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are the enthusiastic community manager for PitchSide, a cricket fan platform.
Generate a short, 2-3 sentence welcome message to display in a newly created forum that has no posts yet.
Encourage fans to start a discussion. Use a warm, energetic tone and cricket emojis.

Forum Name: ${forumName}
Forum Description: ${forumDescription}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    return NextResponse.json({ welcomeMessage: text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate welcome message" }, { status: 500 });
  }
}
