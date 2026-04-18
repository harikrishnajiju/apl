# PitchSide Implementation Plan

## Approach

1.  **Phase 1: Foundation (Current)**
    *   Initialize a Next.js 14 project using the pinned versions from `IMPLEMENTATION_PLAN.md`.
    *   Set up Tailwind CSS and shadcn/ui.
    *   Document Firebase setup in `INSTRUCTIONS.md`.
    *   Implement Firebase Auth (Google + Email/Password).
    *   Build the onboarding flow to select favorite IPL and national teams.
    *   Create seed data (`/data/*.json`) and the seeding script (`/scripts/seed.ts`).
2.  **Phase 2: Dashboard**
    *   Create the `/dashboard` route with a team-colored gradient.
    *   Implement "Last 5 Matches", "Next Match", "Current Standings", and "Latest Activity".
3.  **Phase 3: Teams & Match Detail**
    *   Build `/teams` and `/teams/[teamId]` pages.
    *   Build `/matches/[matchId]` for detailed scorecards and Gemini-powered AI Match Summaries.
4.  **Phase 4: Forums & Posts**
    *   Build `/forums` and `/forums/[forumId]`.
    *   Implement the Reddit-style voting system and threaded comments.
5.  **Phase 5: Social**
    *   Build `/profile/[userId]` and `/friends`.
    *   Implement friend requests.
6.  **Phase 6: AI Polish**
    *   Implement Gemini for post improvement and forum welcome messages.

## File Structure

The project will follow the structure defined in `IMPLEMENTATION_PLAN.md`:
*   `/app`: Next.js App Router pages and API routes.
*   `/components`: Reusable UI components (shadcn and custom).
*   `/lib`: Firebase, Gemini, and utility functions.
*   `/data`: JSON seed data.
*   `/types`: TypeScript definitions.
*   `/scripts`: Utility scripts like `seed.ts`.

## Clarifying Questions

1.  **Firebase Credentials:** I will need placeholder or actual environment variables for Firebase configuration to test the app locally. I will generate `.env.local.example` for now.
2.  **Next.js App Router vs Pages Router:** I will be using the App Router (`/app` directory) as specified.
3.  **shadcn/ui Initialization:** I will initialize `shadcn/ui` with the default style and neutral color scheme, but we will mostly rely on custom Tailwind colors based on team selection.
