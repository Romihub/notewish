# Template Configuration System Documentation

## 📋 Overview

This system manages which content generators (message, image, voice, video, music) are available for each template. It's designed to **scale to thousands of templates** without code changes.

---

## 🎯 The Problem

**Before:**
- Hard-coded config for each template
- Adding 1000 templates = 1000 code entries
- Not scalable ❌

**After:**
- Template presets (reusable patterns)
- Database storage
- Smart inference
- Scales to 10,000+ templates ✅

---

## 🔄 How It Works: Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   USER SELECTS TEMPLATE                      │
│                   "birthday-video-2024"                      │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
        ┌────────────────────────────────────────┐
        │  getTemplateConfig("birthday-video")   │
        └────────────────────┬───────────────────┘
                             │
                             ▼
        ┌────────────────────────────────────────┐
        │         CHECK 1: Cache?                 │
        │   Is config already in memory?          │
        └─────┬──────────────────────┬────────────┘
              │ YES                  │ NO
              ▼                      ▼
        ┌─────────┐     ┌────────────────────────┐
        │ RETURN  │     │  CHECK 2: Local Override?│
        │ CACHED  │     │  Is it in TEMPLATE_     │
        │ CONFIG  │     │  OVERRIDES{}?           │
        └─────────┘     └───┬────────────────┬───┘
                            │ YES            │ NO
                            ▼                ▼
                    ┌───────────┐   ┌──────────────────┐
                    │  RETURN   │   │ CHECK 3: Database│
                    │  LOCAL    │   │ Load from        │
                    │  CONFIG   │   │ Firestore?       │
                    └───────────┘   └───┬──────────┬───┘
                                        │ FOUND    │ NOT FOUND
                                        ▼          ▼
                                ┌───────────┐  ┌────────────┐
                                │  RETURN   │  │  CHECK 4:  │
                                │  DATABASE │  │  Smart     │
                                │  CONFIG   │  │  Inference │
                                └───────────┘  └─────┬──────┘
                                                     │
                                                     ▼
                    ┌────────────────────────────────────────────┐
                    │  Analyze template ID:                      │
                    │  - Contains "video"? → video-centric       │
                    │  - Contains "audio"? → audio-centric       │
                    │  - Contains "flipbook"? → text-image       │
                    │  - Default? → full-media                   │
                    └────────────────────┬───────────────────────┘
                                         │
                                         ▼
                              ┌──────────────────┐
                              │  RETURN INFERRED │
                              │  CONFIG + CACHE  │
                              └──────────────────┘
```

---

## 🧩 System Components

### 1. **Template Presets** (The Building Blocks)

Think of presets as **templates for templates** - reusable patterns:

```typescript
TEMPLATE_PRESETS = {
  'text-image': {
    // For photo cards, flipbooks
    required: ['message', 'image']
  },
  
  'video-centric': {
    // For video greetings
    required: ['message', 'video'],
    optional: ['music']
  },
  
  'full-media': {
    // For premium cards
    required: ['message'],
    optional: ['image', 'voice', 'video', 'music']
  }
}
```

**Why This Matters:**
- Instead of defining 1000 templates individually...
- Define 10 presets
- 1000 templates inherit from these 10 presets
- **DRY Principle** (Don't Repeat Yourself)

---

### 2. **Local Overrides** (Special Cases)

Only for templates that need custom configuration:

```typescript
TEMPLATE_OVERRIDES = {
  'flipbook-mini': {
    name: 'Flipbook Mini',
    ...TEMPLATE_PRESETS['text-image'] // Inherit preset
  }
}
```

**When to Use:**
- Template needs unique generator combination
- Most templates won't need this!

---

### 3. **Database Storage** (Scalability)

For production with 1000+ templates:

```
Firestore Collection: templates
Document ID: "birthday-card-123"
Data: {
  name: "Birthday Card",
  requiredGenerators: ["message", "image"],
  optionalGenerators: ["music"]
}
```

**Benefits:**
- Add new templates without code deployment
- Update configs in real-time
- No code changes needed

---

### 4. **Smart Inference** (Automatic Fallback)

If template not found anywhere, system guesses based on name:

```
"wedding-video-2024"    → video-centric preset
"birthday-photo-card"   → text-image preset
"anniversary-minimal"   → minimal preset
```

**Pattern Matching:**
```javascript
if (templateId.includes('video')) → video-centric
if (templateId.includes('photo')) → text-image
if (templateId.includes('minimal')) → minimal
else → full-media (default)
```

---

## 📊 Example: Adding 1000 Templates

### ❌ Old Way (Not Scalable)
```typescript
// Add 1000 entries to code file
CONFIGS = {
  'template-1': { generators: [...] },
  'template-2': { generators: [...] },
  'template-3': { generators: [...] },
  // ... 997 more entries 😱
}
```

### ✅ New Way (Scalable)

**Option A: Use Existing Preset**
```javascript
// Template ID: "birthday-photo-deluxe"
// System auto-detects: contains "photo" → text-image preset
// NO CODE NEEDED! 🎉
```

**Option B: Add to Database**
```javascript
// Add to Firestore (no code deployment)
await addDoc(collection(db, 'templates'), {
  id: 'custom-template-789',
  presetId: 'video-centric', // Inherit from preset
  // Custom overrides if needed
});
```

**Option C: Create New Preset** (if 100+ templates need same pattern)
```typescript
// Add ONE new preset in code
'photo-video-combo': {
  required: ['message', 'image', 'video'],
  optional: ['music']
}
// Now 100+ templates can use this preset
```

---

## 🎨 Real-World Example

### Scenario: Launch 500 Birthday Templates

1. **Most use standard patterns:**
   - 300 templates = "birthday-photo-*" → auto-inferred as `text-image`
   - 150 templates = "birthday-video-*" → auto-inferred as `video-centric`
   - NO CODE NEEDED for these 450 templates!

2. **50 templates need custom config:**
   - Add to Firestore with specific generator requirements
   - Update instantly without code deployment

---

## 🔧 Priority System

```
┌─────────────────────────────────────┐
│  1. Cache (fastest)                 │
│     ↓ (if not cached)               │
│  2. Local Override                  │
│     ↓ (if not in overrides)         │
│  3. Database (Firestore)            │
│     ↓ (if not in database)          │
│  4. Smart Inference (pattern match) │
│     ↓ (if no pattern matches)       │
│  5. Default (full-media)            │
└─────────────────────────────────────┘
```

---

## 💡 Key Benefits

| Feature | Benefit |
|---------|---------|
| **Presets** | Define pattern once, reuse 1000 times |
| **Database** | Add templates without code changes |
| **Inference** | Automatic config for new templates |
| **Caching** | Fast performance (no repeated lookups) |
| **Scalability** | Handles 10,000+ templates easily |

---

## 📝 Usage in Code

### Load Template Config
```typescript
// In your component
const [templateConfig, setTemplateConfig] = useState<TemplateConfig | null>(null);

useEffect(() => {
  getTemplateConfig(templateId).then(config => {
    setTemplateConfig(config);
  });
}, [templateId]);
```

### Check If Generator Is Allowed
```typescript
// Sync check (requires config already loaded)
const isAllowed = isGeneratorAllowedSync(
  templateConfig,
  'video'
);

// Grey out if not allowed
<button disabled={!isAllowed}>
  Generate Video
</button>
```

---

## 🚀 Migration Path

### Phase 1: Start Simple (Current)
- Use local overrides for your first 10-20 templates
- Test the system

### Phase 2: Add Database (When you have 50+ templates)
- Migrate configs to Firestore
- Enable real-time updates

### Phase 3: Scale (When you have 500+ templates)
- Rely on smart inference
- Only store exceptions in database
- System auto-handles most templates

---

## 📈 Scalability Metrics

| Templates | Approach | Code Entries | Database Entries |
|-----------|----------|--------------|------------------|
| 10 | Local overrides | 10 | 0 |
| 100 | Mix | 5 presets | 20 customs |
| 1,000 | Database + inference | 10 presets | 100 customs |
| 10,000 | Inference heavy | 10 presets | 500 customs |

**Result:** 10,000 templates with only ~500 database entries!

---

## 🎯 Summary

**The Magic:**
- 10 reusable presets
- Smart naming conventions
- Database for exceptions
- Automatic inference

**= Infinite scalability!** 🚀

---

## ❓ FAQ

**Q: What if I have a totally unique template?**
A: Add it to `TEMPLATE_OVERRIDES` or Firestore with custom config.

**Q: Do I need to update code for each new template?**
A: No! Use presets, database, or inference.

**Q: What happens if template is not found anywhere?**
A: System uses smart inference based on template name, or falls back to `full-media` preset.

**Q: How do I add a new preset?**
A: Add one entry to `TEMPLATE_PRESETS`. That's it!

---

**Questions? Need help? Check the code comments in `src/config/templateConfig.ts`**
