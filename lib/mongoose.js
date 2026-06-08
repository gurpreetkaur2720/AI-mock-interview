import mongoose from "mongoose";

const globalForMongoose = globalThis;

const cached = globalForMongoose._mongoose || {
  conn: null,
  promise: null,
};

export async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI; // .env file se MongoDB URL le rahe hain

  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI environment variable"); 
  } // agar MongoDB URL nahi mila to error throw karenge

  if (cached.conn) {
    return cached.conn;
  } // agar connection pehle se hi establish ho chuka hai to usi connection ko return karenge jo cache mein h
 

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  } // agar promise pehle se nahi hai to naya connection establish karenge aur usko cache karenge

  cached.conn = await cached.promise;
  globalForMongoose._mongoose = cached;

  return cached.conn;
}
