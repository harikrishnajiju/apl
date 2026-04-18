# Firebase Setup Instructions

Follow these steps to set up the Firebase project for PitchSide:

1. **Create Project**: 
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "**Add project**", name it `pitchside`.
   - Disable Google Analytics for now (it makes setup faster).
   - Wait for the project to finish creating, then click **Continue**.

2. **Enable Authentication**:
   - On the left sidebar of your new project, look for **Authentication** (it has an icon with two users). If you don't see it, click **All Products** at the bottom of the sidebar, then select **Authentication**.
   - Click the "**Get Started**" button.
   - You'll see a list of providers. Click "**Email/Password**", enable it, and save.
   - Click "**Add new provider**", select "**Google**", enable it, select your email from the "Project support email" dropdown, and save.

3. **Enable Firestore Database**:
   - On the left sidebar, click **Firestore Database** (or find it under **All Products**).
   - Click "**Create database**".
   - Select "**Start in Test mode**" (this allows our app to read/write without complex security rules for now).
   - Choose the `asia-south1` (Mumbai) region or a region close to you. Click **Enable**.

4. **Get Web Credentials (for `.env.local`)**:
   - Near the top left of the sidebar, click the **Gear Icon** next to "Project Overview", then select **Project settings**.
   - Scroll down to the "**Your apps**" section.
   - Click the **Web icon (`</>`)** to register a web app.
   - Name it `PitchSide Web` and click "**Register app**".
   - You will see a `firebaseConfig` object on the screen. Copy the values (apiKey, authDomain, etc.) into your `.env.local` file.

5. **Get Admin SDK Service Account (for `.env.local`)**:
   - Still in Project settings, click the "**Service accounts**" tab at the top.
   - Ensure "Node.js" is selected, then click "**Generate new private key**".
   - A `.json` file will download to your computer. Open it in a text editor.
   - Copy the `project_id`, `client_email`, and `private_key` from that JSON file into your `.env.local` file.

6. **Gemini API Key**:
   - Get a free key from [Google AI Studio](https://aistudio.google.com/app/apikey).
   - Add it to your `.env.local` file as `GEMINI_API_KEY`.
