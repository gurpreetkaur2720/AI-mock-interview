import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import UserAnswer from '@/models/UserAnswer';

export async function POST(request) {
    try {
        const { userEmail } = await request.json(); //request se userEmail nikal 
        // rahe hain jo frontend se aayega   read email

        if (!userEmail) {      // agar userEmail nahi mila to error response bhejenge
            return NextResponse.json({ message: 'User email is required' }, { status: 400 });
        }

        await connectToDatabase();  //  database se connect karenge mangoose ke through 
        // taki data fetch kar sake model se 

        const userAnswers = await UserAnswer.find({ userEmail }).sort({ //mongo db collection model
        //  UserAnswer me se userEmail ke basis pe data nikal rahe hain
            createdAt: -1, //descending order me sort karenge taki latest interview pehle aaye
            _id: -1, 
        }); // UserAnswer Collection me jitne bhi records hain jinme 
        // userEmail =gurpreet@gmail.com un sabko nikaalo

        return NextResponse.json({ 
            userAnswers: userAnswers.length > 0 ? userAnswers : [] 
        }, { status: 200 }); // agar data mila to usko json format me bhejenge frontend ko

    } catch(err) {
        console.error('Fetch error:', err);
        return NextResponse.json({ 
            message: 'Internal server error', 
            error: err.message 
        }, { status: 500 });
    }
}