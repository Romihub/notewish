# NoteWish - Comprehensive Feature Requirements

Based on LLD.md and conversation analysis, here's what the application needs:

## 🎨 Design Philosophy
- **Professional & Modern** - NOT childish or playful
- **Color Scheme:**
  - Purple (#a855f7) - Primary brand, CTAs, active states
  - Pink (#ec4899) - Secondary accents only
  - White/Gray - All backgrounds, UI elements
  - Black - All text content
- **Inspiration:** AI Creative Studio, Kling AI, Professional SaaS platforms

## 🏗️ AI Creation Workspace Architecture

### Left Pane (Pipeline - 340px)
**Purpose:** Input collection + Component status tracking

**Components:**
1. **Card Title/Name**
   - Editable heading at top: "Untitled Card" (default)
   - Click to edit inline (pencil icon)
   - Auto-save on blur
   - Format: "Birthday Card for Mom" suggested based on inputs
   - Shows last saved timestamp: "Saved 2 minutes ago"

2. **Basic Information**
   - Occasion (text input)
   - Recipient Name (text input)
   - Personal Message (textarea)

2. **Generator Buttons** (with status indicators)
   - Generate Message (purple primary button)
   - Generate Image (white secondary)
   - Generate Voice (white secondary)
   - Generate Song (white secondary)
   - Each shows completion status: ✓ Added / Generating... / —

3. **Component Checklist**
   - Visual list of all components
   - Required vs Optional indicators
   - Completion status for each

### Right Pane (Workspace - Remainder)
**Purpose:** Active creation area for each generator type

**Structure:**
- Tabs: Message | Image | Voice | Music
- Clicking left pane buttons opens corresponding tab
- Each tab has comprehensive generation options

### 🤖 AI Assistant (DeepSeek-style) - REAL LLM INTEGRATION
**Location:** Floating button top-right → Opens panel
**Features:**
- **REAL LLM chat interface** (GPT-4, Claude, or DeepSeek API)
- Context-aware suggestions based on active tab
- Streams real-time AI responses
- Understands current inputs (occasion, recipient, personal message)
- Quick action buttons that trigger real AI prompts:
  - "Suggest a heartfelt message"
  - "Describe a celebration image"
  - "Enhance my prompt"
  - "Make it more emotional"
- Can inject AI-generated suggestions directly into input fields
- Maintains conversation history within session
- Shows "thinking..." indicator during API calls

**Implementation:**
- API Route: `/api/ai-assistant`
- Accepts: { message, context: { occasion, recipient, activeTab } }
- Returns: Streaming AI response
- Provider: OpenAI GPT-4 / Anthropic Claude / DeepSeek API

---

## 📝 Message Generator (Text Tab)

### Advanced Options Panel
**Style Options:**
- Heartfelt & Emotional
- Funny & Lighthearted
- Poetic & Romantic
- Formal & Professional
- Casual & Friendly

**Length Options:**
- Short (1-2 sentences)
- Medium (paragraph)
- Long (multiple paragraphs)

**Tone Options:**
- Warm
- Playful
- Sincere
- Humorous
- Inspirational

**Custom Prompt:**
- Large textarea for specific instructions
- "Describe themes, memories, emotions..."

### Output Area
**Real-time Preview:**
- Shows currently selected message
- Editable after generation

**AI Suggestions (3-5 variants):**
- Each suggestion in a card
- Actions per suggestion:
  - "Use This" (purple button)
  - "Polish" (refine further)
  - "Add Humor"
  - "Make Formal"
  - "Add Emotion"
- "Regenerate" button at bottom

---

## 🎨 Image Generator (Image Tab)

### Reference Upload
- Drag & drop or file browser
- "Upload reference image to guide AI"
- Shows preview of uploaded image
- Option to remove/replace

### Image Description
- Large textarea
- Placeholder: "Describe in detail... lighting, mood, colors, composition, subject"
- Character counter
- AI Assistant button inline

### Art Style (Grid of 6+)
- Vibrant & Colorful
- Watercolor
- Photorealistic
- Cartoon/Illustration
- Anime/Manga
- 3D Render
- Oil Painting
- Sketch/Line Art

### Aspect Ratio
- 16:9 (Landscape)
- 4:3 (Standard)
- 1:1 (Square)
- 9:16 (Portrait)
- 3:4 (Portrait standard)

### Advanced Settings (Collapsible)
- Quality: Standard / HD / Ultra HD
- Detail Level: Low / Medium / High
- Color Palette: Auto / Warm / Cool / Monochrome
- Negative Prompt: "What to avoid..."

### Output
- Generated image preview
- Options:
  - Use This Image
  - Regenerate
  - Edit Prompt
  - Variations (4x)
  - Upscale

**AI Provider:** DALL-E 3 / Midjourney / Stable Diffusion

---

## 🎙️ Voice Generator (Voice Tab)

### Reference Voice Upload
- "Upload voice sample for cloning (30s+ recommended)"
- Drag & drop audio file
- Playback preview
- Remove/Replace option

### Voice Message Text
- Large textarea
- "Enter the text to be spoken..."
- Word/character count
- Pronunciation guide helper

### Voice Options

**Voice Type:**
- Female (Multiple personas: Professional, Friendly, Energetic)
- Male (Multiple personas: Professional, Casual, Authoritative)
- Neutral/Child (if applicable)

**Speaking Style:**
- Natural & Conversational
- Expressive & Emotional
- Calm & Soothing
- Energetic & Upbeat
- Serious & Professional

**Speed:**
- Slow (0.75x)
- Normal (1.0x)
- Fast (1.25x)
- Custom slider

**Emotion/Tone:**
- Happy & Cheerful
- Calm & Peaceful
- Excited & Enthusiastic
- Sad & Melancholic
- Serious & Formal

**Language & Accent:**
- English (US, UK, Australian, etc.)
- Other languages...

### Advanced Settings
- Pitch adjustment
- Emphasis on certain words
- Pause duration control
- Background noise (optional)

### Output
- Audio player with waveform
- Download button
- Regenerate with same/new settings
- Voice preview before generation

**AI Provider:** ElevenLabs / Azure / Google Cloud TTS

---

## 🎵 Music Generator (Music Tab)

### Music Style
**Dropdown with categories:**
- Upbeat & Energetic
- Calm & Soothing
- Romantic & Sweet
- Epic & Cinematic
- Jazzy & Smooth
- Acoustic & Gentle
- Electronic & Modern
- Classical
- Lo-fi
- Ambient

### Mood/Vibe
- Happy & Joyful
- Peaceful & Relaxing
- Dramatic & Intense
- Nostalgic
- Mysterious
- Playful

### Instruments (Multi-select chips)
- Piano
- Guitar (Acoustic/Electric)
- Violin/Strings
- Drums/Percussion
- Flute
- Saxophone
- Synthesizer
- Bass
- Vocals (Humming/Choir)

### Duration
- 15 seconds
- 30 seconds
- 60 seconds
- 90 seconds
- 120 seconds
- Custom duration slider

### Advanced Settings
- BPM (Tempo): Slow / Medium / Fast / Custom
- Key: C Major, D Minor, etc.
- Energy Level: Low / Medium / High
- Custom Prompt: "Describe the musical vibe..."

### Output
- Audio player
- Waveform visualization
- Trim/loop options
- Download
- Regenerate
- Variations

**AI Provider:** Suno AI / Mubert / AIVA

---

## 🎬 Video Generator (Video Tab)

### Reference Inputs
- **Image Upload** - Drag & drop reference images
- **Text Reference** - Can use generated message as script/context
- Shows preview of uploaded reference materials
- Option to remove/replace

### Video Description
- Large textarea
- Placeholder: "Describe the scene, motion, camera movements, transitions..."
- Character counter
- AI Assistant button inline for help

### Style Options
- **Animated** - Cartoon/animated style
- **Realistic** - Photorealistic video
- **3D Rendered** - Computer-generated 3D
- **Cinematic** - Film-like quality
- **Abstract** - Artistic/experimental
- **Watercolor** - Painted animation style

### Duration
- 3 seconds
- 5 seconds
- 10 seconds
- 15 seconds
- 30 seconds (premium)

### Camera Movement
- Static (no movement)
- Pan (left/right)
- Zoom In/Out
- Rotate
- Dolly (forward/backward)
- Dynamic (AI decides)

### Motion Speed
- Slow Motion (0.5x)
- Normal (1.0x)
- Fast (1.5x)
- Time-lapse (2x)

### Advanced Settings (Collapsible)
- FPS: 24 / 30 / 60
- Resolution: 720p / 1080p / 4K
- Aspect Ratio: 16:9, 9:16, 1:1
- Loop: Yes/No
- Background Music: Link to music generator output

### Output
- Video player with controls
- Download button (MP4)
- Regenerate
- Create Variations
- Extend Video (add more seconds)
- Upscale resolution

**AI Providers:** 
- OpenAI Sora
- Google Veo 3
- Runway ML Gen-2/Gen-3
- Pika Labs

**Integration Notes:**
- Can use generated text as video context/narration
- Can use generated image as first frame/reference
- Can sync with generated voice/music

---

## 🔄 Workflow Logic

1. User fills basic info (Occasion, Recipient, Personal Message)
2. User clicks generator button → Opens corresponding tab
3. User provides inputs + adjusts options
4. **AI Assistant available at any point** for help
5. Click "Generate" → Shows loading state
6. Results appear in output area
7. User can:
   - Use result (adds to pipeline)
   - Regenerate
   - Refine with edits
   - Try variations
8. Once added, component shows ✓ in left pane
9. Repeat for other components
10. When required components complete → "Preview & Share" button activates

---

## ✅ Status Indicators

**Pipeline Component States:**
- Empty: Gray dash "—"
- Generating: Purple "Generating..." with spinner
- Complete: Green "✓ Added"

**Visual Feedback:**
- Buttons disable during generation
- Loading spinners
- Progress indicators
- Success/error toasts

---

## 🎯 Key Principles

1. **Comprehensive Options** - Don't be minimal, provide ALL relevant controls
2. **AI Assistance** - Integrated helper, not afterthought
3. **Upload Capabilities** - Reference materials for better results
4. **Professional UI** - Clean, organized, not cluttered
5. **Purple for CTAs only** - Rest is neutral
6. **Clear Workflows** - Pipeline → Workspace → Output → Add
7. **Flexibility** - Advanced users can tweak, beginners can use defaults

---

## 🚀 Additional Features to Consider

### 💾 Data Management
- [ ] **Auto-save** - Save progress every 30 seconds
- [ ] **Version history** - Restore previous versions of card
- [ ] **Duplicate/Clone** - Create variations from existing cards
- [ ] **Bulk operations** - Delete/export multiple cards at once
- [ ] **Undo/Redo** - Stack for all actions (Ctrl+Z / Ctrl+Shift+Z)

### 📤 Sharing & Delivery
- [ ] **Schedule delivery** - Send card at specific date/time
- [ ] **Multiple export formats** - PDF, PNG, Video, Interactive HTML
- [ ] **Direct email/SMS** - Send without leaving app
- [ ] **Social media sharing** - Direct post to platforms
- [ ] **Embed code** - For websites/blogs
- [ ] **QR code generation** - For physical cards pointing to digital version
- [ ] **Password protection** - Private cards with access code

### 💰 Monetization & Credits
- [ ] **Credit/Token system** - Purchase credits for AI generations
- [ ] **Cost indicator** - Show cost before generating
- [ ] **Usage analytics** - Track credit consumption
- [ ] **Subscription tiers** - Free/Pro/Premium plans
- [ ] **Free tier limits** - X generations per month
- [ ] **Premium features** - HD exports, longer audio, etc.

### 📊 Analytics & Tracking
- [ ] **View analytics** - Who viewed, when, how long
- [ ] **Engagement metrics** - Reactions, shares, downloads
- [ ] **A/B testing** - Compare different versions
- [ ] **Heatmaps** - Where viewers focus (for interactive cards)

### 🔔 Notifications
- [ ] **Card viewed notification** - Email/push when recipient views
- [ ] **Reminder system** - "Don't forget John's birthday tomorrow"
- [ ] **Occasion suggestions** - Based on calendar/contacts
- [ ] **Generation complete** - Notify when long generation finishes

### 🎨 Preview & Final Screen
- [ ] **Full preview mode** - See exactly what recipient sees
- [ ] **Device preview** - Mobile/tablet/desktop views
- [ ] **Interactive test** - Try all elements before sharing
- [ ] **Edit after preview** - Go back and modify
- [ ] **Preview with recipient name** - Personalization preview

### 🌍 Accessibility & Localization
- [ ] **Multi-language UI** - Interface in 10+ languages
- [ ] **Screen reader support** - Full ARIA labels
- [ ] **Keyboard navigation** - Tab through all controls
- [ ] **High contrast mode** - For visual impairments
- [ ] **Text-to-speech** - For all generated text
- [ ] **RTL support** - Right-to-left languages

### 📱 Mobile Experience
- [ ] **Touch gestures** - Swipe, pinch, long-press
- [ ] **Mobile-optimized UI** - Larger tap targets
- [ ] **Offline mode** - Work without internet, sync later
- [ ] **Native app feel** - PWA with install prompt
- [ ] **Camera integration** - Take reference photos directly

### 🎭 Template System
- [ ] **Template marketplace** - Community-created templates
- [ ] **Custom template builder** - Create your own layouts
- [ ] **Template categories** - Filter by style/occasion
- [ ] **Template preview** - See examples before selecting
- [ ] **Favorite templates** - Quick access to favorites
- [ ] **Template ratings** - Community feedback

### 🤝 Collaboration
- [ ] **Shared editing** - Multiple people work on same card
- [ ] **Comments** - Leave feedback on specific elements
- [ ] **Approval workflow** - For team/group cards
- [ ] **Contributor credits** - Show who added what

### 🛡️ Error Handling & Resilience
- [ ] **API fallbacks** - Switch providers if one fails
- [ ] **Retry logic** - Auto-retry failed generations
- [ ] **Error messages** - Clear, actionable feedback
- [ ] **Partial generation** - Save what worked if something fails
- [ ] **Rate limit warnings** - Before hitting API limits
- [ ] **Offline detection** - Warn user if internet drops

### 🎯 User Experience Enhancements
- [ ] **Onboarding tutorial** - First-time user guide
- [ ] **Tooltips** - Explain each feature
- [ ] **Keyboard shortcuts** - Power user features
- [ ] **Recent projects** - Quick access to last 5 cards
- [ ] **Search functionality** - Find saved cards
- [ ] **Tags/Categories** - Organize cards by type
- [ ] **Favorites** - Star important cards
- [ ] **Inspiration gallery** - Browse example cards
- [ ] **Color picker** - Customize brand colors per card

### 🔒 Security & Privacy
- [ ] **Data encryption** - At rest and in transit
- [ ] **GDPR compliance** - Data deletion, export
- [ ] **Privacy controls** - Who can see what
- [ ] **Content moderation** - Flag inappropriate generations
- [ ] **Two-factor auth** - For account security

### 🧪 Quality Control
- [ ] **Content filtering** - Detect/block inappropriate content
- [ ] **Quality scoring** - Rate AI outputs
- [ ] **Feedback loop** - Improve AI over time
- [ ] **Manual review queue** - For reported content
- [ ] **Watermarking** - Free tier cards have watermark

### 📈 Growth Features
- [ ] **Referral program** - Invite friends for credits
- [ ] **Social proof** - "X people created cards today"
- [ ] **Testimonials** - User success stories
- [ ] **Blog/Resources** - Tips for better cards
- [ ] **Email campaigns** - Occasion reminders

### 🔧 Developer/Admin Tools
- [ ] **Admin dashboard** - Manage users, content
- [ ] **Usage monitoring** - Track API costs
- [ ] **Feature flags** - Roll out features gradually
- [ ] **A/B testing framework** - Test UI variations
- [ ] **Logging & debugging** - Track errors
- [ ] **Webhooks** - Integrate with other services

---

## 🚀 Phase 2 Feature Integrations

### 👥 Multi-Recipient Support
- [ ] **Bulk recipient list** - Add multiple email addresses/phone numbers
- [ ] **Personalization per recipient** - Auto-customize name/message for each
- [ ] **Group sending** - Send to entire contact lists
- [ ] **Scheduled staggered delivery** - Send to different recipients at different times
- [ ] **Tracking per recipient** - See who viewed, who didn't
- [ ] **Follow-up reminders** - Remind non-openers to view

### 💬 Reaction/Response System
- [ ] **Emoji reactions** - Recipients can react: ❤️ 👏 🎉 😢 😂
- [ ] **Thank you messages** - Recipients can reply with text
- [ ] **Voice replies** - Recipients record voice thank you
- [ ] **Notification to sender** - Alert when recipient reacts/replies
- [ ] **Public vs private reactions** - Control who sees responses
- [ ] **Reaction analytics** - Track most used reactions
- [ ] **Comments section** - For group cards (like wedding wishes)

### 🎁 Gift Attachments & Monetization
- [ ] **Gift card integration** - Attach Amazon, Target, etc. gift cards
- [ ] **Donation links** - Charity donations in recipient's name
- [ ] **Shop links** - Link to gift registry or wish list
- [ ] **Payment integration** - Accept payments within card (for fundraisers)
- [ ] **Stripe/PayPal support** - Secure payment processing
- [ ] **Gift tracking** - See if recipient claimed gift

### 📅 Calendar Integration
- [ ] **Google Calendar sync** - Import birthdays/anniversaries automatically
- [ ] **iCloud/Outlook sync** - Cross-platform calendar support
- [ ] **Contact import** - Pull contacts with birthdays from phone
- [ ] **Smart reminders** - "John's birthday is in 2 weeks"
- [ ] **Auto-create suggestions** - "Create a card for upcoming occasions"
- [ ] **Recurring events** - Annual reminders for same people
- [ ] **Countdown timers** - "3 days until Mom's birthday"

### 🎤 Voice Recording (Personal)
- [ ] **Record directly in browser** - Microphone access
- [ ] **Audio trimming** - Cut beginning/end
- [ ] **Background noise reduction** - Auto-clean audio
- [ ] **Multiple takes** - Record, listen, re-record
- [ ] **Voice effects** - Add reverb, echo, pitch shift (optional)
- [ ] **Mix with music** - Blend voice with background track
- [ ] **Waveform editor** - Visual audio editing

### ⚡ Real-time Preview While Editing
- [ ] **Live preview pane** - Updates as you type
- [ ] **Split screen mode** - Edit left, preview right
- [ ] **Mobile preview** - Toggle between device sizes
- [ ] **Animation preview** - See transitions/effects
- [ ] **Interactive preview** - Click elements to test
- [ ] **Hot reload** - Instant updates without page refresh

### 🏢 Brand Customization (Enterprise)
- [ ] **Custom logo upload** - Replace NoteWish branding
- [ ] **Brand color picker** - Override theme colors
- [ ] **Custom fonts** - Upload company fonts
- [ ] **Email domain whitelisting** - send@yourbrand.com
- [ ] **White-label mode** - Remove all NoteWish branding
- [ ] **Custom templates** - Company-specific designs
- [ ] **Team accounts** - Shared brand assets
- [ ] **Usage reporting** - Track team card creation

### 📦 Batch Creation
- [ ] **CSV import** - Upload spreadsheet with recipients
- [ ] **Template replication** - Same design, different data
- [ ] **Variable fields** - {firstName}, {occasion}, etc.
- [ ] **Bulk preview** - Review all cards before sending
- [ ] **Scheduled batch send** - Stagger delivery times
- [ ] **Error handling** - Skip invalid entries, continue
- [ ] **Export batch** - Download all as ZIP

### 📊 Recipient View Analytics (Advanced)
- [ ] **Time on card** - How long did they view?
- [ ] **Section engagement** - Which parts got most attention
- [ ] **Interaction heatmap** - Where did they click/tap
- [ ] **Device/Browser info** - How did they view it
- [ ] **Location data** - City/country (if permitted)
- [ ] **Replays** - How many times did they revisit
- [ ] **Share tracking** - Did they forward to others

### 🕐 Card Expiration/Self-Destruct
- [ ] **Time-limited cards** - Auto-delete after X days
- [ ] **View-limited cards** - Delete after X views
- [ ] **Countdown display** - "This card expires in 3 days"
- [ ] **Archive before delete** - Save copy for sender
- [ ] **Permanent deletion option** - No trace left
- [ ] **Burn notice** - Recipient sees "This card has expired"
- [ ] **Renewal option** - Extend expiration before it expires

---

This document serves as the comprehensive blueprint for what the AI Creation Workspace should contain.
