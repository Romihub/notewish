# Firebase Admin Setup Guide

## 🔑 Two Ways to Configure Firebase Admin

### **Option 1: Using Service Account JSON File (RECOMMENDED)**

This is the **easiest and cleanest** approach!

#### Step 1: Download Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Go to **Service Accounts** tab
5. Click **Generate new private key**
6. Save the JSON file as `notewish-firebase-admin-key.json`

#### Step 2: Place File in Project

```bash
# Put it in your project root (next to package.json)
notewish/
├── notewish-firebase-admin-key.json  # ← Put it here
├── package.json
├── .env.local
└── ...
```

#### Step 3: Add to .gitignore

**IMPORTANT:** Make sure this file is NOT committed to git!

Add to `.gitignore`:
```
# Firebase Admin credentials
*firebase-admin-key.json
```

#### Step 4: Update Your Code

Create a new file for server-side Firebase:

**`src/lib/firebase-admin.ts`**
```typescript
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      // The private key needs to replace \n with actual line breaks
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { admin, adminDb, adminAuth };
```

#### Step 5: Update .env.local

You only need these 3 lines:
```env
FIREBASE_ADMIN_PROJECT_ID=notewish9
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@notewish9.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhki...(your full key here)...==\n-----END PRIVATE KEY-----\n"
```

---

### **Option 2: Using Environment Variables**

If you prefer environment variables (for deployment platforms like Vercel):

#### Format the Private Key Correctly

The private key needs to be on ONE LINE with `\n` representing line breaks.

**Example:**

```env
# WRONG ❌ (multi-line won't work)
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFA...
...
-----END PRIVATE KEY-----"

# CORRECT ✅ (single line with \n)
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFA...(all on one line)...\n-----END PRIVATE KEY-----\n"
```

#### How to Format It:

**Method 1: Manual**
1. Open your downloaded JSON file
2. Copy the `private_key` value
3. It should already have `\n` in it
4. Paste into .env.local surrounded by quotes

**Method 2: Command Line**
```bash
# Extract and format the key automatically
cat notewish-firebase-admin-key.json | grep private_key
```

Copy the value (it will already have the `\n` characters)

---

## 🚀 **RECOMMENDED APPROACH**

Use **Option 1** (JSON file) for local development because:
- ✅ Easier to set up
- ✅ No formatting issues
- ✅ Cleaner .env file
- ✅ Works exactly like Google's examples

For **production deployment** (Vercel, Railway, etc.):
- Add the 3 environment variables from the JSON:
  - `FIREBASE_ADMIN_PROJECT_ID`
  - `FIREBASE_ADMIN_CLIENT_EMAIL`
  - `FIREBASE_ADMIN_PRIVATE_KEY` (the entire private_key value from JSON)

---

## 📝 Complete .env.local Template

```env
# ============================================
# CLIENT-SIDE FIREBASE (for web app)
# ============================================
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=notewish9.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=notewish9
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=notewish9.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# ============================================
# SERVER-SIDE FIREBASE ADMIN (for API routes)
# ============================================
# Option A: Use these 3 variables
FIREBASE_ADMIN_PROJECT_ID=notewish9
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@notewish9.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_FULL_KEY_HERE_ON_ONE_LINE\n-----END PRIVATE KEY-----\n"

# Option B: Or just point to the JSON file (recommended for local dev)
# GOOGLE_APPLICATION_CREDENTIALS="./notewish-firebase-admin-key.json"

# ============================================
# AI SERVICE API KEYS
# ============================================
OPENAI_API_KEY=sk-...
# ... rest of your API keys
```

---

## 🔧 Using JSON File in Code

If you want to use the JSON file directly, here's the code:

**`src/lib/firebase-admin.ts`**
```typescript
import * as admin from 'firebase-admin';
import serviceAccount from '../../notewish-firebase-admin-key.json';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
```

---

## ✅ Quick Test

After setup, test that it works:

**`src/app/api/test-admin/route.ts`**
```typescript
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    // Try to access Firestore
    const collections = await adminDb.listCollections();
    
    return NextResponse.json({
      success: true,
      message: 'Firebase Admin is working!',
      collections: collections.map(col => col.id)
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
```

Test at: `http://localhost:3000/api/test-admin`

---

## 🎯 Summary

**For Local Development:**
- Use JSON file (Option 1)
- Simpler and cleaner

**For Production/Deployment:**
- Use environment variables (Option 2)
- Copy the 3 values from your JSON file
- Make sure private key is on ONE LINE with `\n` characters

**Need Help?**
If the private key still doesn't work, share the first few characters and I can help format it!
