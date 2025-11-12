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
  buildFilterComplex(processedSegments) {
    const filters = [];
    const videoLabels = [];
    const audioLabels = [];
    
    // Process video and audio segments separately
    processedSegments.forEach((segment, idx) => {
      const videoFilter = this.buildVideoFilter(segment, idx);
      const audioFilter = this.buildAudioFilterForSegment(segment, idx);
      
      filters.push(videoFilter);
      filters.push(audioFilter);
      
      videoLabels.push(`[v${idx}]`);
      audioLabels.push(`[a${idx}]`);
    });
    
    // Concatenate videos and audio - NO FADES, INSTANT CUTS
    const concatFilter = this.buildConcatFilter(videoLabels, audioLabels);
    filters.push(concatFilter);
    
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
    
    // NO FADE EFFECTS - Instant cuts, no black screens
    
    filter += `[v${idx}]`;
    
    return filter;
  }

  /**
   * Build audio filter for a segment
   */
  buildAudioFilterForSegment(segment, idx) {
    // Simply copy audio stream from each segment
    return `[${idx}:a]acopy[a${idx}]`;
  }

  /**
   * Build concat filter for videos and audio
   */
  buildConcatFilter(videoLabels, audioLabels) {
    // Interleave video and audio labels: [v0][a0][v1][a1][v2][a2]...
    const interleavedInputs = [];
    for (let i = 0; i < videoLabels.length; i++) {
      interleavedInputs.push(videoLabels[i]);
      interleavedInputs.push(audioLabels[i]);
    }
    return `${interleavedInputs.join('')}concat=n=${videoLabels.length}:v=1:a=1[vout][aout]`;
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
    if (track.fadeOut && track.endTime) {
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
}

module.exports = { FFmpegFilterBuilder };
