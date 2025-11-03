# Firestore Database Schema

## Collections Structure

### `/users/{userId}`
User profile and account information

```typescript
{
  uid: string;                    // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Subscription & Credits
  plan: "free" | "standard" | "pro" | "enterprise";
  creditsRemaining: number;
  creditsUsed: number;
  subscriptionEndDate?: Timestamp;
  
  // Preferences
  preferences: {
    defaultStyle: string;
    favoriteTemplates: string[];
  };
  
  // Stats
  stats: {
    cardsCreated: number;
    cardsShared: number;
    totalGenerations: number;
  };
}
```

### `/cards/{cardId}`
User-created greeting cards

```typescript
{
  id: string;
  userId: string;                 // Owner
  templateId?: string;            // Optional template reference
  
  // Basic Info
  title: string;                  // "Birthday Card for Mom"
  occasion: string;               // "Birthday", "Anniversary", etc.
  recipientName: string;
  personalMessage: string;
  
  // Status
  status: "draft" | "generating" | "complete" | "published";
  privacy: "private" | "public";
  
  // Generated Assets
  assets: {
    message?: {
      text: string;
      style: string;
      tone: string;
      generatedAt: Timestamp;
      modelUsed: string;          // "gpt-4", etc.
    };
    
    image?: {
      url: string;                // Storage URL
      prompt: string;
      style: string;
      aspectRatio: string;
      generatedAt: Timestamp;
      modelUsed: string;          // "dall-e-3", etc.
    };
    
    voice?: {
      url: string;                // Storage URL
      text: string;
      voiceType: string;
      speed: number;
      generatedAt: Timestamp;
      modelUsed: string;          // "elevenlabs", etc.
    };
    
    music?: {
      url: string;                // Storage URL
      style: string;
      mood: string;
      duration: number;
      generatedAt: Timestamp;
      modelUsed: string;          // "suno", etc.
    };
    
    video?: {
      url: string;                // Storage URL
      description: string;
      style: string;
      duration: number;
      generatedAt: Timestamp;
      modelUsed: string;          // "runway", "sora", etc.
    };
  };
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastSavedAt: Timestamp;
  
  // Sharing & Analytics
  shareUrl?: string;
  views: number;
  shares: number;
  reactions: {
    [emoji: string]: number;
  };
}
```

### `/templates/{templateId}`
Card templates with layout definitions

```typescript
{
  id: string;
  name: string;
  description: string;
  category: string;               // "birthday", "anniversary", etc.
  
  // Template metadata
  thumbnail: string;              // Preview image URL
  isPremium: boolean;
  isPublic: boolean;
  popularity: number;
  
  // Layout definition
  layout: {
    type: "card" | "video" | "interactive";
    slots: {
      message?: { required: boolean; position: object };
      image?: { required: boolean; position: object };
      voice?: { required: boolean; position: object };
      music?: { required: boolean; position: object };
      video?: { required: boolean; position: object };
    };
  };
  
  // Defaults
  defaults: {
    messageStyle?: string;
    imageStyle?: string;
    colors?: string[];
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `/generations/{generationId}`
Track all AI generation requests for billing/analytics

```typescript
{
  id: string;
  userId: string;
  cardId: string;
  
  type: "message" | "image" | "voice" | "music" | "video";
  status: "pending" | "processing" | "complete" | "failed";
  
  // Request details
  prompt: string;
  options: object;                // Generation parameters
  
  // Result
  resultUrl?: string;
  error?: string;
  
  // Billing
  creditsUsed: number;
  modelUsed: string;
  
  createdAt: Timestamp;
  completedAt?: Timestamp;
}
```

## Storage Structure

### `/users/{userId}/cards/{cardId}/`
```
- images/
  - original_{timestamp}.jpg
  - generated_{timestamp}.png
  
- audio/
  - voice_{timestamp}.mp3
  - music_{timestamp}.mp3
  
- videos/
  - video_{timestamp}.mp4
  
- exports/
  - card_{timestamp}.pdf
  - card_{timestamp}.png
```

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Cards collection
    match /cards/{cardId} {
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        resource.data.privacy == "public"
      );
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Templates collection (read-only for users)
    match /templates/{templateId} {
      allow read: if true;
      allow write: if false; // Admin only via Functions
    }
    
    // Generations collection
    match /generations/{generationId} {
      allow read: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update: if false; // Updated only via Functions
    }
  }
}
```

## Indexes Required

1. **cards collection:**
   - `userId` + `createdAt` (descending)
   - `userId` + `status`
   - `privacy` + `createdAt` (descending) - for public feed
   
2. **generations collection:**
   - `userId` + `createdAt` (descending)
   - `cardId` + `type`

## Usage Examples

### Create new card:
```typescript
const cardRef = await addDoc(collection(db, "cards"), {
  userId: auth.currentUser.uid,
  title: "Untitled Card",
  occasion: "",
  recipientName: "",
  personalMessage: "",
  status: "draft",
  privacy: "private",
  assets: {},
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  views: 0,
  shares: 0,
  reactions: {}
});
```

### Save generated message:
```typescript
await updateDoc(doc(db, "cards", cardId), {
  "assets.message": {
    text: generatedText,
    style: "heartfelt",
    tone: "warm",
    generatedAt: serverTimestamp(),
    modelUsed: "gpt-4"
  },
  updatedAt: serverTimestamp()
});
