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
  async render(processedSegments, outputPath) {
    console.log('[COMPOSITION] Starting single-pass render...');
    console.log(`[COMPOSITION] Segments: ${processedSegments.length}`);
    
    // Build filter_complex
    const filterComplex = this.filterBuilder.buildFilterComplex(processedSegments);
    
    console.log('[COMPOSITION] Filter complex:', filterComplex);
    
    // Build FFmpeg command
    const command = this.buildFFmpegCommand(processedSegments, filterComplex, outputPath);
    
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
   * Build complete FFmpeg command
   */
  buildFFmpegCommand(processedSegments, filterComplex, outputPath) {
    const inputArgs = processedSegments.map(seg => `-i "${seg.processedPath}"`).join(' ');
    
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
    const cmd = `"${ffmpeg}" -i "${filepath}" -f null - 2>&1`;
    
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
      console.error('[COMPOSITION] Failed to get duration for', filepath);
      console.error('[COMPOSITION] Error details:', error.message);
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
      // EXPLICITLY set duration to match audio - don't rely on -shortest
      cmd += `-loop 1 -i "${screenshotPath}" -i "${audioPath}" ` +
        `-t ${duration} ` +
        `-vf "scale=${this.resolution.width}:${this.resolution.height}:force_original_aspect_ratio=decrease,pad=${this.resolution.width}:${this.resolution.height}:(ow-iw)/2:(oh-ih)/2,fps=${this.fps}" ` +
        `-c:v libx264 -preset ultrafast -crf ${this.crf} ` +
        `-c:a aac -b:a ${this.audioBitrate} -ar 44100 -ac 2 ` +
        `-pix_fmt yuv420p ` +
        `-y "${outputPath}"`;
    } else {
      cmd += `-loop 1 -i "${screenshotPath}" ` +
        `-f lavfi -i anullsrc=r=44100:cl=stereo ` +
        `-t ${duration} ` +
        `-vf "scale=${this.resolution.width}:${this.resolution.height}:force_original_aspect_ratio=decrease,pad=${this.resolution.width}:${this.resolution.height}:(ow-iw)/2:(oh-ih)/2,fps=${this.fps}" ` +
        `-c:v libx264 -preset ultrafast -crf ${this.crf} ` +
        `-c:a aac -b:a ${this.audioBitrate} ` +
        `-pix_fmt yuv420p ` +
        `-y "${outputPath}"`;
    }
    
    await execAsync(cmd);
    return outputPath;
  }
}

module.exports = { VideoCompositionEngine };
