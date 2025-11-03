# How to Get Your Firebase Credentials

## Step 1: Go to Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Click on your project: **notewish-44499** (I can see this from your admin credentials)

## Step 2: Get Web App Credentials

1. In the Firebase Console, click the **Gear Icon** (⚙️) next to "Project Overview"
2. Click **Project Settings**
3. Scroll down to **"Your apps"** section
4. If you don't see a web app (</>), click **"Add app"** → **Web** (</>)
5. Give it a name (e.g., "NoteWish Web") and click **Register app**

## Step 3: Copy Configuration

You'll see something like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567",
  authDomain: "notewish-44499.firebaseapp.com",
  projectId: "notewish-44499",
  storageBucket: "notewish-44499.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};
```

## Step 4: Update Your `.env` File

Replace the placeholder values in `notewish/.env`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=notewish-44499.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=notewish-44499
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=notewish-44499.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890abcdef
```

**Replace the values above with YOUR actual values from Firebase Console!**

## Step 5: Enable Firebase Storage

1. In Firebase Console, click **Storage** in the left sidebar
2. Click **Get Started**
3. Accept the default security rules (you'll update them later)
4. Choose a location (e.g., us-central1)
5. Click **Done**

## Step 6: Set Up Storage Rules

1. Click **Rules** tab in Firebase Storage
2. Replace with this (for testing):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /cards/{cardId}/{allPaths=**} {
      allow read: if true;
      allow write: if true;  // ⚠️ Open for testing
    }
  }
}
```

3. Click **Publish**

## Step 7: Set Up Firestore Rules

1. Go to **Firestore Database** in Firebase Console
2. If not created, click **Create Database**
3. Choose **Start in production mode** or **Test mode**
4. Choose a location
5. Click **Rules** tab
6. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /cards/{cardId} {
      allow read: if true;
      allow write: if true;  // ⚠️ Open for testing
    }
  }
}
```

7. Click **Publish**

## Step 8: Restart Dev Server

After updating `.env`:

```bash
# Stop the dev server (Ctrl+C)
# Then restart
npm run dev
```

## Step 9: Test Again

Visit `http://localhost:3000/test-firebase` and run tests!

---

## ✅ Checklist

- [ ] Get Firebase web app credentials
- [ ] Update `.env` file with real values
- [ ] Enable Firebase Storage
- [ ] Set Storage rules (open for testing)
- [ ] Enable Firestore Database
- [ ] Set Firestore rules (open for testing)
- [ ] Restart dev server
- [ ] Test at `/test-firebase`

---

## 🔒 Security Note

The rules with `allow write: if true;` are **ONLY for testing**. Before deploying to production, change them to:

```javascript
allow write: if request.auth != null;  // Only authenticated users
