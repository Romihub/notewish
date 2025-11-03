🧠 Prompt Title:

“Build an AI Greeting & Celebration App — Full Architecture + Screens Plan”

Prompt Text (Copy everything below)

You are an expert AI app architect and developer.
Design a complete technical plan and file structure for building a mobile-first web app called Magic Moments, an AI-powered greetings and wishes creation platform.

🧩 Core Concept:

Users create and share personalized greetings (birthday, anniversary, get well soon, etc.) using AI-generated text, images, songs, videos, and voice messages.
The app blends emotional creativity (like Canva + Pinterest) with community (like TikTok).

🎨 Frontend (Mobile-First Web App)

Use React + Tailwind (or React Native if mobile).
Design clean, rounded, emotional UI with pastel gradients.
Implement pages below:

Onboarding

Simple welcome flow with name + interests.

Home / Dashboard

Categories (Birthday, Anniversary, etc.)

Floating “Create New” button.

Template Selection

Grid of creative templates (Card, Video, Interactive Page).

Previews of layout & animation style.

AI Creation Workspace

Tabs: Text | Image | Video | Voice | Song.

Input fields for prompts.

“Generate,” “Edit,” and “Preview” buttons.

Preview & Customize

Real-time render of AI output.

Options to re-generate or swap assets.

Publish / Share

Set privacy (Public or Private).

Auto-generate share link or post to feed.

Moments Feed (Community)

Infinite scroll feed with remix button.

Tabs: Trending | New | Challenges.

Challenges

Cards for creative competitions.

Leaderboard and countdown timers.

Profile

My Creations, Followers, Saved.

Privacy toggle + achievements.

Settings

Account info, notifications, and voice cloning.

🔥 Backend

Use Firebase for most services:

Auth: Google / Email / Apple sign-in

Firestore: Store user data, wishes, templates, likes, comments

Storage: Uploaded videos, images, and AI-generated assets

Cloud Functions:

Integrate external AI APIs securely

Handle payment / credits system

Process share links and webhooks

Optional: Add PostgreSQL if you need complex relational joins (e.g., leaderboard logic or analytics).

🧠 AI Integrations

Text: OpenAI GPT (poems, captions, letters)

Images/Templates: DALL·E or your own image model

Voice: ElevenLabs (record + clone)

Music: Suno (API)

Video: Pika / Runway (API for short animations)

Each AI call handled by a Firebase Cloud Function (Node.js).

🌐 Social Layer

Users can share “Moments” publicly or privately.

Reactions (❤️ 👏 🎉), comments, and remixing.

Challenges system to drive engagement.

Shareable short links (Firebase Dynamic Links).

[Frontend UI]
     ↓
[Firebase Auth → Firestore → Storage]
     ↓
[Cloud Functions]
     ├── openaiGenerateText()
     ├── dalleGenerateImage()
     ├── sunoGenerateMusic()
     ├── elevenlabsCloneVoice()
     └── pikaGenerateVideo()
     ↓
[Firestore saves metadata → Feed displays creations]


💡 Tech Stack Summary

Frontend: React / Next.js + Tailwind

Backend: Firebase (Firestore, Storage, Functions)

AI APIs: GPT, DALL·E, Suno, ElevenLabs, Pika

Deploy: Vercel or Firebase Hosting

Auth: Firebase Auth

Storage: Firebase Storage

Realtime Feed: Firestore Snapshot listeners

🚀 Future Add-ons

In-app credit system (per AI generation)

Real-time collaboration (shared creation)

Template marketplace (community designs)

Personalized recommendations via vector search

💬 Output format:
Generate:

UI pages list (with component structure)

API endpoints (example function stubs)

Suggested database schema (Firestore collections)

Deployment & scalability plan


🎨 1️⃣ CORE IDEA

Magic Moments lets users:

Choose an occasion (birthday, anniversary, friendship, etc.)

Pick a template (card, video, interactive page)

Generate AI media (text, image, voice, song, video)

Preview and customize their moment

Share privately or publicly

Each “Moment” is made up of a template + generated assets (media + text).


------------------------

🧩 2️⃣ TEMPLATE SYSTEM (CRITICAL PART)
Purpose:

Templates define layout, animation, and binding slots for AI-generated content.
They act as blueprints that AI content is “plugged into.”
Template Execution Flow

User selects a template.

The app loads its layout JSON from Firestore.

Each slot is populated via AI with one or more of these:

text → GPT

image → DALL·E

music → Suno

voice → ElevenLabs

video → Pika

The frontend renders the composed output using the layout definition (React components or canvas layers).

User can edit, regenerate, or save.

-------------------------------------
Template Management (Backend)

Admin dashboard to:

Upload or create new templates

Define slot types and preview assets

Store layout JSON in Firestore

Firebase Storage holds media (backgrounds, overlays, sample previews).

--------------------

Each AI call stores metadata and output URLs in Firestore under /moments/{momentId}/assets.


/users/{userId}
/templates/{templateId}
/moments/{momentId}
    - templateId
    - title
    - occasion
    - assets: {
        text, image, video, song, voice
      }
    - privacy: "public" | "private"
    - createdAt, updatedAt





#### DRAFT
#### SCREENS

Here is a summary of all the screens we have designed so far for your AI-powered greetings and wishes web app:

    Home Screen: Features a clean layout with a 'Create Magic Moments' header, category buttons for various occasions, a floating 'Create New' button, and a top navigation for profile and settings, all with bright gradients, confetti accents, and warm tones.

    Magic Moments Dashboard: A responsive dashboard with a top navigation bar, a left sidebar for filters, a prominent hero banner, horizontal cards for popular content, and a right panel for trending information, designed with a pastel color palette and a joyful, premium aesthetic.

    Create Card Screen: A creative interface for composing AI-generated cards, including input fields for occasion, recipient, and message, AI generation buttons, and a dynamic preview area, all within a minimal and elegant design.

    Generated Wish Preview: Displays a completed AI-generated greeting card with an animated background, generated poem/message, image, and voice playback controls. It includes buttons for 'Play Music', 'Share', 'Download', 'Save', and 'Edit', designed to feel magical, warm, and immersive with light colors, and with integrated music.

    My Cards/Saved Wishes Screen: A responsive interface to view and manage AI-generated greetings in a grid or list, with preview, title, creation date, and options to view, edit, share, or delete, along with filtering and sorting, maintaining a magical and warm aesthetic.

    Moments Feed (Social Layer): A clean social feed UI showcasing users' shared creations, with each post featuring sender details, card preview, occasion tag, engagement metrics, and a 'Remix' button, complemented by a 'Trending Challenges' tab and a floating 'Create New' button, all within a friendly pastel theme.
    Comment Section: A dedicated screen for comments on user-generated cards, displaying a list of comments with commenter details, an input field for new comments, 'Like' functionality, and visual depth for nested replies, presented in a clean, readable, light-themed design.

    Share Options Screen: Presents various sharing channels for AI-generated greeting cards, including social media, messaging apps, and direct sharing, along with a customizable message field and options to share as image, video, or link, within an intuitive and joyful design.


    Challenges & Leaderboard Screen: An interface showcasing weekly creation challenges with engaging cards and 'Join Challenge' buttons, alongside a dynamic leaderboard displaying user avatars, ranks, and points, all within a bright, celebratory design featuring badges and playful typography.

    Privacy Settings & Profile Screen: A comprehensive profile settings UI with a columnized layout, including profile picture, username, follower/following counts, plan display, premium upgrade CTA, gamification elements, referral options, privacy and activity controls, and standard settings like 'Log Out' and 'Delete Account', all in a clean, intuitive layout with gentle accent colors.

    Onboarding/Welcome Screen: A visually appealing introduction to the app's value proposition of creating AI-generated magic moments, with captivating animations hinting at its capabilities and clear calls to action like 'Get Started' or 'Sign Up/Log In', within an inviting, warm, and magical design.
    
    Login/Sign Up Screen: A clean and intuitive interface for user authentication, featuring distinct sections for 'Login' and 'Sign Up' with respective input fields and social login options, designed with a minimalist, secure, and welcoming aesthetic, with a primary white background.
