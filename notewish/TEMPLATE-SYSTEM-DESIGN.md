# Template System Design & Architecture

## 🎨 Template System Overview

Templates are **pre-designed layouts** that define how generated assets (message, image, voice, music, video) are arranged and displayed in the final greeting card.

---

## 📐 Template Architecture - 3 Approaches

### **Option 1: Component-Based Templates (RECOMMENDED)**
**Best for:** Web cards, interactive experiences, quick iteration

```typescript
// Template definition stored in Firestore
{
  id: "birthday-modern-01",
  name: "Modern Birthday Card",
  category: "birthday",
  type: "interactive-web", // or "static-image" or "video-composition"
  
  layout: {
    format: "16:9", // or "square", "portrait"
    slots: {
      background: {
        type: "gradient" | "image" | "video",
        defaultValue: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      },
      message: {
        position: { x: "center", y: "40%" },
        maxWidth: "80%",
        typography: {
          fontFamily: "Poppins",
          fontSize: "clamp(1.5rem, 4vw, 3rem)",
          textAlign: "center",
          color: "#ffffff"
        }
      },
      image: {
        position: { x: "center", y: "top" },
        size: { width: "300px", height: "300px" },
        shape: "circle" | "rounded" | "square"
      },
      voiceButton: {
        position: { x: "center", y: "bottom-20%" },
        style: "floating-play-button"
      },
      musicToggle: {
        position: { x: "right-10", y: "top-10" },
        autoPlay: false
      }
    },
    
    animations: {
      onLoad: [
        { element: "message", effect: "fadeInUp", delay: 500 },
        { element: "image", effect: "scaleIn", delay: 800 }
      ],
      interactive: {
        messageHover: "glow",
        imageClick: "expand"
      }
    }
  },
  
  rendering: {
    component: "ModernBirthdayTemplate", // React component name
    exportFormats: ["web-link", "video-mp4", "image-png"]
  }
}
```

**Implementation:**
- Store template definitions in Firestore `/templates` collection
- Create React component for each template style
- Use template definition to render dynamically
- Export to different formats on demand

---

### **Option 2: Canvas-Based Templates**
**Best for:** Image exports, precise control, print-ready outputs

```typescript
{
  id: "birthday-elegant-01",
  type: "canvas-2d",
  
  canvas: {
    width: 1920,
    height: 1080,
    layers: [
      {
        id: "background",
        type: "fill",
        color: "#faf5ff",
        zIndex: 0
      },
      {
        id: "decorative-pattern",
        type: "image",
        src: "/patterns/confetti.png",
        opacity: 0.3,
        zIndex: 1
      },
      {
        id: "main-image",
        type: "image",
        position: { x: 960, y: 300 }, // center-top
        size: { width: 400, height: 400 },
        mask: "circle",
        zIndex: 2
      },
      {
        id: "message-text",
        type: "text",
        content: "{{generated_message}}",
        position: { x: 960, y: 750 },
        style: {
          font: "48px Poppins",
          textAlign: "center",
          color: "#2d3748",
          maxWidth: 1600,
          lineHeight: 1.6
        },
        zIndex: 3
      },
      {
        id: "qr-code",
        type: "qr",
        data: "{{share_url}}",
        position: { x: 100, y: 950 },
        size: 120,
        zIndex: 4
      }
    ]
  }
}
```

**Implementation:**
- Use HTML5 Canvas API or `fabric.js`
- Render to image (PNG/JPG) or PDF
- Good for print-ready outputs

---

### **Option 3: Video Composition Templates**
**Best for:** Animated cards, TikTok-style vertical videos, social sharing

```typescript
{
  id: "birthday-video-01",
  type: "video-composition",
  
  timeline: {
    duration: 15, // seconds
    fps: 30,
    resolution: { width: 1080, height: 1920 }, // vertical
    
    tracks: [
      // Background music
      {
        type: "audio",
        asset: "{{generated_music}}",
        startTime: 0,
        volume: 0.7,
        fadeIn: 1,
        fadeOut: 2
      },
      
      // Background video/image
      {
        type: "video",
        asset: "{{generated_video}}" || "{{generated_image}}",
        startTime: 0,
        duration: 15,
        effects: ["ken-burns", "slow-zoom"]
      },
      
      // Text overlay - intro
      {
        type: "text",
        content: "Happy Birthday!",
        startTime: 0.5,
        duration: 2,
        position: "center",
        style: {
          fontSize: 72,
          color: "#ffffff",
          fontFamily: "Poppins Bold",
          stroke: { color: "#000000", width: 2 }
        },
        animation: {
          in: { type: "fadeInScale", duration: 0.5 },
          out: { type: "fadeOut", duration: 0.3 }
        }
      },
      
      // Main message
      {
        type: "text",
        content: "{{generated_message}}",
        startTime: 3,
        duration: 10,
        position: { x: "center", y: "bottom-30%" },
        style: {
          fontSize: 48,
          color: "#ffffff",
          maxWidth: "85%",
          textAlign: "center",
          lineHeight: 1.5
        },
        animation: {
          in: { type: "fadeInUp", duration: 0.8 },
          out: { type: "fadeOut", duration: 0.5 }
        }
      },
      
      // Voice narration
      {
        type: "audio",
        asset: "{{generated_voice}}",
        startTime: 3.5,
        volume: 1.0
      },
      
      // Closing
      {
        type: "text",
        content: "Love, {{sender_name}}",
        startTime: 13,
        duration: 2,
        position: "center",
        style: {
          fontSize: 36,
          color: "#ffffff",
          fontFamily: "Poppins Light"
        },
        animation: {
          in: { type: "fadeIn", duration: 0.5 }
        }
      }
    ]
  },
  
  rendering: {
    engine: "remotion" | "ffmpeg" | "canvas-to-video",
    outputFormat: "mp4",
    codec: "h264",
    quality: "high"
  }
}
```

**Implementation:**
- Use **Remotion** (React-based video framework) - HIGHLY RECOMMENDED
- Or **FFmpeg** with Node.js for server-side rendering
- Or **Cloudinary Video API** for cloud-based composition

---

## 🎯 RECOMMENDED APPROACH

### **Hybrid System: All Three!**

```
User Creates Card
      ↓
[Generates Assets with AI]
      ↓
[Selects Template Type]
      ↓
   ┌────────────────┬──────────────────┬─────────────────┐
   │                │                  │                 │
Web Card      Static Image       Animated Video
(Option 1)     (Option 2)         (Option 3)
   │                │                  │
React          Canvas API          Remotion
Component      Export PNG       Export MP4/WebM
   │                │                  │
└────────────────┴──────────────────┴─────────────────┘
                     │
              [Shareable Link]
           [Social Media Ready]
```

---

## 🤖 Auto-Generating Templates (Bi-Weekly Releases)

### **Approach 1: AI-Powered Template Generation**

```typescript
// Template generation workflow
async function generateNewTemplate(occasion: string, theme: string) {
  // 1. Generate design concepts with AI
  const designPrompt = `
    Create a greeting card template design for ${occasion} with ${theme} theme.
    Specify: color palette, layout, typography, decorative elements.
  `;
  
  const design = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: designPrompt }]
  });
  
  // 2. Convert AI description to template JSON
  const templateDefinition = parseDesignToTemplate(design);
  
  // 3. Generate background image with DALL-E
  const backgroundImage = await openai.images.generate({
    prompt: `Abstract background for ${occasion} card, ${theme} style`,
    size: "1792x1024"
  });
  
  // 4. Save to Firestore
  await db.collection('templates').add({
    ...templateDefinition,
    backgroundUrl: backgroundImage.data[0].url,
    isPublic: false, // Review before publishing
    createdAt: serverTimestamp()
  });
}
```

### **Approach 2: Curated + Community Templates**

1. **Admin Dashboard** to create templates
2. **Template Designer Tool** (visual editor)
3. **Community submissions** (users create & share)
4. **Bi-weekly featured** selection

---

## 📅 Bi-Weekly Template Release Strategy

### **Release Schedule**

```
Week 1-2: Design Phase
├─ Day 1-3:  Brainstorm occasions & themes
├─ Day 4-7:  Design 5-10 template concepts
├─ Day 8-10: Implement templates
├─ Day 11-12: Test & QA
└─ Day 14:   Release new template pack

Week 3-4: Repeat cycle
```

### **Template Categories for Rotation**

**Monthly Themes:**
- **Week 1:** Seasonal (Spring, Summer, Fall, Winter)
- **Week 2:** Holidays (Upcoming holidays)
- **Week 3:** Milestone (Graduations, Weddings, Baby)
- **Week 4:** Trending Styles (Minimalist, Retro, Neon, etc.)

### **Auto-Generation Script**

```typescript
// Run every 2 weeks via cron job
async function generateBiWeeklyTemplates() {
  const upcomingOccasions = getUpcomingOccasions(); // Next 2 months
  const trendingStyles = await fetchDesignTrends(); // Pinterest, Dribbble API
  
  for (const occasion of upcomingOccasions) {
    for (const style of trendingStyles.slice(0, 2)) {
      await generateNewTemplate(occasion, style);
    }
  }
  
  // Notify admin to review
  await sendAdminNotification("New templates ready for review!");
}
```

---

## 🎨 Template Rendering Implementation

### **1. React Component Template**

```tsx
// components/templates/ModernBirthdayTemplate.tsx
export function ModernBirthdayTemplate({ 
  message, 
  image, 
  voiceUrl, 
  musicUrl 
}: TemplateProps) {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400" />
      
      {/* Generated Image */}
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute top-20 left-1/2 -translate-x-1/2"
      >
        <img 
          src={image} 
          className="w-80 h-80 rounded-full object-cover shadow-2xl"
        />
      </motion.div>
      
      {/* Generated Message */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5"
      >
        <p className="text-4xl text-white text-center font-poppins">
          {message}
        </p>
      </motion.div>
      
      {/* Voice Playback */}
      {voiceUrl && (
        <AudioPlayer src={voiceUrl} position="bottom-center" />
      )}
      
      {/* Background Music */}
      {musicUrl && (
        <BackgroundMusic src={musicUrl} autoPlay={false} />
      )}
    </div>
  );
}
```

### **2. Dynamic Template Loader**

```typescript
// lib/templateLoader.ts
const TEMPLATE_COMPONENTS = {
  'modern-birthday-01': ModernBirthdayTemplate,
  'elegant-wedding-01': ElegantWeddingTemplate,
  'minimalist-thanks-01': MinimalistThanksTemplate,
  // ... more templates
};

export function renderTemplate(templateId: string, assets: GeneratedAssets) {
  const TemplateComponent = TEMPLATE_COMPONENTS[templateId];
  if (!TemplateComponent) {
    return <DefaultTemplate {...assets} />;
  }
  return <TemplateComponent {...assets} />;
}
```

---

## 🚀 Implementation Roadmap

### **Phase 1: Foundation (Week 1-2)**
- [ ] Define template JSON schema
- [ ] Create template collection in Firestore
- [ ] Build 3 starter React component templates
- [ ] Create template selection UI

### **Phase 2: Rendering Engine (Week 3-4)**
- [ ] Implement React-based web rendering
- [ ] Add Canvas-to-image export
- [ ] Integrate Remotion for video export

### **Phase 3: Template Management (Week 5-6)**
- [ ] Admin dashboard for template creation
- [ ] Visual template editor (drag-drop)
- [ ] Template preview system

### **Phase 4: Auto-Generation (Week 7-8)**
- [ ] AI template generator
- [ ] Bi-weekly cron job
- [ ] Template review workflow

---

## 💡 Quick Start Recommendation

**Start with Option 1 (Component-Based):**

1. Create 5-10 React component templates manually
2. Store template metadata in Firestore
3. Let users pick a template when creating a card
4. Render the selected template with generated assets
5. Add export to image/video later

**Why?**
- Fastest to implement
- Most flexible
- Easy to iterate
- Can add other rendering options later

**Want me to build out the first 3 templates as React components?** 🎨
