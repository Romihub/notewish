# Template System Design 2.0 - Embedded Media & Animations

## 🎯 Overview

This document outlines the enhanced template system that embeds all media (images, videos, voice, music) directly within template components using flexible layout positioning and smooth animations powered by Framer Motion.

## 🎨 Core Principles

### 1. **Self-Contained Templates**
Each template card is a complete, self-contained experience where all media elements are embedded inline - no external browser controls or detached players.

### 2. **Flexible Media Positioning**
Media can appear anywhere within a template:
- **Background layers** - Full-screen videos/images behind content
- **Inline placement** - Videos and images as content blocks
- **Side panels** - Media positioned alongside text
- **Floating overlays** - Animated media elements that hover

### 3. **Emotional Animations**
Templates use Framer Motion to create engaging, gift-like experiences:
- Page flipping animations
- Fade and zoom transitions
- Particle effects and floating elements
- Smooth state transitions

## 🧩 Media Layout System

### MediaLayout Interface

```typescript
interface MediaLayout {
  // Positioning
  position?: 'background' | 'inline' | 'side' | 'floating';
  alignment?: 'left' | 'center' | 'right';
  size?: 'small' | 'medium' | 'large' | 'full';
  
  // Styling
  rounded?: boolean;
  controls?: boolean;  // For video/audio elements
  opacity?: number;
  
  // Animation
  animate?: boolean;
  animationType?: 'fade' | 'zoom' | 'slide' | 'flip';
}
```

### Template Props Interface

```typescript
interface TemplateProps {
  // Content
  text: string;
  image?: string;
  video?: string;
  music?: string;  // Background music (auto-play, loop, hidden)
  voice?: string;  // Voice message (visible controls)
  
  // Layout options
  imageLayout?: MediaLayout;
  videoLayout?: MediaLayout;
  voiceLayout?: MediaLayout;
}
```

## 📐 Implementation Patterns

### Pattern 1: Background Video/Image

```tsx
<div className="relative rounded-2xl overflow-hidden">
  {/* Background layer */}
  <div className="absolute inset-0 z-0">
    {video && (
      <video
        src={video}
        autoPlay
        loop
        muted
        playsInline
        className="object-cover w-full h-full opacity-70"
      />
    )}
    {image && !video && (
      <img 
        src={image} 
        alt="background" 
        className="object-cover w-full h-full opacity-80" 
      />
    )}
  </div>

  {/* Content layer */}
  <div className="relative z-10 p-8">
    <h1 className="text-3xl font-bold drop-shadow-lg">{text}</h1>
  </div>
</div>
```

### Pattern 2: Inline Media

```tsx
<div className="space-y-6">
  <h1>{text}</h1>
  
  {video && (
    <div className="rounded-xl overflow-hidden shadow-lg">
      <video src={video} controls className="w-full" />
    </div>
  )}
  
  {image && (
    <img src={image} className="rounded-xl w-full shadow-lg" />
  )}
</div>
```

### Pattern 3: Side Panel Layout

```tsx
<div className="flex gap-6">
  {/* Media side */}
  <div className="w-1/2">
    {video && <video src={video} controls className="rounded-xl" />}
  </div>
  
  {/* Content side */}
  <div className="w-1/2 flex flex-col justify-center">
    <h1>{text}</h1>
  </div>
</div>
```

### Pattern 4: Floating Overlay

```tsx
<div className="relative">
  <div className="p-8">
    <h1>{text}</h1>
  </div>
  
  {image && (
    <motion.div
      className="absolute top-4 right-4 w-32 h-32 rounded-full overflow-hidden shadow-xl"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <img src={image} className="object-cover w-full h-full" />
    </motion.div>
  )}
</div>
```

## 🎵 Audio Handling

### Background Music (Invisible)
```tsx
{music && (
  <audio
    src={music}
    autoPlay
    loop
    className="hidden"
  />
)}
```

### Voice Message (Visible Player)
```tsx
{voice && (
  <div className="flex justify-center p-4">
    <audio 
      src={voice} 
      controls 
      className="w-3/4 rounded-lg shadow-md" 
    />
  </div>
)}
```

### Custom Audio Visualizer
```tsx
{voice && (
  <div className="custom-audio-player">
    <button onClick={togglePlay}>
      {isPlaying ? <Pause /> : <Play />}
    </button>
    <div className="waveform">
      {/* Animated bars */}
    </div>
  </div>
)}
```

## 🎭 Animation Guidelines

### Page Transitions
```tsx
const pageVariants = {
  initial: { opacity: 0, scale: 0.9 },
  enter: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.1 }
};

<motion.div
  variants={pageVariants}
  initial="initial"
  animate="enter"
  exit="exit"
  transition={{ duration: 0.6 }}
>
  {/* Content */}
</motion.div>
```

### Flip Animation (Flipbook style)
```tsx
const flipVariants = {
  initial: { rotateY: 0 },
  flipped: { 
    rotateY: 180,
    transition: { duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }
  }
};
```

### Stagger Children
```tsx
<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  {items.map((item) => (
    <motion.div key={item} variants={itemVariants}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

## 📦 Template Types

### 1. FlipbookCard
- **Pages**: 4 (Cover, Message, Video, Voice)
- **Animation**: 3D page flipping
- **Media**: Background image on cover, inline video, audio player
- **Best for**: Multi-page stories, anniversaries

### 2. FoldCard
- **Animation**: Vertical or horizontal fold reveal
- **Media**: Background video/image with overlay text
- **Best for**: Simple messages, greetings

### 3. StoryCard
- **Animation**: Slide-through carousel
- **Media**: Multiple images/videos in sequence
- **Best for**: Photo albums, journey stories

### 4. FloatingCard
- **Animation**: Floating elements, parallax
- **Media**: Floating images, background video
- **Best for**: Dreamy, whimsical cards

## 🎯 UX Requirements

### Self-Contained Experience
✅ Video/image backgrounds integrated
✅ Background music auto-plays (muted by default)
✅ Voice messages have custom players
✅ Text overlays content beautifully
✅ Smooth transitions (no page reloads)

### Responsive Behavior
- Templates scale to different screen sizes
- Media maintains aspect ratios
- Touch-friendly controls on mobile
- Graceful degradation if media fails to load

### Performance
- Lazy load media when possible
- Optimize video codecs (H.264/VP9)
- Compress images (WebP preferred)
- Preload critical assets

## 🧪 Testing Template

```tsx
const mockData = {
  text: "Happy Anniversary 💕",
  image: "/assets/sample-bg.jpg",
  video: "/assets/sample.mp4",
  music: "/assets/sample-music.mp3",
  voice: "/assets/sample-voice.mp3"
};

<TemplateViewer templateKey="flipbook" content={mockData} />
```

## 🚀 Implementation Checklist

- [x] Install Framer Motion
- [ ] Create MediaLayout interface
- [ ] Build reusable media components (VideoPlayer, AudioPlayer, ImageBlock)
- [ ] Create template components (FlipbookCard, FoldCard, etc.)
- [ ] Add animation variants library
- [ ] Create test page with mock data
- [ ] Test all media combinations
- [ ] Optimize performance
- [ ] Add error boundaries for media failures

## 📝 Notes

- Templates should work offline with cached media
- Accessibility: Provide captions/transcripts for audio/video
- Allow users to mute background music
- Respect user's reduced motion preferences
