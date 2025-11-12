/**
 * COMPOSITION-BASED VIDEO EXPORT SERVER
 * Uses timeline model and FFmpeg filter_complex for professional output
 * 
 * Architecture: Timeline → Segments → Composition → Single-Pass Render
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { db } = require('./src/lib/firebaseAdmin');
const { getTemplateById } = require('./src/lib/video-generator-registry');
const { TimelineBuilder } = require('./src/lib/timeline-builder');
const { VideoCompositionEngine } = require('./src/lib/video-composition-engine');

// ============================================
// EXPRESS SERVER
// ============================================

const app = express();
const port = 4003; // New port for composition-based system

app.use(express.json());

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getCardFromFirestore(cardId) {
  const docRef = db.collection('cards').doc(cardId);
  const doc = await docRef.get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);
    
    protocol.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', err => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

// ============================================
// VIDEO GENERATION ENDPOINT
// ============================================

app.post('/generate-video', async (req, res) => {
  const { cardId, url } = req.body;
  console.log(`[COMPOSITION-SERVER] 🎬 Starting video generation for card: ${cardId}`);

  if (!cardId || !url) {
    return res.status(400).send({ error: 'cardId and url are required' });
  }

  let browser;
  const tempDir = path.resolve(__dirname, `temp_composition_${cardId}`);

  try {
    // ============================================
    // STEP 1: LOAD CARD & TEMPLATE DATA
    // ============================================
    console.log('[COMPOSITION-SERVER] 📋 Loading card and template data...');
    const cardData = await getCardFromFirestore(cardId);
    if (!cardData) {
      return res.status(404).send({ error: 'Card not found' });
    }
    
    const template = getTemplateById(cardData.templateId);
    if (!template) {
      return res.status(404).send({ error: 'Template not found' });
    }

    console.log(`[COMPOSITION-SERVER] ✅ Template: ${template.name}`);
    console.log(`[COMPOSITION-SERVER] 📐 Aspect Ratio: ${template.aspectRatio || '16:9'}`);

    // ============================================
    // STEP 2: BUILD TIMELINE
    // ============================================
    console.log('[COMPOSITION-SERVER] 🎞️  Building timeline...');
    const timelineBuilder = new TimelineBuilder(cardData, template);
    const timeline = timelineBuilder.build();
    
    console.log(`[COMPOSITION-SERVER] ✅ Timeline built: ${timeline.segments.length} segments`);
    timeline.segments.forEach((seg, idx) => {
      console.log(`  - Segment ${idx}: ${seg.pageType} (${seg.type})`);
    });

    // Create temp directory
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    // ============================================
    // STEP 3: INITIALIZE COMPOSITION ENGINE
    // ============================================
    const compositionEngine = new VideoCompositionEngine({
      resolution: timeline.resolution,
      fps: timeline.fps,
      videoBitrate: '8000k',
      audioBitrate: '192k',
      preset: 'medium',
      crf: 23
    });

    // ============================================
    // STEP 4: PROCESS SEGMENTS
    // ============================================
    console.log('[COMPOSITION-SERVER] 🎥 Processing segments...');
    
    // Launch browser for screenshots
    console.log('[COMPOSITION-SERVER] 🌐 Launching browser...');
    browser = await puppeteer.launch({ 
      headless: true, 
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ 
      width: timeline.resolution.width, 
      height: timeline.resolution.height,
      deviceScaleFactor: 1
    });

    const processedSegments = [];

    for (let i = 0; i < timeline.segments.length; i++) {
      const segment = timeline.segments[i];
      console.log(`[COMPOSITION-SERVER] Processing segment ${i + 1}/${timeline.segments.length}: ${segment.pageType}`);
      
      let processedPath;
      let actualDuration = segment.duration;

      if (segment.type === 'video' && segment.source) {
        // Download and normalize video
        const videoPath = path.join(tempDir, `segment_${i}_source.mp4`);
        await downloadFile(segment.source, videoPath);
        
        // Get duration
        actualDuration = await compositionEngine.getMediaDuration(videoPath);
        
        // Normalize video
        processedPath = path.join(tempDir, `segment_${i}_processed.mp4`);
        await compositionEngine.normalizeVideoSegment(videoPath, processedPath);
        
        console.log(`[COMPOSITION-SERVER]   ✓ Video normalized (${actualDuration.toFixed(1)}s)`);
        
      } else if (segment.type === 'image' && segment.source) {
        // Download and convert image to video
        const imagePath = path.join(tempDir, `segment_${i}_source.jpg`);
        await downloadFile(segment.source, imagePath);
        
        processedPath = path.join(tempDir, `segment_${i}_processed.mp4`);
        await compositionEngine.convertImageToVideo(imagePath, segment.duration, processedPath);
        
        console.log(`[COMPOSITION-SERVER]   ✓ Image converted (${segment.duration}s)`);
        
      } else if (segment.type === 'rendered_page') {
        // Screenshot page
        const pageUrl = `${url.replace('localhost', '127.0.0.1')}?page=${segment.pageIndex}`;
        await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        
        // Wait for page to be ready
        try {
          await page.waitForFunction('window.isReady === true', { timeout: 10000 });
        } catch (e) {
          console.log(`[COMPOSITION-SERVER]   ⚠️  Page ready signal not found, proceeding anyway`);
        }
        
        const screenshotPath = path.join(tempDir, `segment_${i}_screenshot.png`);
        await page.screenshot({ path: screenshotPath, type: 'png' });
        
        // If segment has audio, get duration from audio
        let audioPath = null;
        if (segment.audioSource) {
          audioPath = path.join(tempDir, `segment_${i}_audio.mp3`);
          await downloadFile(segment.audioSource, audioPath);
          actualDuration = await compositionEngine.getMediaDuration(audioPath);
          console.log(`[COMPOSITION-SERVER]   📏 Detected audio duration: ${actualDuration.toFixed(2)}s`);
        } else {
          actualDuration = segment.duration || 5;
        }
        
        // Create video from screenshot
        processedPath = path.join(tempDir, `segment_${i}_processed.mp4`);
        await compositionEngine.createVideoFromScreenshot(
          screenshotPath,
          actualDuration,
          audioPath,
          processedPath
        );
        
        console.log(`[COMPOSITION-SERVER]   ✓ Page rendered (${actualDuration.toFixed(1)}s)${audioPath ? ' + audio' : ''}`);
      }

      processedSegments.push({
        ...segment,
        duration: actualDuration,
        processedPath
      });
    }

    await browser.close();
    browser = null;

    // ============================================
    // STEP 5: COMPOSE FINAL VIDEO
    // ============================================
    console.log('[COMPOSITION-SERVER] 🎬 Composing final video...');
    const finalPath = path.join(tempDir, 'final.mp4');
    
    await compositionEngine.render(processedSegments, finalPath);

    console.log('[COMPOSITION-SERVER] ✅ Video generation complete!');
    res.sendFile(finalPath);

  } catch (error) {
    console.error('[COMPOSITION-SERVER] ❌ Error:', error);
    res.status(500).send({ error: 'Failed to generate video', details: error.message });
  } finally {
    if (browser) await browser.close();
    
    // Cleanup temp directory after 5 seconds
    if (fs.existsSync(tempDir)) {
      setTimeout(() => {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
          console.log('[COMPOSITION-SERVER] 🧹 Cleaned up temp directory');
        } catch (e) {
          console.error('[COMPOSITION-SERVER] Failed to clean up:', e);
        }
      }, 5000);
    }
  }
});

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'composition-video-server',
    version: '2.0.0',
    architecture: 'timeline-composition'
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(port, () => {
  console.log(`[COMPOSITION-SERVER] 🚀 Composition-Based Video Export Server running on http://localhost:${port}`);
  console.log(`[COMPOSITION-SERVER] 📐 Architecture: Timeline → FFmpeg filter_complex → Single-Pass Render`);
  console.log(`[COMPOSITION-SERVER] ✨ Ready to generate professional-quality videos`);
});
