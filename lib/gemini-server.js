// import { GoogleGenerativeAI } from "@google/generative-ai";

// function getApiKey() { //gemini api key ko .env file se read karenge taki usko 
// // use karke ai se questions generate kar sake
//   const key = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

//   if (!key) {
//     throw new Error("Missing Gemini API key. Set GEMINI_API_KEY in your environment.");
//   }

//   return key;
// }

// function extractJsonText(rawText) {
//   if (!rawText || typeof rawText !== "string") {
//     throw new Error("Empty AI response");
//   }

//   const fenced = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
//   if (fenced?.[1]) {
//     return fenced[1].trim();
//   }

//   const startObject = rawText.indexOf("{");
//   const startArray = rawText.indexOf("[");

//   let start = -1;
//   if (startObject === -1) {
//     start = startArray;
//   } else if (startArray === -1) {
//     start = startObject;
//   } else {
//     start = Math.min(startObject, startArray);
//   }

//   if (start === -1) {
//     return rawText.trim();
//   }

//   const endObject = rawText.lastIndexOf("}");
//   const endArray = rawText.lastIndexOf("]");
//   const end = Math.max(endObject, endArray);

//   if (end < start) {
//     return rawText.slice(start).trim();
//   }

//   return rawText.slice(start, end + 1).trim();
// }

// export function parseJsonFromAiText(rawText) {
//   const jsonText = extractJsonText(rawText);
//   return JSON.parse(jsonText);
// }

// export async function generateGeminiText(prompt) { //ya pe prompt ayga 
//   const apiKey = getApiKey(); 
//   const genAI = new GoogleGenerativeAI(apiKey); 

//   const model = genAI.getGenerativeModel({
//     // model: "gemini-1.5-flash", 
//     // model: "gemini-1.5-pro",
//     model: "gemini-2.5-flash",
//     generationConfig: {
//       temperature: 0.5,
//       maxOutputTokens: 4096,
//       responseMimeType: "application/json",
//     },
//   });

//   const result = await model.generateContent(prompt); // AI se content generate karne ke
//   //  liye prompt bhejenge aur uska response receive karenge
//   return result.response.text();
// }


import { GoogleGenerativeAI } from "@google/generative-ai";

function getApiKey() {
  const key =
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!key) {
    throw new Error("Missing Gemini API key");
  }

  return key;
}

function extractJsonText(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Empty AI response");
  }

  const fenced = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const startObject = rawText.indexOf("{");
  const startArray = rawText.indexOf("[");

  let start = -1;

  if (startObject === -1) {
    start = startArray;
  } else if (startArray === -1) {
    start = startObject;
  } else {
    start = Math.min(startObject, startArray);
  }

  if (start === -1) {
    return rawText.trim();
  }

  const endObject = rawText.lastIndexOf("}");
  const endArray = rawText.lastIndexOf("]");
  const end = Math.max(endObject, endArray);

  return rawText.slice(start, end + 1).trim();
}

export function parseJsonFromAiText(rawText) {
  const jsonText = extractJsonText(rawText);
  return JSON.parse(jsonText);
}

export async function generateGeminiText(prompt) {
  const apiKey = getApiKey();

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const result = await model.generateContent(prompt);

  return result.response.text();
}