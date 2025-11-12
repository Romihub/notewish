# REMOTION VIDEO EXPORT - Implementation Guide

## 🎬 Overview

**Remotion** is a professional video rendering framework that converts React components directly into video - **NO SCREENSHOTS**. This is the same approach used by professional tools like Canva.

## 🆚 Comparison: Screenshot vs Remotion

### Current Composition Server (Screenshots)
```
Template → Screenshot → Static Image → FFmpeg → Video
❌ Animations lost
❌ Static frames only
✅ Works but not professional
```

### New Remotion Server (React-to-Video)
```
Template → React Component → Direct Video Render → MP4
✅ All animations preserved
✅ CSS effects work
✅ Professional quality (Canva-level)
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│           REMOTION RENDER SERVER                │
│              (Port 4004)                        │
└─────────────────────────────────────────────────┘
                      ↓
      ┌───────────────────────────────┐
      │  1. Load Card Data from DB   │
      └───────────────────────────────┘
                      ↓
      ┌───────────────────────────────┐
      │  2. Bundle React Components   │
      │     (Your templates!)         │
      └───────────────────────────────┘
                      ↓
      ┌───────────────────────────────┐
      │  3. Render with Remotion      │
      │     - CSS animations work     │
      │     - Framer Motion works     │
      │     - All effects preserved   │
      └───────────────────────────────┘
                      ↓
      ┌───────────────────────────────┐
      │  4. Output Professional MP4   │
      └───────────────────────────────┘
```

## 📁 File Structure

```
notewish/
├── remotion.config.ts              # Remotion configuration
├── remotion-server.js              # Render server (Port 4004)
└── src/
    └── remotion/
        ├── index.ts                # Entry point
        ├── Root.tsx                # Remotion root
        ├── webpack-override.ts     # Build config
        └── compositions/
            ├── CardComposition.tsx # Main composition
            └── PageSequence.tsx    # Page renderer
```

## 🚀 How to Use

### 1. Start the Remotion Server

```bash
# Terminal (separate from Next.js)
npm run start:remotion-server
```

You should see:
```
[REMOTION-SERVER] 🚀 Remotion Video Server running on http://localhost:4004
[REMOTION-SERVER] 🎨 Architecture: React → Direct Video Render
[REMOTION-SERVER] ✨ NO SCREENSHOTS - Professional quality guaranteed
```

### 2. Request Video Render

```bash
# Test endpoint
curl -X POST http://localhost:4004/render-video \
  -H "Content-Type: application/json" \
  -d '{"cardId": "your-card-id"}' \
  --output test-video.mp4
```

### 3. Preview Compositions (Development)

```bash
# Opens Remotion Studio in browser
npm run remotion:preview
```

This opens a visual editor where you can:
- Preview your compositions
- Adjust timings
- Debug animations
- Test with different data

## 🎨 Creating Custom Templates

### Example: Animated Template

```tsx
// src/remotion/templates/MyAnimatedTemplate.tsx
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const MyAnimatedTemplate: React.FC<{ data: any }> = ({ data }) => {
  const frame = useCurrentFrame();
  
  // Animate opacity
  const opacity = interpolate(frame, [0, 30], [0, 1]);
  
  // Animate scale
  const scale = interpolate(frame, [0, 30], [0.8, 1], {
    extrapolateRight: 'clamp',
  });
  
  return (
    <AbsoluteFill 
      style={{
        backgroundColor: '#667eea',
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <h1 style={{ fontSize: 80, color: '#fff' }}>
        {data.title}
      </h1>
    </AbsoluteFill>
  );
};
```

### Adding to Composition

```tsx
// src/remotion/compositions/PageSequence.tsx
import { MyAnimatedTemplate } from '../templates/MyAnimatedTemplate';

// In renderPageContent():
case 'my-custom-type':
  return <MyAnimatedTemplate data={page} />;
```

## 🎯 Features & Capabilities

### ✅ What Works Out of the Box

1. **CSS Animations**
   - Transitions
   - Keyframe animations
   - Transform effects

2. **Framer Motion**
   - All animation types
   - Gestures
   - Layout animations

3. **Media**
   - Images (`<Img>`)
   - Videos (`<Video>`)
   - Audio (`<Audio>`)

4. **Timing Control**
   - Frame-based animations
   - `interpolate()` for smooth transitions
   - Sequence management

### 🚀 Advanced Features You Can Add

1. **Transitions** (Easy)
```tsx
// Crossfade between pages
<Sequence from={start} durationInFrames={duration}>
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={30}>
      <Page1 />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={fade()}
      timing={linearTiming({ durationInFrames: 15 })}
    />
    <TransitionSeries.Sequence durationInFrames={30}>
      <Page2 />
    </TransitionSeries.Sequence>
  </TransitionSeries>
</Sequence>
```

2. **Text Animations** (Easy)
```tsx
import { TextReveal } from '@remotion/animated';

<TextReveal text="Hello World" />
```

3. **Audio Mixing** (Medium)
```tsx
// Multiple audio tracks
<Audio src={voiceUrl} volume={1.0} />
<Audio src={musicUrl} volume={0.3} />
```

4. **3D Effects** (Advanced)
```tsx
import { ThreeCanvas } from '@remotion/three';

<ThreeCanvas>
  {/* Your 3D scene */}
</ThreeCanvas>
```

## 📊 Performance

### Render Times (Estimate)
- 30-second video: ~2-3 minutes
- 60-second video: ~4-6 minutes
- 5-minute video: ~20-30 minutes

### Optimization Tips

1. **Use `--concurrency`**
```bash
# Faster rendering (uses more CPU)
remotion render --concurrency=4
```

2. **Lower quality for previews**
```bash
remotion render --quality=50  # Fast preview
remotion render --quality=100 # Production
```

3. **Cache bundles**
```javascript
// Reuse bundle across renders
const bundleLocation = await bundle(...);
// Use same bundleLocation for multiple renders
```

## 🐛 Troubleshooting

### Issue: "Cannot find module"
**Solution:** Check webpack override in `src/remotion/webpack-override.ts`

### Issue: Animations not working
**Solution:** Make sure you're using Remotion's animation APIs:
- `useCurrentFrame()` for frame number
- `interpolate()` for smooth animations
- `<Sequence>` for timing

### Issue: Slow rendering
**Solution:** 
1. Reduce video quality for testing
2. Increase concurrency
3. Optimize component re-renders

### Issue: Audio out of sync
**Solution:** Use `<Audio>` component, not HTML `<audio>` tag

## 🔄 Integration with Download Endpoint

### Update download-card API

```typescript
// src/app/api/download-card/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cardId = searchParams.get('cardId');
  
  // Call Remotion server instead of composition server
  const response = await fetch('http://localhost:4004/render-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cardId }),
  });
  
  const videoBuffer = await response.arrayBuffer();
  
  return new Response(videoBuffer, {
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment; filename="card-${cardId}.mp4"`,
    },
  });
}
```

## 📚 Resources

- [Remotion Documentation](https://www.remotion.dev/)
- [Remotion Examples](https://github.com/remotion-dev/remotion/tree/main/packages/example)
- [Animation Guide](https://www.remotion.dev/docs/animating)

## 🎉 Benefits Summary

### Why Remotion > Screenshots

1. ✅ **Professional Quality**
   - Same approach as Canva
   - All animations preserved
   - Smooth, polished output

2. ✅ **Developer Experience**
   - Use existing React components
   - Full TypeScript support
   - Visual preview tool

3. ✅ **Flexibility**
   - Easy to add effects
   - Simple timing control
   - Powerful animation APIs

4. ✅ **Maintainability**
   - One codebase for web & video
   - No duplicate template code
   - Easy to update/modify

## 🚦 Next Steps

1. **Start the server**: `npm run start:remotion-server`
2. **Test basic render**: Use curl to render a test video
3. **Preview in studio**: `npm run remotion:preview`
4. **Convert your templates**: Add existing templates to Remotion compositions
5. **Integrate with download**: Update download endpoint to use Remotion server

---

**Questions?** Check the [Remotion docs](https://www.remotion.dev/) or ask for help!
