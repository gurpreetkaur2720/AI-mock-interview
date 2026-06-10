import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import MockInterview from "@/models/MockInterview";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
 //
    const interviews = await MockInterview.find({ createdBy: email }).sort({
      createdAt: -1, // descending order me sort karenge taki latest interview pehle aaye
      _id: -1,
    });

    return NextResponse.json({ interviews }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to load interviews", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) { 
  try {
    const body = await request.json(); //yaha frontend se aayega interview creation ka data 
    const {
      mockId,
      jsonMockResp,
      jobPosition,
      jobDesc,
      jobExperience,
      createdBy,
      createdAt,
    } = body;

    
    if (!mockId || !jsonMockResp || !jobPosition || !jobDesc || !jobExperience || !createdBy) {
      return NextResponse.json(
        { message: "Missing interview payload" },  
        { status: 400 }
      ); // validation check karenge ki interview creation ke liye jo bhi data required
      //  hai wo sab frontend se aaya hai ya nahi agar koi data missing hai to error response bhejenge
    }

    await connectToDatabase(); //mongoose ke through database se connect karenge taki interview 
    // data ko database me save kar sake

    const interview = await MockInterview.create({
      mockId,
      jsonMockResp,
      jobPosition,
      jobDesc,
      jobExperience,
      createdBy,
      createdAt,
    }); // MockInterview collection me ek naya document create karenge jisme interview ka data save hoga

    return NextResponse.json({ interview }, { status: 201 }); // agar interview successfully 
    // create ho jata hai to uska data json format me frontend ko bhejenge
    
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create interview", error: error.message },
      { status: 500 } //
    ); 
  }
}
