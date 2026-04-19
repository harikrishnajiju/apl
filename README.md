# PitchSide 🏏

PitchSide is an interactive, real-time social platform built exclusively for cricket fans. Designed with a focus on the Indian Premier League (IPL) and International Cricket, PitchSide allows users to connect with fellow fans, simulate live matches, and participate in vibrant, Reddit-style community forums. 

The application was built from the ground up to showcase a modern, serverless architecture deployed on Google Cloud Run.

---

## 🌟 Live Demo
**Service URL:** [https://pitchside-924393332999.asia-south1.run.app](https://pitchside-924393332999.asia-south1.run.app)

*(Note: If you are logging in via Google for the first time, make sure the domain is authorized in the Firebase Console).*

---

## 🛠️ Technology Stack

PitchSide leverages a modern, robust, and highly scalable tech stack:

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Customized for dark-mode and team-specific theming)
- **Icons**: Lucide React

### Backend & Database (Serverless)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore) (NoSQL)
- **Authentication**: Firebase Auth (Email/Password & Google Sign-In)
- **Data Integrity**: Firestore Transactions (Used heavily for secure upvoting/downvoting and bidirectional friend requests)

### Artificial Intelligence
- **AI Integration**: [Google Gemini 2.0 Flash](https://aistudio.google.com/)
- **Features**: Generates post improvements ("Magic Wand"), dynamic AI-written match summaries, and enthusiastic forum welcome messages.

### Deployment & DevOps
- **Hosting**: [Google Cloud Run](https://cloud.google.com/run) (Serverless Containers)
- **Containerization**: Multi-stage Docker build optimized for Next.js standalone mode.
- **CI/CD**: Google Cloud Build

---

## ✨ Key Features

1. **Dynamic Theming**: The dashboard and UI elements dynamically adapt their colors based on the user's favorite IPL team (e.g., Yellow for CSK, Red for RCB).
2. **Reddit-Style Forums**: Users can create posts, upvote/downvote content, and engage in deeply nested comment threads.
3. **Live Match Simulation**: A client-side simulator that mocks real-time ball-by-ball updates, complete with dynamically generated scorecards.
4. **Social Graph**: A robust user-search and bidirectional friend request system powered by atomic Firestore batch writes.
5. **AI "Magic Wand"**: Integrated Gemini AI allows users to instantly polish their forum drafts with better grammar and relevant emojis before posting.

---

## 🚀 How to Run Locally

If you want to run PitchSide on your local machine, follow these steps:

### 1. Clone the Repository
```bash
git clone <repository-url>
cd apl
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add your Firebase and Gemini credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
GEMINI_API_KEY="your-gemini-key"
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ How to Deploy

PitchSide is configured to be deployed as a Docker container on Google Cloud Run. 

**1. Build the image via Cloud Build:**
```bash
gcloud builds submit --tag asia-south1-docker.pkg.dev/your-project-id/cloud-run-source-deploy/pitchside .
```

**2. Deploy to Cloud Run:**
```bash
gcloud run deploy pitchside \
  --image asia-south1-docker.pkg.dev/your-project-id/cloud-run-source-deploy/pitchside \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="your-gemini-key"
```

*(Note: The Next.js Dockerfile is optimized for `standalone` output and will automatically inject your `.env.local` variables during the build process).*

---

*Built with ❤️ for cricket fans everywhere.*
