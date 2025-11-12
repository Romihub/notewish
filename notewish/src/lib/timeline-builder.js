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
    
    const totalDuration = segments.reduce((sum, seg) => sum + (seg.duration || 0), 0);
    
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
      pageIndex: 0,
      transition: { type: 'fade', duration: 0.5 }
    });
    currentTime += 3;
    
    let pageIndex = 1;
    
    // Image page (if present)
    if (this.cardData.assets.imageUrl && this.template.supports.image) {
      segments.push({
        type: 'image',
        source: this.cardData.assets.imageUrl,
        startTime: currentTime,
        duration: 5,
        pageType: 'image',
        pageIndex: pageIndex++,
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
        pageIndex: pageIndex++,
        transition: { type: 'fade', duration: 0.5 }
      });
      // Duration added dynamically
    }
    
    // Voice page (if present)
    if (this.cardData.assets.voiceUrl && this.template.supports.voice) {
      segments.push({
        type: 'rendered_page',
        source: null, // Will be screenshot
        startTime: currentTime,
        duration: null, // Will be determined from audio
        pageType: 'voice',
        pageIndex: pageIndex++,
        audioSource: this.cardData.assets.voiceUrl,
        transition: { type: 'fade', duration: 0.5 }
      });
    }
    
    // Message page (if present)
    if (this.hasUserMessage() && this.template.supports.message) {
      segments.push({
        type: 'rendered_page',
        source: null,
        startTime: currentTime,
        duration: 10, // Fixed 10 seconds - enough time to read
        pageType: 'message',
        pageIndex: pageIndex++,
        audioSource: null, // No audio for message page - keep it simple
        transition: { type: 'fade', duration: 0.3 }
      });
      currentTime += 10;
    }
    
    // Music page (if present)
    if (this.cardData.assets.songUrl && this.template.supports.music) {
      segments.push({
        type: 'rendered_page',
        source: null,
        startTime: currentTime,
        duration: null, // Will be determined from audio
        pageType: 'music',
        pageIndex: pageIndex++,
        audioSource: this.cardData.assets.songUrl,
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
    
    // Note: Audio is now handled per-segment
    // Background music mixing will be done in the composition phase
    
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
}

module.exports = { TimelineBuilder };
