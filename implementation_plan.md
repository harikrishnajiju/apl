# PitchSide — Complete Implementation Plan for Antigravity

> A fan social platform for IPL cricket, built with Next.js + Firebase + Cloud Run + Gemini

---

## Table of Contents
1. [Project Mission](#project-mission)
2. [Tech Stack (Non-Negotiable)](#tech-stack-non-negotiable)
3. [Pinned Package Versions](#pinned-package-versions)
4. [Project Structure](#project-structure)
5. [Data Model (Firestore Collections)](#data-model-firestore-collections)
6. [Core Features — Phased Build Order](#core-features--phased-build-order)
7. [UI/UX Requirements](#uiux-requirements)
8. [Live Match Simulation](#live-match-simulation)
9. [Gemini Integration Details](#gemini-integration-details)
10. [Deployment to Cloud Run](#deployment-to-cloud-run)
11. [Seed Data Requirements](#seed-data-requirements)
12. [Code Quality Rules](#code-quality-rules)
13. [Execution Instructions for Antigravity](#execution-instructions-for-antigravity)
14. [Pre-Build Checklist](#pre-build-checklist-do-this-before-prompting)

---

## Project Mission

Build a minimalist social platform where IPL fans connect around shared team loyalties and live/recent match moments. Think Reddit's interaction model + ESPN's match context + a personalized team-colored dashboard.

**Project name:** PitchSide

---

## Tech Stack (Non-Negotiable)

Use exactly this stack — do not substitute:

- **Framework:** Next.js 14.2.x with App Router, TypeScript, React 18
- **Styling:** Tailwind CSS 3.4.x + shadcn/ui components (use `npx shadcn@latest add ...`)
- **Database:** Firebase Firestore (use `firebase-admin` on server, `firebase` JS SDK on client)
- **Auth:** Firebase Authentication (Google provider + Email/Password)
- **AI:** Google Gemini API (`gemini-2.0-flash`) via `@google/generative-ai` package, key from AI Studio
- **Hosting:** Google Cloud Run (containerized via Dockerfile)
- **Icons:** `lucide-react`
- **State:** React Server Components + minimal client state with Zustand only where needed
- **Forms:** `react-hook-form` + `zod`

**DO NOT add:** Redux, tRPC, Prisma, GraphQL, Supabase, Auth.js/NextAuth, Drizzle, Vercel-specific APIs, or any experimental Next.js features. Use stable, boring, well-documented packages.

---

## Pinned Package Versions

Use these exact versions in `package.json`:

```json
{
  "dependencies": {
    "next": "14.2.15",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "firebase": "10.14.1",
    "firebase-admin": "12.6.0",
    "@google/generative-ai": "0.21.0",
    "zod": "3.23.8",
    "react-hook-form": "7.53.0",
    "@hookform/resolvers": "3.9.0",
    "zustand": "5.0.0",
    "lucide-react": "0.451.0",
    "clsx": "2.1.1",
    "tailwind-merge": "2.5.4",
    "class-variance-authority": "0.7.0"
  },
  "devDependencies": {
    "typescript": "5.6.2",
    "tailwindcss": "3.4.13",
    "postcss": "8.4.47",
    "autoprefixer": "10.4.20",
    "@types/node": "22.7.4",
    "@types/react": "18.3.11",
    "@types/react-dom": "18.3.0",
    "tsx": "4.19.1"
  }
}
```

---

## Project Structure

```
/app
  /(auth)
    /login/page.tsx
    /signup/page.tsx
    /onboarding/page.tsx
  /(app)
    /dashboard/page.tsx
    /teams/page.tsx
    /teams/[teamId]/page.tsx
    /forums/page.tsx
    /forums/[forumId]/page.tsx
    /forums/create/page.tsx
    /posts/[postId]/page.tsx
    /posts/create/page.tsx
    /matches/[matchId]/page.tsx
    /profile/[userId]/page.tsx
    /friends/page.tsx
  /api
    /votes/route.ts
    /posts/route.ts
    /comments/route.ts
    /friends/route.ts
    /gemini/summary/route.ts
    /gemini/improve/route.ts
  /layout.tsx
  /page.tsx (landing)

/components
  /ui (shadcn components)
  /match
    MatchCard.tsx
    LiveScoreTicker.tsx
    Scorecard.tsx
  /post
    PostCard.tsx
    VoteButtons.tsx
    CommentThread.tsx
  /team
    TeamBadge.tsx
    TeamCard.tsx
  /dashboard
    NextMatchWidget.tsx
    StandingsTable.tsx
    RecentActivity.tsx

/lib
  /firebase
    client.ts
    admin.ts
  gemini.ts
  liveSimulator.ts
  utils.ts

/data
  teams.json
  players.json
  matches.json

/types
  index.ts

/scripts
  seed.ts

/public
  /logos (team logos)

Dockerfile
.dockerignore
next.config.js
tailwind.config.ts
DEPLOY.md
INSTRUCTIONS.md
DEMO_SCRIPT.md
PLAN.md
```

---

## Data Model (Firestore Collections)

### `users/{uid}`
```typescript
{
  displayName: string;
  email: string;
  photoURL: string | null;
  favoriteIplTeam: string;        // e.g. "CSK"
  favoriteNationalTeam: string;   // e.g. "IND"
  badge: {
    letters: string;              // 3-letter team code
    color: string;                // hex
  };
  bio: string;
  joinedAt: Timestamp;
  friends: string[];              // array of uids
}
```

### `teams/{teamId}` — SEEDED, not user-editable
```typescript
{
  name: string;
  shortCode: string;              // "CSK"
  primaryColor: string;           // hex
  secondaryColor: string;         // hex
  logo: string;                   // URL or path
  homeGround: string;
  captain: string;
  coach: string;
  founded: number;
  titles: number;
  currentSeasonRank: number;
}
```

### `forums/{forumId}`
```typescript
{
  name: string;
  description: string;
  teamId: string | null;          // null for general forums
  createdBy: string;              // uid
  createdAt: Timestamp;
  memberCount: number;
}
```

### `posts/{postId}`
```typescript
{
  forumId: string;
  authorId: string;
  authorName: string;
  authorBadge: { letters: string; color: string };
  title: string;
  body: string;
  createdAt: Timestamp;
  upvotes: number;
  downvotes: number;
  score: number;                  // upvotes - downvotes
  matchId: string | null;         // optional link to match
  commentCount: number;
}
```

### `posts/{postId}/comments/{commentId}`
```typescript
{
  authorId: string;
  authorName: string;
  body: string;
  createdAt: Timestamp;
  upvotes: number;
  downvotes: number;
  score: number;
  parentCommentId: string | null; // for threading, max 3 levels
}
```

### `posts/{postId}/votes/{userId}`
```typescript
{
  value: 1 | -1;
}
```

### `friendRequests/{requestId}`
```typescript
{
  fromUid: string;
  toUid: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Timestamp;
}
```

### `matches/{matchId}` — SEEDED
```typescript
{
  teamA: string;                  // shortCode
  teamB: string;
  date: Timestamp;
  venue: string;
  status: "upcoming" | "live" | "completed";
  result: string | null;          // "CSK won by 6 wickets"
  scoreA: { runs: number; wickets: number; overs: number } | null;
  scoreB: { runs: number; wickets: number; overs: number } | null;
  innings: Array<{
    team: string;
    runs: number;
    wickets: number;
    overs: number;
    topScorers: Array<{ name: string; runs: number; balls: number; sr: number }>;
    topBowlers: Array<{ name: string; overs: number; runs: number; wickets: number; econ: number }>;
  }>;
  playerOfMatch: string | null;
  highlightsSearchQuery: string;  // "SRH vs KKR IPL 2024 highlights"
}
```

---

## Core Features — Phased Build Order

Build in this exact order. Confirm each phase works before moving on.

### Phase 1: Foundation
1. Next.js project with TypeScript, Tailwind, shadcn/ui initialized
2. Firebase project setup — produce a separate `INSTRUCTIONS.md` with CLI commands and console steps
3. Firebase Auth with Google sign-in + email/password
4. Onboarding flow: after signup, force user to pick favorite IPL team and national team — auto-generate badge from team's short code + primary color
5. Seed Firestore with teams, matches, players from `/data/*.json` via `/scripts/seed.ts`

### Phase 2: Dashboard
6. `/dashboard` route — server component
   - Header with user badge
   - **Background uses favorite team's primary color as a subtle gradient (10% opacity overlay)**
   - Sections:
     - "Your Team's Last 5 Matches" (cards)
     - "Next Match" (countdown)
     - "Current IPL Standings" (table, user's team highlighted)
     - "Latest Activity in Your Forums" (last 5 posts from forums user is in)
7. Each match card is clickable → `/matches/[matchId]`

### Phase 3: Teams & Match Detail
8. `/teams` page — grid of all 10 IPL team cards (color-coded)
9. `/teams/[teamId]` — team info, captain, coach, current rank, last 5 matches, full squad
10. `/matches/[matchId]` — full scorecard
    - Both innings: total, RR, top 3 batters with runs/balls/SR, top 3 bowlers with overs/runs/wickets/economy
    - Player of the Match
    - **"Watch Highlights" button → opens new tab to:**
      ```
      https://www.youtube.com/results?search_query=${encodeURIComponent(highlightsSearchQuery)}
      ```
    - **AI Match Summary section:** server-side call to Gemini with match data → returns a 3-sentence punchy summary. Cache in Firestore after first generation.

### Phase 4: Forums & Posts (the social core)
11. `/forums` — list of all forums, "Create Forum" button (any user can create)
12. `/forums/[forumId]` — feed of posts, sorted by score (default) or recent. "Create Post" button.
13. Posts can optionally tag a match (dropdown of recent/live matches)
14. `/posts/[postId]` — full post + threaded comments
15. **Voting system (Reddit-style):**
    - Up/down arrows next to post and each comment
    - Click upvote when already upvoted = removes vote
    - Click downvote when upvoted = switches to downvote
    - Score = upvotes - downvotes, displayed prominently
    - Use Firestore transactions to update `post.upvotes/downvotes/score` AND write to `votes` subcollection atomically
    - Optimistic UI updates on click
16. Comments: nested up to 3 levels deep, collapsible threads

### Phase 5: Social
17. `/profile/[userId]` — public profile, badge, favorite teams, recent posts
18. `/friends` — friends list + pending requests + search users by displayName
19. Friend request flow: send → recipient sees in `/friends` → accept/reject

### Phase 6: AI Polish (Gemini integration)
20. **AI Match Summaries** (already in Phase 3) — `gemini-2.0-flash`, prompt with match JSON, request 3-sentence summary in fan-friendly language
21. **Post composition assist** — "Improve my post" button on create-post form, sends draft to Gemini for grammar + tone polish (returns suggestion, user accepts/rejects)
22. **Forum welcome message** — when a forum is created, Gemini generates a welcome post

---

## UI/UX Requirements

### Design language
- Minimalist, lots of whitespace, no gradients except subtle team-color washes on dashboard
- Typography: Inter font (Next.js default), bold headings, comfortable line-height
- Team colors used as **ACCENTS** (badges, borders, hover states), never as overwhelming backgrounds
- Dark mode by default, light mode toggle in header
- Mobile-first responsive

### Team Color Palette (hardcode in `/data/teams.json`)

| Team | Short | Primary | Secondary |
|------|-------|---------|-----------|
| Chennai Super Kings | CSK | `#FFFF00` (yellow) | `#1E4A8B` (blue) |
| Mumbai Indians | MI | `#004BA0` (blue) | `#D1AB3E` (gold) |
| Royal Challengers Bengaluru | RCB | `#EC1C24` (red) | `#000000` (black) |
| Kolkata Knight Riders | KKR | `#3A225D` (purple) | `#B3A123` (gold) |
| Delhi Capitals | DC | `#17449B` (blue) | `#EF1C25` (red) |
| Sunrisers Hyderabad | SRH | `#FB643E` (orange) | `#000000` (black) |
| Rajasthan Royals | RR | `#EA1A85` (pink) | `#254AA5` (blue) |
| Punjab Kings | PBKS | `#DD1F2D` (red) | `#A6A6A6` (silver) |
| Lucknow Super Giants | LSG | `#A4DDED` (cyan) | `#FF6B00` (orange) |
| Gujarat Titans | GT | `#1B2133` (navy) | `#B8860B` (gold) |

### Component patterns
- **TeamBadge** component: 3 letters in a colored pill (use team primary color, contrast text)
- **MatchCard** component: two team badges, score, status pill (LIVE = pulsing red dot)
- **VoteButtons** component: reusable for posts and comments
- **PostCard** component: title, snippet, author badge, vote count, comment count, time ago

---

## Live Match Simulation

**IMPORTANT — read carefully.** There is no free real-time IPL API. We will simulate live data:

- Add a "live" match in `/data/matches.json` (status: `"live"`)
- Create `/lib/liveSimulator.ts` — a client-side hook `useLiveMatch(matchId)` that:
  - Fetches the match, checks if `status === "live"`
  - If live, every 15 seconds:
    - Increments runs (1-6 random)
    - Occasionally adds a wicket (5% chance)
    - Updates over count
  - Stores progression in `sessionStorage` so it doesn't reset on navigation
  - When match "completes" (after ~20 simulated overs), updates Firestore status to `"completed"`
- This gives the demo a "live" feel without external APIs
- In the UI, live matches show a pulsing "LIVE" badge and auto-updating score

---

## Gemini Integration Details

- Get API key from https://aistudio.google.com/app/apikey (FREE tier)
- Store in env var: `GEMINI_API_KEY`
- **Server-side only** — never expose to client
- Use `@google/generative-ai` package
- Model: `"gemini-2.0-flash"` (fast and free-tier friendly)
- Wrap all calls in `try/catch` with fallback to a static message
- Rate limit at app level: max 5 Gemini calls per user per hour (track in Firestore)

### Example prompt for match summary
```
You are a passionate IPL commentator. Summarize this match in exactly 3 sentences,
capturing the drama and key moments. Be punchy and fan-friendly.

Match data: {JSON}
```

### Example prompt for post improvement
```
You are an editor helping an IPL fan improve their forum post. Keep their voice
and opinion intact, but fix grammar, improve clarity, and make it punchier.
Return ONLY the improved post text, no preamble.

Original post: {text}
```

---

## Deployment to Cloud Run

Generate a complete, working setup:

1. **Multi-stage Dockerfile** for Next.js standalone output
2. `.dockerignore`
3. `next.config.js` with `output: 'standalone'`
4. `cloudbuild.yaml` for Cloud Build → Cloud Run pipeline
5. **Detailed `DEPLOY.md`** with these exact steps:

```bash
# Auth & project setup
gcloud auth login
gcloud config set project PROJECT_ID

# Enable APIs
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  firestore.googleapis.com \
  firebase.googleapis.com

# Firestore database (Native mode, asia-south1 for India low latency)
gcloud firestore databases create --location=asia-south1

# Service account creation for Cloud Run with Firestore + Firebase Auth roles
# (full commands in DEPLOY.md)

# Deploy
gcloud run deploy pitchside \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=xxx,NEXT_PUBLIC_FIREBASE_API_KEY=xxx,..."
```

### Required Environment Variables

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY
GEMINI_API_KEY
```

---

## Seed Data Requirements

Create realistic seed files:

- **`/data/teams.json`** — all 10 IPL teams with full info (use the color palette table above)
- **`/data/players.json`** — top 5 players per team — name, role, batting/bowling stats
- **`/data/matches.json`** — 15 matches:
  - 10 completed across last 2 weeks
  - 1 currently `live`
  - 4 upcoming in next 7 days
  - Use real IPL 2024 data where possible

Create **`/scripts/seed.ts`** that reads these JSONs and populates Firestore. Run with:
```bash
npx tsx scripts/seed.ts
```

---

## Code Quality Rules

- **Strict TypeScript** (no `any` unless commented why)
- **Server Components by default**, `"use client"` only when needed (forms, vote buttons, live updates)
- Every API route validates input with **zod**
- Firestore queries always filter by **indexed fields**
- **Error boundaries** at route level
- **Loading states** (`loading.tsx`) for every async route
- **No `console.log`s** in production code
- All Firestore writes that touch multiple documents use **transactions** or **batched writes**

---

## Execution Instructions for Antigravity

Follow this workflow exactly:

1. **First**, create a `PLAN.md` outlining your approach, file structure, and any clarifying questions
2. **Then**, scaffold Phase 1 completely and confirm it runs locally
3. **Then**, work through Phases 2–6 in order, committing after each phase
4. After each phase, summarize what works and what's left
5. At the end, produce a **`DEMO_SCRIPT.md`** walking through a 3-minute demo flow for judges

**Start with Phase 1.** Ask clarifying questions only if truly blocking — otherwise make reasonable choices and note them in `PLAN.md`.

---

## Pre-Build Checklist (do this BEFORE prompting)

Before pasting this plan into Antigravity, complete these three steps:

1. **Get your Gemini API key**: https://aistudio.google.com/app/apikey (30 seconds, free)
2. **Create the Firebase project** at https://console.firebase.google.com:
   - Enable **Authentication** (Google + Email/Password providers)
   - Enable **Firestore** (Native mode, region `asia-south1`)
   - Download the **service account JSON** for admin SDK
3. **Have your demo narrative ready:**
   > "User signs up → picks RCB → sees RCB-themed dashboard → opens last night's RCB match → reads AI summary → jumps to RCB forum → upvotes a hot take → adds a friend."
   >
   > Build for THAT flow first.

---

## Demo Day Tips

- **Open with the dashboard** — it's the most visually striking screen
- **Show the live match ticker** — judges love motion
- **Highlight one Gemini-powered feature** (the match summary is the easiest win)
- **Have a backup video** of the working app in case Wi-Fi fails
- **Mention what's mocked** (live data) — honesty wins; pretending real-time scrape works will get you caught
- **End with the deploy URL working live on Cloud Run** — the "it actually ships" moment

---

*Built for a Google Cloud / AI Studio / Antigravity hackathon. Good luck.* 🏏