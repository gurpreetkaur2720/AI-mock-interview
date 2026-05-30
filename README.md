
# AI Mock Interview — Short Summary

Purpose: lightweight explanation for viva — how the app works in simple terms.

1) User flow (brief):
  - Open site → Sign up / Sign in → Dashboard → Start interview → Answer questions → Receive AI feedback.

2) Core parts:
  - Frontend: Next.js pages and components under [app/](app/).
  - Backend: API routes in [app/api/](app/api/) handle requests and call helpers.
  - Database: MongoDB via [lib/mongoose.js](lib/mongoose.js#L1) and models (`User`, `MockInterview`, `UserAnswer`).
  - AI: [lib/gemini-server.js](lib/gemini-server.js#L1) generates questions and evaluates answers.

3) One request example (simple):
  - "Start interview" → API [app/api/interviews/route.js](app/api/interviews/route.js#L1) → AI helper → return questions → frontend shows them.

4) How to run locally:
```bash
npm install
npm run dev
```

5) Viva talking points (1-minute each):
  - Describe user story and main UI screens.
  - Explain where AI is called and which model/file handles it.
  - Mention data models and where answers/feedback are stored.

Need a 30-second demo script or a single-slide summary? I can make one now.


