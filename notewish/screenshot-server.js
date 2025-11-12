const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const { exec } = require('child_process');
const ffmpeg = require('ffmpeg-static');
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

const app = express();
const port = 4000;

app.use(express.json());

app.post('/generate-video', async (req, res) => {
  const { cardId, url } = req.body;
  console.log(`Received request to generate video for cardId: ${cardId}`);

  if (!cardId || !url) {
    return res.status(400).send({ error: 'cardId and url are required' });
  }

  let browser;
  const tempDir = path.resolve(__dirname, `temp_${cardId}`);

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

    // 2. Restore SIMPLE and CORRECT page counting
    const userMessage = cardData.assets.messageVariations && cardData.assets.messageVariations.length > 0;
    let totalPages = 1; // Cover page
    if (cardData.assets.imageUrl && template.supports.image) totalPages++;
    if (cardData.assets.videoUrl && template.supports.video) totalPages++;
    if (cardData.assets.voiceUrl && template.supports.voice) totalPages++;
    if (userMessage && template.supports.message) totalPages++;
    if (cardData.assets.songUrl && template.supports.music) totalPages++;

    console.log(`Total pages calculated: ${totalPages}`);

    // 3. Launch Puppeteer
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    // Determine which pages have interactive content
    let pageIndex = 1;
    const imagePageIndex = cardData.assets.imageUrl && template.supports.image ? pageIndex++ : -1;
    const videoPageIndex = cardData.assets.videoUrl && template.supports.video ? pageIndex++ : -1;
    const voicePageIndex = cardData.assets.voiceUrl && template.supports.voice ? pageIndex++ : -1;
    
    console.log(`Image page index: ${imagePageIndex}`);
    console.log(`Video page index: ${videoPageIndex}`);
    console.log(`Voice page index: ${voicePageIndex}`);

    // Capture pages using screenshots or video recording
    const mediaFiles = [];
    for (let i = 0; i < totalPages; i++) {
      const pageUrl = `${url.replace('localhost', '127.0.0.1')}?page=${i}`;
      console.log(`Navigating to page ${i}: ${pageUrl}`);
      
      await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForFunction('window.isReady === true', { timeout: 10000 });

      // For interactive pages, we will record a silent video
      if (i === videoPageIndex || i === voicePageIndex) {
        const mediaType = i === videoPageIndex ? 'video' : 'voice';
        const mediaUrl = i === videoPageIndex ? cardData.assets.videoUrl : cardData.assets.voiceUrl;
        const silentClipPath = path.join(tempDir, `silent_clip_${i}.mp4`);
        console.log(`Recording SILENT ${mediaType} for page ${i}...`);

        const duration = await page.evaluate((url, type) => {
          return new Promise(resolve => {
            const mediaElement = document.createElement(type);
            mediaElement.src = url;
            mediaElement.addEventListener('loadedmetadata', () => resolve(mediaElement.duration));
          });
        }, mediaUrl, mediaType);
        
        console.log(`Media duration: ${duration}s`);

        // Click the play button to start the animation/playback
        await page.click('button');

        // Record screencast frames
        const frames = [];
        const client = await page.target().createCDPSession();
        client.on('Page.screencastFrame', async ({ data, sessionId }) => {
          frames.push(Buffer.from(data, 'base64'));
          try {
            await client.send('Page.screencastFrameAck', { sessionId });
          } catch (e) {}
        });
        await client.send('Page.startScreencast', { format: 'png', quality: 100 });

        await new Promise(resolve => setTimeout(resolve, Math.ceil(duration) * 1000));

        await client.send('Page.stopScreencast');

        // Convert frames to a silent video clip
        const framePattern = path.join(tempDir, `frame_${i}_%d.png`);
        frames.forEach((frame, index) => fs.writeFileSync(framePattern.replace('%d', index), frame));
        
        const ffmpegCommand = `"${ffmpeg}" -framerate 25 -i "${framePattern}" -c:v libx264 -pix_fmt yuv420p -y "${silentClipPath}"`;
        await new Promise((resolve, reject) => {
          exec(ffmpegCommand, (error, stdout, stderr) => {
            if (error) {
              console.error(`FFmpeg frame merge error: ${stderr}`);
              return reject(error);
            }
            resolve();
          });
        });

        mediaFiles.push({ type: 'video', path: silentClipPath, duration: duration, mediaUrl: mediaUrl, mediaType: mediaType });

      } else {
        // Screenshot for static pages
        const screenshotPath = path.join(tempDir, `frame_${i}.png`);
        
        try {
          const cardElement = await page.$('[data-template-root="true"]');
          if (cardElement) {
            await cardElement.screenshot({ path: screenshotPath });
            console.log(`Captured element screenshot for page ${i}`);
          } else {
            console.warn(`Element not found on page ${i}, using full page screenshot`);
            await page.screenshot({ path: screenshotPath });
          }
        } catch (err) {
          console.error(`Element screenshot failed for page ${i}, using full page:`, err.message);
          await page.screenshot({ path: screenshotPath });
        }
        
        mediaFiles.push({ type: 'image', path: screenshotPath, duration: 6 });
      }
    }

    // Compose all media files (images and video) into final output
    console.log('Composing media files:', mediaFiles);
    
    // First, convert images to video clips
    const videoClips = [];
    let totalDuration = 0;
    for (let i = 0; i < mediaFiles.length; i++) {
      const media = mediaFiles[i];
      const clipPath = path.join(tempDir, `clip_${i}.mp4`);

      if (media.type === 'image') {
        const imageToVideoCmd = `"${ffmpeg}" -loop 1 -i "${media.path}" -c:v libx264 -t ${media.duration} -pix_fmt yuv420p -vf "scale=1280:720,setsar=1" -y "${clipPath}"`;
        await new Promise((resolve, reject) => {
          exec(imageToVideoCmd, (error) => {
            if (error) return reject(error);
            resolve();
          });
        });
      } else {
        fs.renameSync(media.path, clipPath);
      }
      videoClips.push({ path: clipPath, duration: media.duration, mediaUrl: media.mediaUrl, mediaType: media.mediaType });
      totalDuration += media.duration;
    }
    
    // Create concat file for all video clips
    const fileListPath = path.join(tempDir, 'filelist.txt');
    const fileListContent = videoClips.map(clip => `file '${clip.path.replace(/\\/g, '/')}'`).join('\n');
    
    fs.writeFileSync(fileListPath, fileListContent);
    console.log('Created file list for concat demuxer');

    // Concatenate all clips into final video
    const videoPath = path.join(tempDir, 'output.mp4');
    const ffmpegCommand = `"${ffmpeg}" -f concat -safe 0 -i "${fileListPath}" -c copy -y "${videoPath}"`;
    
    await new Promise((resolve, reject) => {
      exec(ffmpegCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`FFmpeg video concat error: ${stderr}`);
          return reject(error);
        }
        console.log('FFmpeg video created successfully');
        resolve();
      });
    });

    if (cardData.assets.songUrl) {
      console.log('Adding audio...');
      const finalVideoPath = path.join(tempDir, 'final.mp4');
      let audioInputs = `-i "${videoPath}"`;
      let filterComplex = ``;
      let inputIndex = 1;
      let currentTime = 0;
      const audioStreams = [];

      // Add background music
      audioInputs += ` -i "${cardData.assets.songUrl}"`;
      filterComplex += `[${inputIndex}:a]volume=0.5[a${inputIndex}];`;
      audioStreams.push(`[a${inputIndex}]`);
      inputIndex++;

      // Add video/voice audio at the correct timestamps
      for (const clip of videoClips) {
        if (clip.mediaUrl) {
          audioInputs += ` -i "${clip.mediaUrl}"`;
          filterComplex += `[${inputIndex}:a]adelay=${currentTime * 1000}|${currentTime * 1000}[a${inputIndex}];`;
          audioStreams.push(`[a${inputIndex}]`);
          inputIndex++;
        }
        currentTime += clip.duration;
      }

      // Mix all audio streams together
      filterComplex += `${audioStreams.join('')}amix=inputs=${audioStreams.length}[a]`;

      const audioCommand = `"${ffmpeg}" ${audioInputs} -map 0:v -filter_complex "${filterComplex}" -map "[a]" -c:v copy -c:a aac -y "${finalVideoPath}"`;
      
      await new Promise((resolve, reject) => {
        exec(audioCommand, (error, stdout, stderr) => {
          if (error) {
            console.error(`FFmpeg audio mixing error: ${stderr}`);
            return reject(error);
          }
          console.log('Audio mixed successfully');
          resolve();
        });
      });

      res.sendFile(finalVideoPath);
    } else {
      console.log('No background music, sending video without audio');
      res.sendFile(videoPath);
    }
  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).send({ error: 'Failed to generate video', details: error.message });
  } finally {
    if (browser) await browser.close();
    if (fs.existsSync(tempDir)) {
      setTimeout(() => {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (e) {
          console.error('Failed to clean up temp directory:', e);
        }
      }, 5000); // Delay cleanup to ensure file is sent
    }
  }
});

app.listen(port, () => {
  console.log(`Video generation server listening at http://localhost:${port}`);
});
