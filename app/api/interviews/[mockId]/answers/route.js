//record answer section ke liye route jo user ke answers ko save karega

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import UserAnswer from "@/models/UserAnswer";

// This route handles fetching and saving user answers for a specific mock interview
export async function GET(_request, { params }) {
  try {
    await connectToDatabase();

    const answers = await UserAnswer.find({ mockIdRef: params.mockId }).sort({
      createdAt: 1,
      _id: 1,
    });

    return NextResponse.json({ answers }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to load feedback", error: error.message },
      { status: 500 }
    );
  }
}

// -------------------This route saves a user's answer for a specific mock interview
export async function POST(request, { params }) {
  try {
    const body = await request.json();

    if (!body.userEmail) {
      return NextResponse.json(
        { message: "User email is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const answer = await UserAnswer.create({
      ...body,
      mockIdRef: params.mockId,
    });

    return NextResponse.json({ answer }, { status: 201 }); //success response
    
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to save answer", error: error.message },
      { status: 500 }
    );
  }
}
