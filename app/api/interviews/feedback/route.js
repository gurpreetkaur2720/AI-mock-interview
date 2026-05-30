import { NextResponse } from "next/server";
import { generateGeminiText, parseJsonFromAiText } from "@/lib/gemini-server";

export async function POST(request) {
  try {
    const { question, userAnswer } = await request.json();

    if (!question || !userAnswer) {
      return NextResponse.json(
        { message: "question and userAnswer are required" },
        { status: 400 }
      );
    }

    const prompt = [
      "You are an interview evaluator.",
      `Question: ${question}`,
      `Candidate answer: ${userAnswer}`,
      "Return ONLY valid JSON with this shape:",
      '{"rating":7,"feedback":"..."}',
      "rating must be a number between 1 and 10."
    ].join("\n");

    const text = await generateGeminiText(prompt);
    const parsed = parseJsonFromAiText(text);

    const numericRating = Number(parsed?.rating);
    const safeRating = Number.isFinite(numericRating)
      ? Math.min(10, Math.max(1, numericRating))
      : 1;

    const feedback = String(parsed?.feedback || "").trim();

    if (!feedback) {
      return NextResponse.json(
        { message: "AI returned invalid feedback format" },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { rating: safeRating, feedback },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to generate feedback", error: error.message },
      { status: 500 }
    );
  }
}
