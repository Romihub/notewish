# Video Composition Engine - Implementation Guide

This guide provides step-by-step implementation details for the new FFmpeg filter_complex-based video composition system.

---

## Quick Start

### 1. Install Dependencies (Already Available)
```bash
# All dependencies already installed in package.json
# - ffmpeg-static: ✓
# - puppeteer: ✓
# - express: ✓
```

### 2. File Structure
```
notewish/
├── src/
│   └── lib/
│       ├── video-composition-engine.js    [NEW]
│       ├── timeline-builder.js            [NEW]
│       └── ffmpeg-filter-builder.js       [NEW]
├── composition-server.js                  [NEW]
└── VIDEO-EXPORT-ARCHITECTURE-v2.md
```

---

## Core Implementation

### Step 1: Timeline Builder

Create `src/lib/timeline-builder.js`:

```javascript
/**
 * TIMELINE BUILDER
 * Converts card data into a timeline structure for composition
 */

class TimelineBuilder {
  constructor(cardData, template) {
    this.cardData = cardData;
    this.template = template;
  }

  /**
   * Build complete timeline from card data
   */
  build() {
    const resolution = this.getResolution();
    const segments = this.buildSegments();
    const audioTracks = this.buildAudioTracks();
    
    const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
    
    return {
      duration: totalDuration,
      fps: 30,
      resolution,
      segments,
      audioTracks,
      metadata: {
        templateId: this.cardData.templateId,
        cardId: this.cardData.id,
        aspectRatio: this.template.aspectRatio || '16:9'
      }
    };
  }

  /**
   * Build video segments
   */
  buildSegments() {
    const segments = [];
    let currentTime = 0;
    
    // Cover page (always present)
    segments.push({
      type: 'rendered_page',
      source: null, // Will be screenshot
      startTime: currentTime,
      duration: 3,
      pageType: 'cover',
      transition: { type: 'fade', duration: 0.5 }
    });
    currentTime += 3;
    
    // Image page (if present)
    if (this.cardData.assets.imageUrl && this.template.supports.image) {
      segments.push({
        type: 'image',
        source: this.cardData.assets.imageUrl,
        startTime: currentTime,
        duration: 5,
        pageType: 'image',
        transition: { type: 'fade', duration: 0.5 }
      });
      currentTime += 5;
    }
    
    // Video page (if present)
    if (this.cardData.assets.videoUrl && this.template.supports.video) {
      segments.push({
        type: 'video',
        source: this.cardData.assets.videoUrl,
        startTime: currentTime,
        duration: null, // Will be determined from source
        pageType: 'video',
        transition: { type: 'fade', duration: 0.5 }
      });
      // Duration added dynamically
    }
    
    // Voice page (if present)
    if (this.cardData.assets.voiceUrl && this.template.supports.voice) {
      const voiceDuration = null; // Will be determined from audio
      segments.push({
        type: 'rendered_page',
        source: null, // Will be screenshot
        startTime: currentTime,
        duration: voiceDuration,
        pageType: 'voice',
        transition: { type: 'fade', duration: 0.5 }
      });
    }
    
    // Message page (if present)
    if (this.hasUserMessage() && this.template.supports.message) {
      segments.push({
        type: 'rendered_page',
        source: null,
        startTime: currentTime,
        duration: 6,
        pageType: 'message',
        transition: { type: 'fade', duration: 0.5 }
      });
      currentTime += 6;
    }
    
    // Music page (if present)
    if (this.cardData.assets.songUrl && this.template.supports.music) {
      const musicDuration = null; // Will be determined from audio
      segments.push({
        type: 'rendered_page',
        source: null,
        startTime: currentTime,
        duration: musicDuration,
        pageType: 'music',
        transition: { type: 'fade', duration: 0.5 }
      });
    }
    
    return segments;
  }

  /**
   * Build audio tracks
   */
  buildAudioTracks() {
    const tracks = [];
    let currentTime = 0;
    
    // Skip cover (3s)
    currentTime = 3;
    
    // Background music (if present, starts from image page)
    if (this.cardData.assets.songUrl) {
      tracks.push({
        type: 'music',
        source: this.cardData.assets.songUrl,
        startTime: currentTime,
        endTime: null, // Till end
        volume: 0.3, // Lower for background
        fadeIn: 1,
        fadeOut: 2
      });
    }
    
    // Voice overlay (if present)
    if (this.cardData.assets.voiceUrl) {
      const voiceStartTime = this.getVoiceStartTime();
      tracks.push({
        type: 'voice',
        source: this.cardData.assets.voiceUrl,
        startTime: voiceStartTime,
        endTime: null, // Auto from duration
        volume: 1.0,
        fadeIn: 0.2,
        fadeOut: 0.2
      });
    }
    
    return tracks;
  }

  /**
   * Get resolution from template
   */
  getResolution() {
    const aspectRatios = {
      '16:9': { width: 1920, height: 1080 },
      '9:16': { width: 1080, height: 1920 },
      '1:1': { width: 1080, height: 1080 },
      '4:3': { width: 1440, height: 1080 },
      '3:4': { width: 1080, height: 1440 }
    };
    
    return aspectRatios[this.template.aspectRatio] || aspectRatios['16:9'];
  }

  /**
   * Check if user has a message
   */
  hasUserMessage() {
    return this.cardData.assets.messageVariations && 
           this.cardData.assets.messageVariations.length > 0;
  }

  /**
   * Calculate when voice should start
   */
  getVoiceStartTime() {
    let time = 3; // After cover
    if (this.cardData.assets.imageUrl) time += 5;
    if (this.cardData.assets.videoUrl) time += 10; // Estimate
    return time;
  }
}

module.exports = { TimelineBuilder };
```

---

### Step 2: FFmpeg Filter Builder

Create `src/lib/ffmpeg-filter-builder.js`:

```javascript
/**
 * FFMPEG FILTER BUILDER
 * Constructs filter_complex commands for video composition
 */

class FFmpegFilterBuilder {
  constructor(resolution, fps = 30) {
    this.resolution = resolution;
    this.fps = fps;
  }

  /**
   * Build complete filter_complex for timeline
   */
  buildFilterComplex(timeline, processedSegments) {
    const filters = [];
    const videoLabels = [];
    const audioLabels = [];
    
    // Process video segments
    processedSegments.forEach((segment, idx) => {
      const videoFilter = this.buildVideoFilter(segment, idx);
      filters.push(videoFilter);
      videoLabels.push(`[v${idx}]`);
    });
    
    // Concatenate videos with transitions
    const concatFilter = this.buildConcatFilter(videoLabels);
    filters.push(concatFilter);
    
    // Process audio tracks
    timeline.audioTracks.forEach((track, idx) => {
      const audioFilter = this.buildAudioFilter(track, idx, processedSegments.length + idx);
      filters.push(audioFilter);
      audioLabels.push(`[a${idx}]`);
    });
    
    // Mix audio
    if (audioLabels.length > 0) {
      const audioMixFilter = this.buildAudioMixFilter(audioLabels);
      filters.push(audioMixFilter);
    } else {
      // Silent audio if no audio tracks
      filters.push('anullsrc=r=44100:cl=stereo[aout]');
    }
    
    return filters.join('; ');
  }

  /**
   * Build video filter for a segment
   */
  buildVideoFilter(segment, idx) {
    const { width, height } = this.resolution;
    
    let filter = `[${idx}:v]`;
    
    // Scale and pad
    filter += `scale=${width}:${height}:force_original_aspect_ratio=decrease,`;
    filter += `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,`;
    filter += `setsar=1`;
    
    // Add FPS for images
    if (segment.type === 'image' || segment.type === 'screenshot') {
      filter += `,fps=${this.fps}`;
    }
    
    // Add fade transition
    if (segment.transition) {
      const fadeDuration = Math.floor(segment.transition.duration * this.fps);
      filter += `,fade=t=in:st=0:d=${segment.transition.duration}`;
      filter += `,fade=t=out:st=${segment.duration - segment.transition.duration}:d=${segment.transition.duration}`;
    }
    
    filter += `[v${idx}]`;
    
    return filter;
  }

  /**
   * Build concat filter for videos
   */
  buildConcatFilter(videoLabels) {
    return `${videoLabels.join('')}concat=n=${videoLabels.length}:v=1:a=0[vout]`;
  }

  /**
   * Build audio filter for a track
   */
  buildAudioFilter(track, trackIdx, inputIdx) {
    let filter = `[${inputIdx}:a]`;
    
    // Volume adjustment
    filter += `volume=${track.volume}`;
    
    // Fade in/out
    if (track.fadeIn) {
      filter += `,afade=t=in:st=0:d=${track.fadeIn}`;
    }
    if (track.fadeOut) {
      filter += `,afade=t=out:st=${track.endTime - track.fadeOut}:d=${track.fadeOut}`;
    }
    
    // Time trimming
    if (track.startTime !== undefined && track.endTime !== undefined) {
      filter += `,atrim=start=${track.startTime}:end=${track.endTime}`;
    }
    
    // Delay (to sync with video)
    const delayMs = Math.floor(track.startTime * 1000);
    filter += `,adelay=${delayMs}|${delayMs}`;
    
    filter += `[a${trackIdx}]`;
    
    return filter;
  }

  /**
   * Build audio mix filter
   */
  buildAudioMixFilter(audioLabels) {
    if (audioLabels.length === 1) {
      return `${audioLabels[0]}acopy[aout]`;
    }
    
    return `${audioLabels.join('')}amix=inputs=${audioLabels.length}:duration=longest:normalize=0[aout]`;
  }

  /**
   * Build silent video filter (for pages without video)
   */
  buildSilentVideoFilter(duration, color = 'black') {
    const { width, height } = this.resolution;
    return `color=c=${color}:s=${width}x${height}:d=${duration}:r=${this.fps}`;
  }
}

module.exports = { FFmpegFilterBuilder };
```

---

### Step 3: Video Composition Engine

Create `src/lib/video-composition-engine.js`:

```javascript
/**
 * VIDEO COMPOSITION ENGINE
 * Single-pass video rendering with proper composition
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('ffmpeg-static');
const { FFmpegFilterBuilder } = require('./ffmpeg-filter-builder');

const execAsync = promisify(exec);

class VideoCompositionEngine {
  constructor(config = {}) {
    this.resolution = config.resolution || { width: 1920, height: 1080 };
    this.fps = config.fps || 30;
    this.videoBitrate = config.videoBitrate || '8000k';
    this.audioBitrate = config.audioBitrate || '192k';
    this.audioSampleRate = config.audioSampleRate || 44100;
    this.preset = config.preset || 'medium';
    this.crf = config.crf || 23;
    
    this.filterBuilder = new FFmpegFilterBuilder(this.resolution, this.fps);
  }

  /**
   * Main render function
   */
  async render(timeline, segments, outputPath) {
    console.log('[COMPOSITION] Starting single-pass render...');
    
    // Build inputs list
    const inputs = this.buildInputsList(segments, timeline.audioTracks);
    
    // Build filter_complex
    const filterComplex = this.filterBuilder.buildFilterComplex(timeline, segments);
    
    console.log('[COMPOSITION] Filter complex:', filterComplex);
    
    // Build FFmpeg command
    const command = this.buildFFmpegCommand(inputs, filterComplex, outputPath);
    
    console.log('[COMPOSITION] Executing FFmpeg...');
    
    // Execute
    try {
      const { stdout, stderr } = await execAsync(command, { 
        maxBuffer: 10 * 1024 * 1024 
      });
      
      console.log('[COMPOSITION] ✓ Render complete');
      return { success: true, outputPath };
      
    } catch (error) {
      console.error('[COMPOSITION] ✗ Render failed:', error.message);
      throw error;
    }
  }

  /**
   * Build inputs list for FFmpeg
   */
  buildInputsList(segments, audioTracks) {
    const inputs = [];
    
    // Video/image inputs
    segments.forEach(segment => {
      inputs.push({ type: 'file', path: segment.processedPath });
    });
    
    // Audio inputs
    audioTracks.forEach(track => {
      inputs.push({ type: 'file', path: track.source });
    });
    
    return inputs;
  }

  /**
   * Build complete FFmpeg command
   */
  buildFFmpegCommand(inputs, filterComplex, outputPath) {
    const inputArgs = inputs.map(input => `-i "${input.path}"`).join(' ');
    
    const command = `"${ffmpeg}" ${inputArgs} ` +
      `-filter_complex "${filterComplex}" ` +
      `-map "[vout]" -map "[aout]" ` +
      `-c:v libx264 ` +
      `-preset ${this.preset} ` +
      `-crf ${this.crf} ` +
      `-b:v ${this.videoBitrate} ` +
      `-c:a aac ` +
      `-b:a ${this.audioBitrate} ` +
      `-ar ${this.audioSampleRate} ` +
      `-ac 2 ` +
      `-movflags +faststart ` +
      `-y "${outputPath}"`;
    
    return command;
  }

  /**
   * Get media duration
   */
  async getMediaDuration(filepath) {
    const cmd = `"${ffmpeg}" -i "${filepath}" 2>&1`;
    
    try {
      const { stdout, stderr } = await execAsync(cmd);
      const output = stdout + stderr;
      const match = output.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.?\d*)/);
      
      if (match) {
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const seconds = parseFloat(match[3]);
        return hours * 3600 + minutes * 60 + seconds;
      }
      
      throw new Error('Could not determine duration');
    } catch (error) {
      console.error('[COMPOSITION] Failed to get duration:', error);
      return 5; // Default fallback
    }
  }

  /**
   * Convert image to video segment
   */
  async convertImageToVideo(imagePath, duration, outputPath) {
    const cmd = `"${ffmpeg}" ` +
      `-loop 1 -i "${imagePath}" ` +
      `-f lavfi -i anullsrc=r=44100:cl=stereo ` +
      `-t ${duration} ` +
      `-vf "scale=${this.resolution.width}:${this.resolution.height}:force_original_aspect_ratio=decrease,pad=${this.resolution.width}:${this.resolution.height}:(ow-iw)/2:(oh-ih)/2,fps=${this.fps}" ` +
      `-c:v libx264 -preset ultrafast -crf ${this.crf} ` +
      `-c:a aac -b:a ${this.audioBitrate} ` +
      `-shortest -pix_fmt yuv420p ` +
      `-y "${outputPath}"`;
    
    await execAsync(cmd);
    return outputPath;
  }

  /**
   * Normalize video segment
   */
  async normalizeVideoSegment(videoPath, outputPath) {
    const cmd = `"${ffmpeg}" ` +
      `-i "${videoPath}" ` +
      `-vf "scale=${this.resolution.width}:${this.resolution.height}:force_original_aspect_ratio=decrease,pad=${this.resolution.width}:${this.resolution.height}:(ow-iw)/2:(oh-ih)/2,fps=${this.fps}" ` +
      `-c:v libx264 -preset ultrafast -crf ${this.crf} ` +
      `-c:a aac -b:a ${this.audioBitrate} -ar 44100 -ac 2 ` +
      `-y "${outputPath}"`;
    
    await execAsync(cmd);
    return outputPath;
  }

  /**
   * Create video from screenshot with optional audio
   */
  async createVideoFromScreenshot(screenshotPath, duration, audioPath, outputPath) {
    let cmd = `"${ffmpeg}" `;
    
    if (audioPath) {
      cmd += `-loop 1 -i "${screenshotPath}" -i "${audioPath}" ` +
        `-vf "scale=${this.resolution.width}:${this.resolution.height}:force_original_aspect_ratio=decrease,pad=${this.resolution.width}:${this.resolution.height}:(ow-iw)/2:(oh-ih)/2,fps=${this.fps}" ` +
        `-c:v libx264 -preset ultrafast -crf ${this.crf} ` +
        `-c:a aac -b:a ${this.audioBitrate} -ar 44100 -ac 2 ` +
        `-shortest -pix_fmt yuv420p ` +
        `-y "${outputPath}"`;
    } else {
      cmd += `-loop 1 -i "${screenshotPath}" ` +
        `-f lavfi -i anullsrc=r=44100:cl=stereo ` +
        `-t ${duration} ` +
        `-vf "scale=${this.resolution.width}:${this.resolution.height}:force_original_aspect_ratio=decrease,pad=${this.resolution.width}:${this.resolution.height}:(ow-iw)/2:(oh-ih)/2,fps=${this.fps}" ` +
        `-c:v libx264 -preset ultrafast -crf ${this.crf} ` +
        `-c:a aac -b:a ${this.audioBitrate} ` +
        `-shortest -pix_fmt yuv420p ` +
        `-y "${outputPath}"`;
    }
    
    await execAsync(cmd);
    return outputPath;
  }
}

module.exports = { VideoCompositionEngine };
```

---

## Next Steps

1. **Test the Timeline Builder** - Create a test script to build timelines from sample card data
2. **Test the Filter Builder** - Verify filter_complex syntax with simple examples
3. **Integrate with composition-server.js** - Create new Express server using these modules
4. **Run parallel testing** - Keep old system running while testing new one

## Testing Commands

```bash
# Test timeline building
node test-timeline-builder.js

# Test filter generation
node test-filter-builder.js

# Test composition engine
node test-composition-engine.js

# Run composition server
node composition-server.js
```

## Expected Benefits

✅ **Single-pass rendering** - No intermediate files, no quality loss  
✅ **Proper audio mixing** - No "ke ke ke" corruption  
✅ **Perfect sync** - Timeline-based composition  
✅ **Professional output** - Industry-standard FFmpeg filters  
✅ **Maintainable** - Modular, testable architecture
