import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { readFileSync } from 'fs';

// Load .env.local
dotenv.config({ path: join(process.cwd(), '.env.local') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log("Starting seed process using Client SDK (Test Mode)...");

  try {
    // 1. Seed Teams
    const teamsData = JSON.parse(readFileSync(join(process.cwd(), 'data/teams.json'), 'utf8'));
    console.log(`Seeding ${teamsData.length} teams...`);
    for (const team of teamsData) {
      await setDoc(doc(db, 'teams', team.shortCode), team);
    }

    // 2. Seed Matches
    const matchesData = JSON.parse(readFileSync(join(process.cwd(), 'data/matches.json'), 'utf8'));
    console.log(`Seeding ${matchesData.length} matches...`);
    for (const match of matchesData) {
      const matchDoc = { ...match };
      matchDoc.date = new Date(match.date);
      await setDoc(doc(db, 'matches', match.id), matchDoc);
    }

    // 3. Seed Players
    const playersData = JSON.parse(readFileSync(join(process.cwd(), 'data/players.json'), 'utf8'));
    console.log(`Seeding ${playersData.length} players...`);
    for (let i = 0; i < playersData.length; i++) {
      const player = playersData[i];
      await setDoc(doc(db, 'players', `player_${i}`), player);
    }

    // 4. Seed Users
    const usersData = JSON.parse(readFileSync(join(process.cwd(), 'data/users.json'), 'utf8'));
    console.log(`Seeding ${usersData.length} users...`);
    for (const user of usersData) {
      await setDoc(doc(db, 'users', user.id), user);
    }

    // 5. Seed Forums
    const forumsData = JSON.parse(readFileSync(join(process.cwd(), 'data/forums.json'), 'utf8'));
    console.log(`Seeding ${forumsData.length} forums...`);
    for (const forum of forumsData) {
      const forumDoc = { ...forum };
      forumDoc.createdAt = new Date(forum.createdAt);
      await setDoc(doc(db, 'forums', forum.id), forumDoc);
    }

    // 6. Seed Posts
    const postsData = JSON.parse(readFileSync(join(process.cwd(), 'data/posts.json'), 'utf8'));
    console.log(`Seeding ${postsData.length} posts...`);
    for (const post of postsData) {
      const postDoc = { ...post };
      postDoc.createdAt = new Date(post.createdAt);
      await setDoc(doc(db, 'posts', post.id), postDoc);
    }

    console.log("Seed process completed successfully.");
  } catch (error) {
    console.error("Error during seeding:", error);
    console.log("\nMake sure your Firestore database is created and security rules are in 'Test mode'!");
  }
}

seed().then(() => process.exit(0)).catch(() => process.exit(1));
