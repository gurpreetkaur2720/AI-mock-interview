import { NextResponse } from "next/server";
import { generateGeminiText, parseJsonFromAiText } from "@/lib/gemini-server";
 
// This route takes a question and user answer and sends it to Gemini for evaluation
export async function POST(request) {
  try {
    const { question, userAnswer } = await request.json();

    if (!question || !userAnswer) {
      return NextResponse.json(
        { message: "question and userAnswer are required" },
        { status: 400 }
      );
    }

    const prompt = [ //
      "You are an interview evaluator.", //porompt bnega aur gemini ko jayega taki wo user ke answer ko evaluate kar sake
      `Question: ${question}`,
      `Candidate answer: ${userAnswer}`,
      "Return ONLY valid JSON with this shape:",
      '{"rating":7,"feedback":"..."}',
      "rating must be a number between 1 and 10."
    ].join("\n");

    const text = await generateGeminiText(prompt); // prompt ja raha h gemini-server aur feedback ayegi text format me
    const parsed = parseJsonFromAiText(text); // text feedback ko json format me parse karenge

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

    return NextResponse.json( //frontend ko response bhejenge rating, feedback
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
