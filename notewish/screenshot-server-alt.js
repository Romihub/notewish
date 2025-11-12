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

async function getCardFromFirestore(cardId) {
  const docRef = db.collection('cards').doc(cardId);
  const doc = await docRef.get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() };
}

// Helper to download a file from URL
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

// Helper to get media duration
async function getMediaDuration(filepath) {
  return new Promise((resolve, reject) => {
    const cmd = `"${ffmpeg}" -i "${filepath}" 2>&1`;
    exec(cmd, (error, stdout, stderr) => {
      const output = stdout + stderr;
      const match = output.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/);
      if (match) {
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const seconds = parseFloat(match[3]);
        const duration = hours * 3600 + minutes * 60 + seconds;
        resolve(duration);
      } else {
        reject(new Error('Could not determine duration'));
      }
    });
  });
}

const app = express();
const port = 4001; // Different port for testing

app.use(express.json());

app.post('/generate-video', async (req, res) => {
  const { cardId, url } = req.body;
  console.log(`[ALT] Received request to generate video for cardId: ${cardId}`);

  if (!cardId || !url) {
    return res.status(400).send({ error: 'cardId and url are required' });
  }

  let browser;
  const tempDir = path.resolve(__dirname, `temp_alt_${cardId}`);

  try {
    // 1. Get Card Data
    const cardData = await getCardFromFirestore(cardId);
    if (!cardData) {
      return res.status(404).send({ error: 'Card not found' });
    }
    
    const template = getTemplateById(cardData.templateId);
    if (!template) {
      return res.status(404).send({ error: 'Template not found' });
    }

    // 2. Calculate pages
    const userMessage = cardData.assets.messageVariations && cardData.assets.messageVariations.length > 0;
    let totalPages = 1; // Cover page
    if (cardData.assets.imageUrl && template.supports.image) totalPages++;
    if (cardData.assets.videoUrl && template.supports.video) totalPages++;
    if (cardData.assets.voiceUrl && template.supports.voice) totalPages++;
    if (userMessage && template.supports.message) totalPages++;
    if (cardData.assets.songUrl && template.supports.music) totalPages++;

    console.log(`[ALT] Total pages: ${totalPages}`);

    // 3. Launch Puppeteer
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    // Determine page indices - track what content is on each page
    let pageIndex = 1;
    const pageTypes = { 0: 'cover' }; // Page 0 is always cover
    
    const imagePageIndex = cardData.assets.imageUrl && template.supports.image ? pageIndex : -1;
    if (imagePageIndex !== -1) pageTypes[pageIndex++] = 'image';
    
    const videoPageIndex = cardData.assets.videoUrl && template.supports.video ? pageIndex : -1;
    if (videoPageIndex !== -1) pageTypes[pageIndex++] = 'video';
    
    const voicePageIndex = cardData.assets.voiceUrl && template.supports.voice ? pageIndex : -1;
    if (voicePageIndex !== -1) pageTypes[pageIndex++] = 'voice';
    
    const messagePageIndex = userMessage && template.supports.message ? pageIndex : -1;
    if (messagePageIndex !== -1) pageTypes[pageIndex++] = 'message';
    
    const musicPageIndex = cardData.assets.songUrl && template.supports.music ? pageIndex : -1;
    if (musicPageIndex !== -1) pageTypes[pageIndex++] = 'music';
    
    console.log(`[ALT] Page types:`, pageTypes);

    // 4. Collect media for each page
    const mediaFiles = [];
    
    for (let i = 0; i < totalPages; i++) {
      const pageUrl = `${url.replace('localhost', '127.0.0.1')}?page=${i}`;
      console.log(`[ALT] Processing page ${i}: ${pageUrl}`);
      
      await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForFunction('window.isReady === true', { timeout: 10000 });

      const pageType = pageTypes[i] || 'static';
      
      // VIDEO PAGE: Use source video with its own audio ONLY
      if (i === videoPageIndex) {
        console.log(`[ALT] VIDEO page ${i} - using source video`);
        const videoPath = path.join(tempDir, `video_${i}.mp4`);
        await downloadFile(cardData.assets.videoUrl, videoPath);
        const duration = await getMediaDuration(videoPath);
        
        mediaFiles.push({ 
          type: 'video', 
          path: videoPath, 
          duration: duration,
          pageType: 'video',
          audioUrl: cardData.assets.videoUrl // Video has its own audio
        });
      }
      // VOICE PAGE: Screenshot + voice audio ONLY
      else if (i === voicePageIndex) {
        console.log(`[ALT] Creating voice page for page ${i}`);
        const screenshotPath = path.join(tempDir, `frame_${i}.png`);
        
        try {
          const cardElement = await page.$('[data-template-root="true"]');
          if (cardElement) {
            await cardElement.screenshot({ path: screenshotPath });
          } else {
            await page.screenshot({ path: screenshotPath });
          }
        } catch (err) {
          await page.screenshot({ path: screenshotPath });
        }
        
        // Download voice file to get duration
        const voicePath = path.join(tempDir, `voice_${i}.mp3`);
        await downloadFile(cardData.assets.voiceUrl, voicePath);
        const duration = await getMediaDuration(voicePath);
        
        mediaFiles.push({ 
          type: 'image', 
          path: screenshotPath, 
          duration: duration,
          pageType: 'voice',
          audioUrl: cardData.assets.voiceUrl // Voice plays on its own
        });
      }
      // MESSAGE PAGE: Screenshot + background music ONLY for this page
      else if (i === messagePageIndex) {
        console.log(`[ALT] MESSAGE page ${i}`);
        const screenshotPath = path.join(tempDir, `frame_${i}.png`);
        
        try {
          const cardElement = await page.$('[data-template-root="true"]');
          if (cardElement) {
            await cardElement.screenshot({ path: screenshotPath });
          } else {
            await page.screenshot({ path: screenshotPath });
          }
        } catch (err) {
          await page.screenshot({ path: screenshotPath });
        }
        
        // Message page plays with background music
        mediaFiles.push({ 
          type: 'image', 
          path: screenshotPath, 
          duration: 6, // Standard duration for message page
          pageType: 'message',
          audioUrl: cardData.assets.songUrl // BG music plays ONLY on message page
        });
      }
      // MUSIC PAGE: Screenshot + full music track
      else if (i === musicPageIndex) {
        console.log(`[ALT] MUSIC page ${i}`);
        const screenshotPath = path.join(tempDir, `frame_${i}.png`);
        
        try {
          const cardElement = await page.$('[data-template-root="true"]');
          if (cardElement) {
            await cardElement.screenshot({ path: screenshotPath });
          } else {
            await page.screenshot({ path: screenshotPath });
          }
        } catch (err) {
          await page.screenshot({ path: screenshotPath });
        }
        
        // Get music duration
        const musicPath = path.join(tempDir, `music_${i}.mp3`);
        await downloadFile(cardData.assets.songUrl, musicPath);
        const duration = await getMediaDuration(musicPath);
        
        mediaFiles.push({ 
          type: 'image', 
          path: screenshotPath, 
          duration: duration,
          pageType: 'music',
          audioUrl: cardData.assets.songUrl // Full music plays on music page
        });
      }
      // STATIC PAGES (cover, image): Silent
      else {
        console.log(`[ALT] Screenshot for static page ${i}`);
        const screenshotPath = path.join(tempDir, `frame_${i}.png`);
        
        try {
          const cardElement = await page.$('[data-template-root="true"]');
          if (cardElement) {
            await cardElement.screenshot({ path: screenshotPath });
          } else {
            await page.screenshot({ path: screenshotPath });
          }
        } catch (err) {
          await page.screenshot({ path: screenshotPath });
        }
        
        mediaFiles.push({ 
          type: 'image', 
          path: screenshotPath, 
          duration: 6,
          pageType: 'static',
          audioUrl: null // Silent
        });
      }
    }

    console.log(`[ALT] Collected ${mediaFiles.length} media files`);

    // 5. Convert all to video clips
    const videoClips = [];
    
    for (let i = 0; i < mediaFiles.length; i++) {
      const media = mediaFiles[i];
      const clipPath = path.join(tempDir, `clip_${i}.mp4`);

      if (media.type === 'image') {
        // Convert image to video clip (silent)
        const cmd = `"${ffmpeg}" -loop 1 -i "${media.path}" -c:v libx264 -t ${media.duration} -pix_fmt yuv420p -vf "scale=1280:720,setsar=1" -y "${clipPath}"`;
        await new Promise((resolve, reject) => {
          exec(cmd, (error) => {
            if (error) return reject(error);
            resolve();
          });
        });
        console.log(`[ALT] Converted image ${i} to video`);
      } else if (media.type === 'video') {
        // For video: DON'T re-encode! Just copy to preserve quality and lip-sync
        const cmd = `"${ffmpeg}" -i "${media.path}" -c:v copy -c:a copy -y "${clipPath}"`;
        await new Promise((resolve, reject) => {
          exec(cmd, (error) => {
            if (error) {
              // If copy fails, try with minimal re-encoding
              console.log(`[ALT] Copy failed, trying with re-encode for video ${i}`);
              const reencodeCmd = `"${ffmpeg}" -i "${media.path}" -c:v libx264 -c:a aac -y "${clipPath}"`;
              exec(reencodeCmd, (error2) => {
                if (error2) return reject(error2);
                resolve();
              });
            } else {
              resolve();
            }
          });
        });
        console.log(`[ALT] Copied video ${i} (preserved quality)`);
      }
      
      videoClips.push({ 
        path: clipPath, 
        duration: media.duration,
        pageType: media.pageType,
        audioUrl: media.audioUrl
      });
    }

    // 6. Concatenate all video clips
    const fileListPath = path.join(tempDir, 'filelist.txt');
    const fileListContent = videoClips.map(clip => `file '${clip.path.replace(/\\/g, '/')}'`).join('\n');
    fs.writeFileSync(fileListPath, fileListContent);

    const videoPath = path.join(tempDir, 'output.mp4');
    const concatCmd = `"${ffmpeg}" -f concat -safe 0 -i "${fileListPath}" -c copy -y "${videoPath}"`;
    
    await new Promise((resolve, reject) => {
      exec(concatCmd, (error, stdout, stderr) => {
        if (error) {
          console.error(`[ALT] Concat error: ${stderr}`);
          return reject(error);
        }
        resolve();
      });
    });
    
    console.log(`[ALT] Concatenated all clips`);

    // 7. Add audio to each segment individually (NO global background music)
    console.log('[ALT] Adding audio to each segment...');
    const finalVideoPath = path.join(tempDir, 'final.mp4');
    
    // Download all audio files that segments need
    for (let i = 0; i < videoClips.length; i++) {
      const clip = videoClips[i];
      
      if (clip.audioUrl) {
        // This segment has audio - download it if needed
        const audioPath = path.join(tempDir, `audio_${i}.mp3`);
        if (!fs.existsSync(audioPath)) {
          await downloadFile(clip.audioUrl, audioPath);
        }
      }
    }
    
    // Use a simpler approach: Create video segments with audio, then concat
    const segmentsWithAudio = [];
    for (let i = 0; i < videoClips.length; i++) {
      const clip = videoClips[i];
      const segmentPath = path.join(tempDir, `segment_${i}.mp4`);
      
      if (clip.audioUrl) {
        // Add audio to this segment
        const audioPath = path.join(tempDir, `audio_${i}.mp3`);
        const cmd = `"${ffmpeg}" -i "${clip.path}" -i "${audioPath}" -c:v copy -c:a aac -shortest -y "${segmentPath}"`;
        await new Promise((resolve, reject) => {
          exec(cmd, (error, stdout, stderr) => {
            if (error) {
              console.error(`[ALT] Error adding audio to segment ${i}: ${stderr}`);
              // If adding audio fails, just use the clip without audio
              fs.copyFileSync(clip.path, segmentPath);
              resolve();
            } else {
              resolve();
            }
          });
        });
        console.log(`[ALT] Added audio to segment ${i} (${clip.pageType})`);
      } else {
        // No audio for this segment - add SILENT audio so all segments have same streams
        const cmd = `"${ffmpeg}" -f lavfi -i anullsrc=r=44100:cl=stereo -i "${clip.path}" -c:v copy -c:a aac -shortest -y "${segmentPath}"`;
        await new Promise((resolve, reject) => {
          exec(cmd, (error, stdout, stderr) => {
            if (error) {
              console.error(`[ALT] Error adding silent audio to segment ${i}: ${stderr}`);
              // If that fails, just copy without audio
              fs.copyFileSync(clip.path, segmentPath);
              resolve();
            } else {
              resolve();
            }
          });
        });
        console.log(`[ALT] Segment ${i} is silent (${clip.pageType})`);
      }
      
      segmentsWithAudio.push(segmentPath);
    }
    
    // Concatenate all segments
    const finalListPath = path.join(tempDir, 'final_list.txt');
    const finalListContent = segmentsWithAudio.map(seg => `file '${seg.replace(/\\/g, '/')}'`).join('\n');
    fs.writeFileSync(finalListPath, finalListContent);
    
    const finalConcatCmd = `"${ffmpeg}" -f concat -safe 0 -i "${finalListPath}" -c copy -y "${finalVideoPath}"`;
    await new Promise((resolve, reject) => {
      exec(finalConcatCmd, (error, stdout, stderr) => {
        if (error) {
          console.error(`[ALT] Final concat error: ${stderr}`);
          return reject(error);
        }
        resolve();
      });
    });
    
    console.log('[ALT] Video created successfully with per-segment audio!');
    res.sendFile(finalVideoPath);

  } catch (error) {
    console.error('[ALT] Video generation error:', error);
    res.status(500).send({ error: 'Failed to generate video', details: error.message });
  } finally {
    if (browser) await browser.close();
    if (fs.existsSync(tempDir)) {
      setTimeout(() => {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (e) {
          console.error('[ALT] Failed to clean up temp directory:', e);
        }
      }, 5000);
    }
  }
});

app.listen(port, () => {
  console.log(`[ALT] Video generation server listening at http://localhost:${port}`);
});
