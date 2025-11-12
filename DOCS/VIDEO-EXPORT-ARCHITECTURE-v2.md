# Video Export Architecture v2.0
## Professional Composition-Based System

---

## Executive Summary

This document presents a complete architectural redesign of the Notewish video export system, replacing the current screenshot-based approach with a professional composition framework that produces CapCut/Canva-quality output.

---

## Current System Analysis

### Problems with Current Implementation

```
┌─────────────────────────────────────────────────────────┐
│           CURRENT FLAWED ARCHITECTURE                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Cover Page     → Screenshot    (static, no animations) │
│  Image Page     → Source Image  (converted to video)    │
│  Video Page     → Source Video  (re-encoded)            │
│  Voice Page     → Screenshot    + Audio (separate)      │
│  Message Page   → Screenshot    + Audio (separate)      │
│  Music Page     → Screenshot    + Audio (separate)      │
│                                                          │
│  Then: FFmpeg Concatenation (another encoding pass)     │
│                                                          │
└─────────────────────────────────────────────────────────┘
                         ↓
              FUNDAMENTAL ISSUES:
         
         ❌ Codec Mismatches → Audio corruption
         ❌ Multiple Encoding Passes → Quality loss
         ❌ Lost Template Animations → Unprofessional
         ❌ No True Composition → Timing errors
         ❌ Lip-sync Problems → Video re-encoding
```

### Root Cause

The system treats video export as "stitching media files together" rather than "composing a timeline with synchronized audio/video layers."

---

## Architecture Options Comparison

### Option 1: FFmpeg filter_complex (Recommended)

**Approach:** Use FFmpeg's advanced filtering and composition capabilities

```javascript
// Pseudo-example of filter_complex approach
ffmpeg -i cover_bg.mp4 -i image1.jpg -i video1.mp4 -i voice.mp3 
  -filter_complex "
    [0:v]scale=1920:1080,fade=in:0:30,fade=out:60:30[v0];
    [1:v]scale=1920:1080,fade=in:0:30,fade=out:120:30[v1];
    [2:v]scale=1920:1080,fade=in:0:30[v2];
    [v0][v1]concat=n=2:v=1:a=0[v01];
    [v01][v2]concat=n=2:v=1:a=0[vout];
    [3:a]volume=1.0[a0];
    [a0]apad[aout]
  " 
  -map "[vout]" -map "[aout]" -shortest output.mp4
```

**Pros:**
- ✅ No new dependencies (FFmpeg already in use)
- ✅ Single-pass rendering (no intermediate files)
- ✅ Professional audio mixing
- ✅ GPU acceleration support
- ✅ Precise timing control
- ✅ Industry-standard tool

**Cons:**
- ⚠️ Complex filter syntax
- ⚠️ Template animations require pre-rendering
- ⚠️ Steeper learning curve

**Best For:** Production systems, maximum quality, cost-sensitive

---

### Option 2: Remotion (React-based)

**Approach:** Render React components directly to video

```tsx
// Remotion composition example
import { Composition, Video, Audio, Img, interpolate } from 'remotion';

export const NoteWishCard = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1]);
  
  return (
    <AbsoluteFill>
      {/* Cover page with fade-in */}
      <Sequence from={0} durationInFrames={90}>
        <div style={{ opacity }}>
          <h1>{title}</h1>
        </div>
      </Sequence>
      
      {/* Video segment */}
      <Sequence from={90} durationInFrames={180}>
        <Video src={videoUrl} />
      </Sequence>
      
      {/* Voice overlay */}
      <Audio src={voiceUrl} startFrom={90} />
    </AbsoluteFill>
  );
};
```

**Pros:**
- ✅ Use existing React templates directly
- ✅ All animations preserved
- ✅ Programmatic control
- ✅ TypeScript support
- ✅ Great developer experience
- ✅ Built-in timeline model

**Cons:**
- ⚠️ Additional dependency (~50MB)
- ⚠️ Requires Lambda/server for rendering
- ⚠️ More complex setup
- ⚠️ Potential licensing costs (free tier exists)

**Best For:** Rich animations, designer-friendly, existing React codebase

---

### Option 3: Hybrid Approach (Remotion + FFmpeg)

**Approach:** Render template animations with Remotion, compose with FFmpeg

```javascript
// Step 1: Render animated template pages with Remotion
const coverVideo = await remotion.render({
  composition: 'CoverPage',
  duration: 3
});

// Step 2: Compose everything with FFmpeg filter_complex
const ffmpegCmd = buildCompositionCommand({
  segments: [
    { type: 'rendered', path: coverVideo, duration: 3 },
    { type: 'source', path: userVideo, duration: 'auto' },
    { type: 'rendered', path: voicePageVideo, duration: 5 }
  ],
  audio: [
    { path: bgMusic, volume: 0.3, start: 0 },
    { path: voiceOver, volume: 1.0, start: 3 }
  ]
});
```

**Pros:**
- ✅ Best of both worlds
- ✅ Maximum flexibility
- ✅ Professional output
- ✅ Template animations preserved

**Cons:**
- ⚠️ Most complex setup
- ⚠️ Two rendering systems

**Best For:** Maximum quality + flexibility, established products

---

## Recommended Solution: FFmpeg filter_complex

Based on the current system's needs and constraints, **Option 1 (FFmpeg filter_complex)** is recommended because:

1. **Already in use** - No new dependencies
2. **Cost-effective** - No licensing fees
3. **Production-ready** - Battle-tested
4. **Sufficient** - Can achieve professional output

### Implementation Strategy

#### Phase 1: Core Composition Engine

```javascript
/**
 * VIDEO COMPOSITION ENGINE
 * Single-pass rendering with proper audio mixing
 */

class VideoCompositionEngine {
  constructor(config) {
    this.resolution = config.resolution;
    this.fps = config.fps || 30;
    this.audioSampleRate = 44100;
    this.audioBitrate = '192k';
    this.videoBitrate = '8000k';
  }

  /**
   * Build FFmpeg filter_complex command for composition
   */
  buildCompositionFilter(timeline) {
    const videoFilters = [];
    const audioFilters = [];
    const inputs = [];
    
    // Process each timeline segment
    timeline.segments.forEach((segment, idx) => {
      inputs.push(segment.source);
      
      // Video processing
      if (segment.type === 'video') {
        videoFilters.push(
          `[${idx}:v]scale=${this.resolution.width}:${this.resolution.height}:` +
          `force_original_aspect_ratio=decrease,` +
          `pad=${this.resolution.width}:${this.resolution.height}:(ow-iw)/2:(oh-ih)/2,` +
          `setsar=1,fps=${this.fps}[v${idx}]`
        );
      } else if (segment.type === 'image') {
        videoFilters.push(
          `[${idx}:v]scale=${this.resolution.width}:${this.resolution.height}:` +
          `force_original_aspect_ratio=decrease,` +
          `pad=${this.resolution.width}:${this.resolution.height}:(ow-iw)/2:(oh-ih)/2,` +
          `setsar=1[v${idx}]`
        );
      }
      
      // Transitions
      if (segment.transition) {
        videoFilters.push(this.buildTransition(segment.transition, idx));
      }
    });
    
    // Audio mixing (all tracks mixed properly)
    timeline.audioTracks.forEach((track, idx) => {
      const inputIdx = inputs.length;
      inputs.push(track.source);
      
      audioFilters.push(
        `[${inputIdx}:a]atrim=start=${track.startTime}:end=${track.endTime},` +
        `volume=${track.volume},` +
        `adelay=${track.delay}|${track.delay}[a${idx}]`
      );
    });
    
    // Mix all audio
    const audioMixFilter = audioFilters.map((_, i) => `[a${i}]`).join('') +
      `amix=inputs=${audioFilters.length}:duration=longest[aout]`;
    
    // Concatenate video
    const videoConcat = videoFilters.map((_, i) => `[v${i}]`).join('') +
      `concat=n=${videoFilters.length}:v=1:a=0[vout]`;
    
    return {
      inputs,
      filterComplex: [...videoFilters, ...audioFilters, audioMixFilter, videoConcat].join(';'),
      outputMaps: ['-map', '[vout]', '-map', '[aout]']
    };
  }

  /**
   * Render composition to video
   */
  async render(timeline, outputPath) {
    const composition = this.buildCompositionFilter(timeline);
    
    const inputArgs = composition.inputs.flatMap(input => ['-i', input]);
    
    const ffmpegArgs = [
      ...inputArgs,
      '-filter_complex', composition.filterComplex,
      ...composition.outputMaps,
      '-c:v', 'libx264',
      '-preset', 'slow',
      '-crf', '18',
      '-b:v', this.videoBitrate,
      '-c:a', 'aac',
      '-b:a', this.audioBitrate,
      '-ar', this.audioSampleRate.toString(),
      '-ac', '2',
      '-movflags', '+faststart',
      '-y',
      outputPath
    ];
    
    return this.executeFFmpeg(ffmpegArgs);
  }
}
```

#### Phase 2: Template Animation Handling

Since screenshots lose animations, we have two sub-options:

**Option A: Pre-render Template Animations**

```javascript
/**
 * Pre-render template pages as short video clips
 * Use Puppeteer to record the page with animations
 */
async function renderTemplatePage(pageUrl, duration) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto(pageUrl);
  await page.waitForFunction('window.isReady === true');
  
  // Record page with animations using Puppeteer video recording
  // OR use Puppeteer + FFmpeg screen recording
  const videoPath = await recordPageAnimation(page, duration);
  
  await browser.close();
  return videoPath;
}
```

**Option B: Simplify Template Exports (Recommended for MVP)**

```javascript
/**
 * For export, use simplified static designs with CSS transitions
 * FFmpeg can handle basic transitions (fade, wipe, etc.)
 */
const exportDesigns = {
  cover: {
    layout: 'centered',
    background: 'gradient',
    transitions: { in: 'fade', out: 'fade' }
  },
  voice: {
    layout: 'waveform',
    background: 'gradient',
    transitions: { in: 'fade', out: 'fade' }
  },
  // ... more page designs
};
```

#### Phase 3: Timeline Model

```typescript
/**
 * TIMELINE DATA STRUCTURE
 * Represents the complete video composition
 */
interface Timeline {
  duration: number;
  fps: number;
  resolution: { width: number; height: number };
  
  segments: VideoSegment[];
  audioTracks: AudioTrack[];
  
  metadata: {
    templateId: string;
    cardId: string;
    aspectRatio: string;
  };
}

interface VideoSegment {
  type: 'video' | 'image' | 'rendered_page';
  source: string;
  startTime: number;
  duration: number;
  
  // Visual effects
  transition?: {
    type: 'fade' | 'wipe' | 'dissolve';
    duration: number;
  };
  
  overlay?: {
    type: 'text' | 'image';
    content: string;
    position: { x: number; y: number };
  };
}

interface AudioTrack {
  type: 'voice' | 'music' | 'sfx';
  source: string;
  startTime: number;
  endTime: number;
  volume: number;
  fadeIn?: number;
  fadeOut?: number;
}
```

---

## Implementation Plan

### Week 1: Core Engine
- [ ] Implement `VideoCompositionEngine` class
- [ ] Build timeline data structure
- [ ] Create FFmpeg filter_complex builder
- [ ] Add basic transitions (fade, crossfade)
- [ ] Test with simple compositions

### Week 2: Template Integration
- [ ] Analyze which templates need animations
- [ ] Implement simplified export designs
- [ ] Add template-to-timeline converter
- [ ] Test with all template types

### Week 3: Audio System
- [ ] Implement proper audio mixing
- [ ] Add volume normalization
- [ ] Handle background music + voiceover
- [ ] Add audio ducking (lower music when voice plays)

### Week 4: Polish & Testing
- [ ] Add error handling
- [ ] Optimize rendering performance
- [ ] Test with various media formats
- [ ] Quality assurance (codec compatibility, playback)

---

## Migration Strategy

### Parallel System Approach

```
┌──────────────────────────────────────┐
│    OLD SYSTEM (screenshot-server)    │
│         Keep as fallback             │
└──────────────────────────────────────┘
              ↓
┌──────────────────────────────────────┐
│  NEW SYSTEM (composition-server)     │
│      Gradually roll out              │
└──────────────────────────────────────┘
```

1. **Phase 1**: Build new system alongside old
2. **Phase 2**: Enable for specific templates (A/B test)
3. **Phase 3**: Full rollout once stable
4. **Phase 4**: Deprecate old system

---

## Expected Outcomes

### Quality Improvements

```
BEFORE (Current System):
- Audio corruption: ❌ Common
- Quality loss: ❌ Multiple encoding passes
- Animations: ❌ Lost in screenshots
- Lip-sync: ❌ Timing errors
- Output: ⚠️ Amateur quality

AFTER (Composition System):
- Audio corruption: ✅ Eliminated (single-pass)
- Quality loss: ✅ Minimal (one encode)
- Animations: ✅ Preserved (rendered or native)
- Lip-sync: ✅ Perfect (source media)
- Output: ✅ Professional quality
```

### Performance

- **Rendering time**: Potentially faster (single-pass vs multi-pass)
- **Storage**: Less temporary files
- **CPU usage**: More efficient (one FFmpeg process)

---

## Alternative: Future-Proofing with Remotion

If budget allows and animations are critical:

```javascript
// Future migration path to Remotion
import { bundle } from '@remotion/bundler';
import { renderMedia } from '@remotion/renderer';

async function renderWithRemotion(cardData, templateId) {
  const composition = await bundle({
    entryPoint: `./src/remotion/templates/${templateId}.tsx`,
    webpackOverride: (config) => config,
  });

  const outputPath = await renderMedia({
    composition,
    inputProps: cardData,
    codec: 'h264',
    outputLocation: `output/${cardData.id}.mp4`,
  });

  return outputPath;
}
```

This keeps the door open for upgrading to full React-based rendering later.

---

## Conclusion

The recommended architecture uses **FFmpeg filter_complex** for professional single-pass video composition, eliminating the fundamental flaws of the current screenshot-based approach. This will produce output comparable to CapCut/Canva while maintaining cost-effectiveness and leveraging existing infrastructure.

**Next Steps:**
1. Review and approve this architecture
2. Begin Week 1 implementation (Core Engine)
3. Set up testing framework
4. Plan template migration strategy
