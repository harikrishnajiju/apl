import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { draft } = await request.json();

    if (!draft) {
      return NextResponse.json({ error: "Missing draft" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a helpful writing assistant for a cricket fan forum. 
Rewrite the following post draft to make it more engaging, fix any spelling or grammar errors, and add 1-2 relevant cricket emojis. 
Do not make it overly long, just polish it. Return ONLY the polished text without quotes or preamble.

Draft: ${draft}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    return NextResponse.json({ polished: text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate improved post" }, { status: 500 });
  }
}
