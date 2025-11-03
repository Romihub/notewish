# Firebase Storage Security Rules Setup

## Current Issue
Firebase Storage is currently blocking uploads because of default security rules. You need to configure rules to allow:
- Uploading generated content (music, images, videos, voice)
- Reading/downloading the content for playback

## How to Set Up Storage Rules

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Storage** from the left sidebar
4. Click on **Rules** tab at the top

### Step 2: Update Rules

Replace the existing rules with these:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Allow all authenticated users to read
    // Allow all users (including unauthenticated) to read cards
    match /cards/{cardId}/{allPaths=**} {
      // Anyone can read card assets (for sharing)
      allow read: if true;
      
      // Anyone can write/upload (for now - you can add auth later)
      // For production, you should require authentication:
      // allow write: if request.auth != null;
      allow write: if true;
    }
  }
}
```

### Step 3: For Production (Recommended)

Once you have authentication working, use these more secure rules:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /cards/{cardId}/{allPaths=**} {
      // Anyone can read (for sharing cards)
      allow read: if true;
      
      // Only authenticated users can upload
      allow write: if request.auth != null;
      
      // Optional: Only allow specific file types and sizes
      allow write: if request.resource.size < 50 * 1024 * 1024 // 50MB limit
                    && request.resource.contentType.matches('image/.*|audio/.*|video/.*');
    }
  }
}
```

### Step 4: Firestore Rules

You also need Firestore rules for storing card data. Go to **Firestore Database** > **Rules**:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Cards collection
    match /cards/{cardId} {
      // Anyone can read (for sharing)
      allow read: if true;
      
      // Anyone can create/update for now
      // For production: allow write: if request.auth != null;
      allow write: if true;
    }
    
    // Users collection (if you add it later)
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Step 5: Test

After updating the rules:
1. Click **Publish** in Firebase Console
2. Wait 10-30 seconds for rules to propagate
3. Try generating music again
4. The upload should now work!

## Important Notes

⚠️ **For Development**: The open rules (`allow write: if true;`) are fine for testing
✅ **For Production**: Switch to authenticated rules (`allow write: if request.auth != null;`)

## Troubleshooting

If you still get errors:
1. Check browser console for specific error messages
2. Verify Firebase project is correctly initialized in `src/lib/firebase.ts`
3. Ensure you've enabled **Firebase Storage** in the Firebase Console
4. Check that your Firebase config in `.env.local` is correct

## Cost Considerations

- Storage: $0.026/GB per month
- Download: $0.12/GB
- Upload: $0.05/GB

Each music file ~1-5MB, so you can store ~200-1000 songs per $1/month
