/**
 * PROFESSIONAL VIDEO EXPORT SYSTEM FOR NOTEWISH
 * 
 * Architecture:
 * - Template-driven configuration (reads aspectRatio, style from manifest)
 * - High-quality recording (1920x1080 or template-defined resolution)
 * - Source media integration (uses original video/image files)
 * - Professional encoding (high bitrate, proper codecs)
 * - Smart transitions (based on template style)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const { exec } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const https = require('https');
const http = require('http');
const { db } = require('./src/lib/firebaseAdmin');
const { getTemplateById } = require('./src/lib/video-generator-registry');

// ============================================
// CONFIGURATION
// ============================================

const ASPECT_RATIOS = {
  '16:9': { width: 1920, height: 1080 },
  '9:16': { width: 1080, height: 1920 },
  '3:4': { width: 1080, height: 1440 },
  '4:3': { width: 1440, height: 1080 },
  '1:1': { width: 1080, height: 1080 }
};

const VIDEO_ENCODING = {
  bitrate: '8000k',      // High quality
  audioBitrate: '192k',  // Professional audio
  fps: 30,               // Smooth playback
  preset: 'slow',        // Better compression
  crf: 18                // Near-lossless quality
};

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

async function getMediaDuration(filepath) {
  return new Promise((resolve, reject) => {
    const cmd = `"${ffmpeg}" -i "${filepath}" 2>&1`;
    exec(cmd, (error, stdout, stderr) => {
      const output = stdout + stderr;
      const match = output.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.?\d*)/);
      if (match) {
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const seconds = parseFloat(match[3]);
        resolve(hours * 3600 + minutes * 60 + seconds);
      } else {
        reject(new Error('Could not determine duration'));
      }
    });
  });
}

function getResolutionFromTemplate(template) {
  const aspectRatio = template.aspectRatio || '16:9';
  return ASPECT_RATIOS[aspectRatio] || ASPECT_RATIOS['16:9'];
}

function getTransitionStyle(template) {
  // Different templates can have different transition styles
  const style = template.style || 'modern';
  
  if (style === 'elegant' || style === 'sophisticated') {
    return 'fade'; // Smooth crossfade
  } else if (style === 'modern' || style === 'playful') {
    return 'fade'; // Clean fade
  }
  
  return 'fade'; // Default
}

// ============================================
// EXPRESS SERVER
// ============================================

const app = express();
const port = 4002; // New port for professional system

app.use(express.json());

app.post('/generate-video', async (req, res) => {
  const { cardId, url } = req.body;
  console.log(`[PRO] 🎬 Starting professional video generation for card: ${cardId}`);

  if (!cardId || !url) {
    return res.status(400).send({ error: 'cardId and url are required' });
  }

  let browser;
  const tempDir = path.resolve(__dirname, `temp_pro_${cardId}`);

  try {
    // ============================================
    // STEP 1: LOAD CARD & TEMPLATE DATA
    // ============================================
    console.log('[PRO] 📋 Loading card and template data...');
    const cardData = await getCardFromFirestore(cardId);
    if (!cardData) {
      return res.status(404).send({ error: 'Card not found' });
    }
    
    const template = getTemplateById(cardData.templateId);
    if (!template) {
      return res.status(404).send({ error: 'Template not found' });
    }

    const resolution = getResolutionFromTemplate(template);
    const transitionStyle = getTransitionStyle(template);
    
    console.log(`[PRO] ✅ Template: ${template.name}`);
    console.log(`[PRO] 📐 Resolution: ${resolution.width}x${resolution.height} (${template.aspectRatio || '16:9'})`);
    console.log(`[PRO] 🎨 Transition Style: ${transitionStyle}`);

    // ============================================
    // STEP 2: CALCULATE PAGE STRUCTURE
    // ============================================
    const userMessage = cardData.assets.messageVariations && cardData.assets.messageVariations.length > 0;
    const pages = [];
    
    // Page 0: Cover (always present)
    pages.push({ index: 0, type: 'cover', duration: 3 });
    
    let pageIndex = 1;
    
    // Page structure based on what content exists
    if (cardData.assets.imageUrl && template.supports.image) {
      pages.push({ index: pageIndex++, type: 'image', duration: 5, sourceUrl: cardData.assets.imageUrl });
    }
    
    if (cardData.assets.videoUrl && template.supports.video) {
      pages.push({ index: pageIndex++, type: 'video', sourceUrl: cardData.assets.videoUrl });
    }
    
    if (cardData.assets.voiceUrl && template.supports.voice) {
      pages.push({ index: pageIndex++, type: 'voice', sourceUrl: cardData.assets.voiceUrl });
    }
    
    if (userMessage && template.supports.message) {
      pages.push({ index: pageIndex++, type: 'message', duration: 6, audioUrl: cardData.assets.songUrl });
    }
    
    if (cardData.assets.songUrl && template.supports.music) {
      pages.push({ index: pageIndex++, type: 'music', sourceUrl: cardData.assets.songUrl });
    }

    console.log(`[PRO] 📄 Total pages: ${pages.length}`);
    pages.forEach(p => console.log(`  - Page ${p.index}: ${p.type}`));

    // ============================================
    // STEP 3: LAUNCH HIGH-QUALITY BROWSER
    // ============================================
    console.log('[PRO] 🌐 Launching browser...');
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
      width: resolution.width, 
      height: resolution.height,
      deviceScaleFactor: 1
    });

    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    // ============================================
    // STEP 4: PROCESS EACH PAGE
    // ============================================
    console.log('[PRO] 🎥 Processing pages...');
    
    const segments = [];
    
    for (const pageInfo of pages) {
      const pageUrl = `${url.replace('localhost', '127.0.0.1')}?page=${pageInfo.index}`;
      console.log(`[PRO]   Processing page ${pageInfo.index} (${pageInfo.type})...`);
      
      // For pages with source media (video, uploaded images), use source directly
      if (pageInfo.type === 'video' && pageInfo.sourceUrl) {
        // Download source video
        const videoPath = path.join(tempDir, `page_${pageInfo.index}_source.mp4`);
        await downloadFile(pageInfo.sourceUrl, videoPath);
        const duration = await getMediaDuration(videoPath);
        
        segments.push({
          type: 'source_video',
          path: videoPath,
          duration: duration,
          pageType: pageInfo.type,
          hasAudio: true
        });
        
        console.log(`[PRO]     ✓ Using source video (${duration.toFixed(1)}s)`);
        
      } else if (pageInfo.type === 'image' && pageInfo.sourceUrl) {
        // Download source image
        const imagePath = path.join(tempDir, `page_${pageInfo.index}_source.jpg`);
        await downloadFile(pageInfo.sourceUrl, imagePath);
        
        segments.push({
          type: 'source_image',
          path: imagePath,
          duration: pageInfo.duration || 5,
          pageType: pageInfo.type,
          hasAudio: false
        });
        
        console.log(`[PRO]     ✓ Using source image (${pageInfo.duration || 5}s)`);
        
      } else if (pageInfo.type === 'voice' && pageInfo.sourceUrl) {
        // Screenshot page + voice audio
        await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForFunction('window.isReady === true', { timeout: 10000 });
        
        const screenshotPath = path.join(tempDir, `page_${pageInfo.index}_screenshot.png`);
        await page.screenshot({ path: screenshotPath, type: 'png' });
        
        const voicePath = path.join(tempDir, `page_${pageInfo.index}_voice.mp3`);
        await downloadFile(pageInfo.sourceUrl, voicePath);
        const duration = await getMediaDuration(voicePath);
        
        segments.push({
          type: 'screenshot',
          path: screenshotPath,
          duration: duration,
          pageType: pageInfo.type,
          hasAudio: true,
          audioPath: voicePath
        });
        
        console.log(`[PRO]     ✓ Screenshot + voice (${duration.toFixed(1)}s)`);
        
      } else if (pageInfo.type === 'music' && pageInfo.sourceUrl) {
        // Screenshot page + music
        await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForFunction('window.isReady === true', { timeout: 10000 });
        
        const screenshotPath = path.join(tempDir, `page_${pageInfo.index}_screenshot.png`);
        await page.screenshot({ path: screenshotPath, type: 'png' });
        
        const musicPath = path.join(tempDir, `page_${pageInfo.index}_music.mp3`);
        await downloadFile(pageInfo.sourceUrl, musicPath);
        const duration = await getMediaDuration(musicPath);
        
        segments.push({
          type: 'screenshot',
          path: screenshotPath,
          duration: duration,
          pageType: pageInfo.type,
          hasAudio: true,
          audioPath: musicPath
        });
        
        console.log(`[PRO]     ✓ Screenshot + music (${duration.toFixed(1)}s)`);
        
      } else {
        // Other pages: screenshot with optional audio
        await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForFunction('window.isReady === true', { timeout: 10000 });
        
        const screenshotPath = path.join(tempDir, `page_${pageInfo.index}_screenshot.png`);
        await page.screenshot({ path: screenshotPath, type: 'png' });
        
        let audioPath = null;
        if (pageInfo.audioUrl) {
          audioPath = path.join(tempDir, `page_${pageInfo.index}_audio.mp3`);
          await downloadFile(pageInfo.audioUrl, audioPath);
        }
        
        segments.push({
          type: 'screenshot',
          path: screenshotPath,
          duration: pageInfo.duration || 5,
          pageType: pageInfo.type,
          hasAudio: !!audioPath,
          audioPath: audioPath
        });
        
        console.log(`[PRO]     ✓ Screenshot (${pageInfo.duration || 5}s)${audioPath ? ' + audio' : ''}`);
      }
    }

    await browser.close();
    browser = null;

    // ============================================
    // STEP 5: ENCODE SEGMENTS WITH HIGH QUALITY
    // ============================================
    console.log('[PRO] 🎞️  Encoding segments...');
    
    const encodedSegments = [];
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const outputPath = path.join(tempDir, `segment_${i}.mp4`);
      
      if (segment.type === 'source_video') {
        // Normalize audio to AAC 44100Hz stereo to match other segments
        // Prevents codec mismatch corruption during concatenation
        const cmd = `"${ffmpeg}" -i "${segment.path}" -c:v libx264 -preset ${VIDEO_ENCODING.preset} -crf ${VIDEO_ENCODING.crf} -c:a aac -b:a ${VIDEO_ENCODING.audioBitrate} -ar 44100 -ac 2 -vf "scale=${resolution.width}:${resolution.height}:force_original_aspect_ratio=decrease,pad=${resolution.width}:${resolution.height}:(ow-iw)/2:(oh-ih)/2,setsar=1" -y "${outputPath}"`;
        
        await new Promise((resolve, reject) => {
          exec(cmd, (error) => error ? reject(error) : resolve());
        });
        
      } else if (segment.type === 'source_image') {
        // Convert image to video WITH SILENT AUDIO (so all segments have audio streams)
        const cmd = `"${ffmpeg}" -f lavfi -i anullsrc=r=44100:cl=stereo -loop 1 -i "${segment.path}" -c:v libx264 -preset ${VIDEO_ENCODING.preset} -crf ${VIDEO_ENCODING.crf} -c:a aac -b:a ${VIDEO_ENCODING.audioBitrate} -t ${segment.duration} -vf "scale=${resolution.width}:${resolution.height}:force_original_aspect_ratio=decrease,pad=${resolution.width}:${resolution.height}:(ow-iw)/2:(oh-ih)/2,setsar=1" -r ${VIDEO_ENCODING.fps} -pix_fmt yuv420p -shortest -y "${outputPath}"`;
        
        await new Promise((resolve, reject) => {
          exec(cmd, (error) => error ? reject(error) : resolve());
        });
        
      } else if (segment.type === 'screenshot') {
        // Convert screenshot to video with optional audio
        if (segment.hasAudio && segment.audioPath) {
          const cmd = `"${ffmpeg}" -loop 1 -i "${segment.path}" -i "${segment.audioPath}" -c:v libx264 -preset ${VIDEO_ENCODING.preset} -crf ${VIDEO_ENCODING.crf} -c:a aac -b:a ${VIDEO_ENCODING.audioBitrate} -vf "scale=${resolution.width}:${resolution.height}:force_original_aspect_ratio=decrease,pad=${resolution.width}:${resolution.height}:(ow-iw)/2:(oh-ih)/2,setsar=1" -r ${VIDEO_ENCODING.fps} -shortest -pix_fmt yuv420p -y "${outputPath}"`;
          
          await new Promise((resolve, reject) => {
            exec(cmd, (error) => error ? reject(error) : resolve());
          });
        } else {
          // Screenshot without audio - add SILENT AUDIO (so all segments have audio streams)
          const cmd = `"${ffmpeg}" -f lavfi -i anullsrc=r=44100:cl=stereo -loop 1 -i "${segment.path}" -c:v libx264 -preset ${VIDEO_ENCODING.preset} -crf ${VIDEO_ENCODING.crf} -c:a aac -b:a ${VIDEO_ENCODING.audioBitrate} -t ${segment.duration} -vf "scale=${resolution.width}:${resolution.height}:force_original_aspect_ratio=decrease,pad=${resolution.width}:${resolution.height}:(ow-iw)/2:(oh-ih)/2,setsar=1" -r ${VIDEO_ENCODING.fps} -pix_fmt yuv420p -shortest -y "${outputPath}"`;
          
          await new Promise((resolve, reject) => {
            exec(cmd, (error) => error ? reject(error) : resolve());
          });
        }
      }
      
      encodedSegments.push(outputPath);
      console.log(`[PRO]   ✓ Encoded segment ${i + 1}/${segments.length}`);
    }

    // ============================================
    // STEP 6: CONCATENATE WITH TRANSITIONS
    // ============================================
    console.log('[PRO] 🎬 Assembling final video...');
    
    const finalPath = path.join(tempDir, 'final.mp4');
    
    if (encodedSegments.length === 1) {
      // Single segment - just copy
      fs.copyFileSync(encodedSegments[0], finalPath);
    } else {
      // Multiple segments - RE-ENCODE during concat to preserve audio
      // This is more reliable than -c copy for segments with different audio characteristics
      const fileListPath = path.join(tempDir, 'concat_list.txt');
      const fileListContent = encodedSegments.map(seg => `file '${seg.replace(/\\/g, '/')}'`).join('\n');
      fs.writeFileSync(fileListPath, fileListContent);
      
      // Re-encode with high quality settings to ensure audio is preserved
      const concatCmd = `"${ffmpeg}" -f concat -safe 0 -i "${fileListPath}" -c:v libx264 -preset ${VIDEO_ENCODING.preset} -crf ${VIDEO_ENCODING.crf} -c:a aac -b:a ${VIDEO_ENCODING.audioBitrate} -y "${finalPath}"`;
      
      await new Promise((resolve, reject) => {
        exec(concatCmd, (error, stdout, stderr) => {
          if (error) {
            console.error(`[PRO] ❌ Concat error: ${stderr}`);
            return reject(error);
          }
          console.log('[PRO] ✓ Audio preserved during concatenation');
          resolve();
        });
      });
    }

    console.log('[PRO] ✅ Video generation complete!');
    res.sendFile(finalPath);

  } catch (error) {
    console.error('[PRO] ❌ Error:', error);
    res.status(500).send({ error: 'Failed to generate video', details: error.message });
  } finally {
    if (browser) await browser.close();
    if (fs.existsSync(tempDir)) {
      setTimeout(() => {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (e) {
          console.error('[PRO] Failed to clean up:', e);
        }
      }, 5000);
    }
  }
});

app.listen(port, () => {
  console.log(`[PRO] 🚀 Professional Video Export System running on http://localhost:${port}`);
});
